import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock auth
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ username: 'admin' }),
}));

// Mock database
vi.mock('@/lib/database', () => ({
  dbAll: vi.fn(),
  dbGet: vi.fn(),
}));

import { requireAuth } from '@/lib/auth';
import { dbAll, dbGet } from '@/lib/database';

const mockedRequireAuth = vi.mocked(requireAuth);
const mockedDbAll = vi.mocked(dbAll);
const mockedDbGet = vi.mocked(dbGet);

describe('Scheduler Logs API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireAuth.mockResolvedValue({ username: 'admin' });
  });

  it('returns logs with default pagination (limit=20, offset=0)', async () => {
    const mockLogs = [
      { id: 1, record_id: 1, old_ip: '1.1.1.1', new_ip: '2.2.2.2', status: 'success', record_name: 'test.example.com', record_type: 'A', zone_name: 'example.com' },
    ];
    mockedDbAll.mockResolvedValueOnce(mockLogs);
    mockedDbGet.mockResolvedValueOnce({ total: 1 });

    const { GET } = await import('@/app/api/scheduler/logs/route');
    const request = new NextRequest('http://localhost/api/scheduler/logs');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.logs).toEqual(mockLogs);
    expect(data.total).toBe(1);
    expect(mockedDbAll).toHaveBeenCalledWith(expect.any(String), [20, 0]);
  });

  it('respects custom limit and offset query params', async () => {
    mockedDbAll.mockResolvedValueOnce([]);
    mockedDbGet.mockResolvedValueOnce({ total: 0 });

    const { GET } = await import('@/app/api/scheduler/logs/route');
    const request = new NextRequest('http://localhost/api/scheduler/logs?limit=10&offset=5');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockedDbAll).toHaveBeenCalledWith(expect.any(String), [10, 5]);
  });

  it('caps limit at 100 max', async () => {
    mockedDbAll.mockResolvedValueOnce([]);
    mockedDbGet.mockResolvedValueOnce({ total: 0 });

    const { GET } = await import('@/app/api/scheduler/logs/route');
    const request = new NextRequest('http://localhost/api/scheduler/logs?limit=500');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockedDbAll).toHaveBeenCalledWith(expect.any(String), [100, 0]);
  });

  it('returns 401 when auth fails', async () => {
    mockedRequireAuth.mockRejectedValue(new Error('Authentication required'));

    const { GET } = await import('@/app/api/scheduler/logs/route');
    const request = new NextRequest('http://localhost/api/scheduler/logs');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('인증이 필요합니다.');
  });

  it('returns 0 total when totalResult is null', async () => {
    mockedDbAll.mockResolvedValueOnce([]);
    mockedDbGet.mockResolvedValueOnce(null);

    const { GET } = await import('@/app/api/scheduler/logs/route');
    const request = new NextRequest('http://localhost/api/scheduler/logs');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.total).toBe(0);
  });

  it('returns 500 on database error', async () => {
    mockedDbAll.mockRejectedValue(new Error('Database connection failed'));

    const { GET } = await import('@/app/api/scheduler/logs/route');
    const request = new NextRequest('http://localhost/api/scheduler/logs');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('스케줄러 로그 조회 중 오류가 발생했습니다.');
  });
});
