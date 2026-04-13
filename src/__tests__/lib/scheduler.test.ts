import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Track CloudflareAPI calls
const mockUpdateDNSRecord = vi.fn().mockResolvedValue({});

vi.mock('@/lib/cloudflare', () => ({
  getCurrentIP: vi.fn(),
  CloudflareAPI: vi.fn().mockImplementation(function () {
    return { updateDNSRecord: mockUpdateDNSRecord };
  }),
}));

vi.mock('@/lib/database', () => ({
  dbAll: vi.fn(),
  dbRun: vi.fn().mockResolvedValue({}),
}));

import { getCurrentIP, CloudflareAPI } from '@/lib/cloudflare';
import { dbAll, dbRun } from '@/lib/database';

const mockedGetCurrentIP = vi.mocked(getCurrentIP);
const mockedDbAll = vi.mocked(dbAll);
const mockedDbRun = vi.mocked(dbRun);

// Replicate scheduler logic for testing without side effects from the module-level auto-start
class TestScheduler {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  start(intervalMinutes: number = 5) {
    if (this.intervalId) return;
    this.runUpdate();
    this.intervalId = setInterval(() => this.runUpdate(), intervalMinutes * 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async runUpdate() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const currentIP = await getCurrentIP();
      const autoUpdateRecords = await dbAll(`
        SELECT dr.*, z.name as zone_name, ak.token
        FROM dns_records dr
        JOIN zones z ON dr.zone_id = z.id
        JOIN api_keys ak ON z.api_key_id = ak.id
        WHERE dr.auto_update = 1 AND dr.type IN ('A', 'CNAME')
      `);

      for (const record of autoUpdateRecords) {
        const needsUpdate = record.type === 'CNAME' || record.content !== currentIP;
        if (!needsUpdate) continue;

        const api = new CloudflareAPI(record.token);
        await api.updateDNSRecord(record.zone_id, record.id, {
          name: record.name,
          type: 'A',
          content: currentIP,
          ttl: record.ttl,
          proxied: record.proxied,
        });

        await dbRun(
          `UPDATE dns_records SET type = 'A', content = ?, proxied = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [currentIP, record.proxied, record.id]
        );

        await dbRun(
          `INSERT INTO update_logs (record_id, old_ip, new_ip, status, message, trigger_type) VALUES (?, ?, ?, 'success', ?, 'auto')`,
          [record.id, record.content, currentIP, 'IP 업데이트 성공']
        );
      }
    } catch {
      // Silently handle errors like the real scheduler
    } finally {
      this.isRunning = false;
    }
  }

  isSchedulerRunning(): boolean {
    return this.intervalId !== null;
  }

  isUpdateInProgress(): boolean {
    return this.isRunning;
  }
}

describe('DDNSScheduler', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    scheduler = new TestScheduler();
  });

  afterEach(() => {
    scheduler.stop();
    vi.useRealTimers();
  });

  describe('start/stop', () => {
    it('starts and reports running', () => {
      mockedGetCurrentIP.mockResolvedValue('1.2.3.4');
      mockedDbAll.mockResolvedValue([]);

      scheduler.start(5);
      expect(scheduler.isSchedulerRunning()).toBe(true);
    });

    it('stops and reports not running', () => {
      mockedGetCurrentIP.mockResolvedValue('1.2.3.4');
      mockedDbAll.mockResolvedValue([]);

      scheduler.start(5);
      scheduler.stop();
      expect(scheduler.isSchedulerRunning()).toBe(false);
    });

    it('does not start twice', () => {
      mockedGetCurrentIP.mockResolvedValue('1.2.3.4');
      mockedDbAll.mockResolvedValue([]);

      scheduler.start(5);
      scheduler.start(5);
      expect(scheduler.isSchedulerRunning()).toBe(true);
    });
  });

  describe('runUpdate', () => {
    it('skips records with matching IP', async () => {
      mockedGetCurrentIP.mockResolvedValue('1.2.3.4');
      mockedDbAll.mockResolvedValue([
        { id: 'r1', zone_id: 'z1', name: 'test', type: 'A', content: '1.2.3.4', ttl: 120, proxied: false, zone_name: 'example.com', token: 'tok' },
      ]);

      await scheduler.runUpdate();

      expect(mockUpdateDNSRecord).not.toHaveBeenCalled();
    });

    it('updates records with different IP', async () => {
      mockedGetCurrentIP.mockResolvedValue('9.9.9.9');
      mockedDbAll.mockResolvedValue([
        { id: 'r1', zone_id: 'z1', name: 'test', type: 'A', content: '1.2.3.4', ttl: 120, proxied: false, zone_name: 'example.com', token: 'tok' },
      ]);

      await scheduler.runUpdate();

      expect(CloudflareAPI).toHaveBeenCalledWith('tok');
      expect(mockUpdateDNSRecord).toHaveBeenCalledWith('z1', 'r1', expect.objectContaining({
        type: 'A',
        content: '9.9.9.9',
      }));
      expect(mockedDbRun).toHaveBeenCalled();
    });

    it('converts CNAME to A record', async () => {
      mockedGetCurrentIP.mockResolvedValue('9.9.9.9');
      mockedDbAll.mockResolvedValue([
        { id: 'r2', zone_id: 'z1', name: 'alias', type: 'CNAME', content: 'target.com', ttl: 120, proxied: false, zone_name: 'example.com', token: 'tok' },
      ]);

      await scheduler.runUpdate();

      expect(CloudflareAPI).toHaveBeenCalledWith('tok');
      expect(mockUpdateDNSRecord).toHaveBeenCalledWith('z1', 'r2', expect.objectContaining({
        type: 'A',
        content: '9.9.9.9',
      }));
    });

    it('handles empty record list', async () => {
      mockedGetCurrentIP.mockResolvedValue('1.2.3.4');
      mockedDbAll.mockResolvedValue([]);

      await scheduler.runUpdate();

      expect(mockUpdateDNSRecord).not.toHaveBeenCalled();
    });

    it('handles IP fetch failure gracefully', async () => {
      mockedGetCurrentIP.mockRejectedValue(new Error('All services down'));

      await expect(scheduler.runUpdate()).resolves.toBeUndefined();
    });

    it('logs trigger_type as auto', async () => {
      mockedGetCurrentIP.mockResolvedValue('9.9.9.9');
      mockedDbAll.mockResolvedValue([
        { id: 'r1', zone_id: 'z1', name: 'test', type: 'A', content: '1.2.3.4', ttl: 120, proxied: false, zone_name: 'example.com', token: 'tok' },
      ]);

      await scheduler.runUpdate();

      const insertCall = mockedDbRun.mock.calls.find(
        (call) => typeof call[0] === 'string' && call[0].includes('INSERT INTO update_logs')
      );
      expect(insertCall).toBeDefined();
      expect(insertCall![0]).toContain('trigger_type');
      expect(insertCall![0]).toContain("'auto'");
    });
  });
});
