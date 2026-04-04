import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock auth
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ username: 'admin' }),
}));

// Mock database
vi.mock('@/lib/database', () => ({
  dbAll: vi.fn(),
  dbRun: vi.fn().mockResolvedValue({ lastID: 1 }),
}));

import { requireAuth } from '@/lib/auth';
import { dbAll, dbRun } from '@/lib/database';

const mockedRequireAuth = vi.mocked(requireAuth);
const mockedDbAll = vi.mocked(dbAll);
const mockedDbRun = vi.mocked(dbRun);

describe('Export API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireAuth.mockResolvedValue({ username: 'admin' });
  });

  it('masks API tokens in export', async () => {
    mockedDbAll
      .mockResolvedValueOnce([{ id: 1, token: 'sk-1234567890abcdef', name: 'Test', created_at: '2025-01-01' }]) // apiKeys
      .mockResolvedValueOnce([]) // zones
      .mockResolvedValueOnce([]) // records
      .mockResolvedValueOnce([]) // settings
      .mockResolvedValueOnce([]); // logs

    // Dynamically import the route handler
    const { GET } = await import('@/app/api/export/route');
    const request = new Request('http://localhost/api/export');
    const response = await GET(request);
    const data = await response.json();

    expect(data.data.apiKeys[0].token).toBe('****cdef');
    expect(data.data.apiKeys[0].token).not.toContain('sk-1234567890');
  });

  it('returns 500 on auth failure (export does not distinguish auth errors)', async () => {
    mockedRequireAuth.mockRejectedValue(new Error('Authentication required'));

    const { GET } = await import('@/app/api/export/route');
    const request = new Request('http://localhost/api/export');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});

describe('Import API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRequireAuth.mockResolvedValue({ username: 'admin' });
    mockedDbRun.mockResolvedValue({ lastID: 1 });
  });

  it('imports valid data', async () => {
    const { POST } = await import('@/app/api/import/route');
    const request = new Request('http://localhost/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          apiKeys: [{ id: 1, token: 'real-token', created_at: '2025-01-01' }],
          zones: [],
          records: [],
          settings: [],
        },
      }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.imported.apiKeys).toBe(1);
  });

  it('skips masked tokens during import', async () => {
    const { POST } = await import('@/app/api/import/route');
    const request = new Request('http://localhost/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          apiKeys: [{ id: 1, token: '****cdef', created_at: '2025-01-01' }],
          zones: [],
          records: [],
          settings: [],
        },
      }),
    });

    const response = await POST(request);
    await response.json();

    // dbRun should NOT have been called for masked token
    const dbRunCalls = mockedDbRun.mock.calls.filter(call =>
      typeof call[0] === 'string' && call[0].includes('api_keys')
    );
    expect(dbRunCalls).toHaveLength(0);
  });

  it('rejects request without data field', async () => {
    const { POST } = await import('@/app/api/import/route');
    const request = new Request('http://localhost/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('rejects invalid JSON', async () => {
    const { POST } = await import('@/app/api/import/route');
    const request = new Request('http://localhost/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{{{',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
