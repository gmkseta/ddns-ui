import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { CloudflareAPI, getCurrentIP } from '@/lib/cloudflare';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('CloudflareAPI', () => {
  let api: CloudflareAPI;

  beforeEach(() => {
    vi.clearAllMocks();
    api = new CloudflareAPI('test-token');
  });

  describe('getZones', () => {
    it('returns zones on success', async () => {
      const mockZones = [{ id: 'z1', name: 'example.com', status: 'active' }];
      mockedAxios.get.mockResolvedValue({
        data: { success: true, result: mockZones },
      });

      const zones = await api.getZones();
      expect(zones).toEqual(mockZones);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/zones',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('throws on API error', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { success: false, errors: [{ message: 'Invalid token' }] },
      });

      await expect(api.getZones()).rejects.toThrow('Cloudflare API Error: Invalid token');
    });

    it('throws on network error', async () => {
      const axiosError = Object.assign(new Error('Network Error'), { isAxiosError: true });
      mockedAxios.get.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(api.getZones()).rejects.toThrow('Failed to fetch zones');
    });
  });

  describe('getDNSRecords', () => {
    it('returns DNS records on success', async () => {
      const mockRecords = [{ id: 'r1', name: 'sub.example.com', type: 'A', content: '1.2.3.4' }];
      mockedAxios.get.mockResolvedValue({
        data: { success: true, result: mockRecords },
      });

      const records = await api.getDNSRecords('z1');
      expect(records).toEqual(mockRecords);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/zones/z1/dns_records',
        expect.any(Object)
      );
    });
  });

  describe('createDNSRecord', () => {
    it('creates a record with defaults', async () => {
      const mockResult = { id: 'r2', name: 'new.example.com', type: 'A', content: '5.6.7.8' };
      mockedAxios.post.mockResolvedValue({
        data: { success: true, result: mockResult },
      });

      const result = await api.createDNSRecord('z1', {
        name: 'new.example.com',
        type: 'A',
        content: '5.6.7.8',
      });

      expect(result).toEqual(mockResult);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/zones/z1/dns_records',
        expect.objectContaining({
          name: 'new.example.com',
          type: 'A',
          content: '5.6.7.8',
          ttl: 120,
          proxied: false,
        }),
        expect.any(Object)
      );
    });
  });

  describe('updateDNSRecord', () => {
    it('updates a record', async () => {
      const mockResult = { id: 'r1', name: 'sub.example.com', type: 'A', content: '9.9.9.9' };
      mockedAxios.put.mockResolvedValue({
        data: { success: true, result: mockResult },
      });

      const result = await api.updateDNSRecord('z1', 'r1', {
        name: 'sub.example.com',
        type: 'A',
        content: '9.9.9.9',
        ttl: 300,
        proxied: true,
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteDNSRecord', () => {
    it('deletes a record', async () => {
      mockedAxios.delete.mockResolvedValue({
        data: { success: true },
      });

      await expect(api.deleteDNSRecord('z1', 'r1')).resolves.toBeUndefined();
    });

    it('throws on API error', async () => {
      mockedAxios.delete.mockResolvedValue({
        data: { success: false, errors: [{ message: 'Record not found' }] },
      });

      await expect(api.deleteDNSRecord('z1', 'r1')).rejects.toThrow('Cloudflare API Error');
    });
  });
});

describe('getCurrentIP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns IP from first successful service', async () => {
    mockedAxios.get.mockResolvedValue({ data: '  1.2.3.4  ' });

    const ip = await getCurrentIP();
    expect(ip).toBe('1.2.3.4');
  });

  it('falls back to next service on failure', async () => {
    mockedAxios.get
      .mockRejectedValueOnce(new Error('Service 1 down'))
      .mockResolvedValueOnce({ data: '5.6.7.8\n' });

    const ip = await getCurrentIP();
    expect(ip).toBe('5.6.7.8');
  });

  it('throws when all services fail', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Service down'));

    await expect(getCurrentIP()).rejects.toThrow('Failed to get current IP from all services');
  });
});
