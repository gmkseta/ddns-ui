import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock jose before importing auth module
vi.mock('jose', () => {
  class MockSignJWT {
    constructor() {}
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    async sign() { return 'mock-jwt-token'; }
  }
  return {
    SignJWT: MockSignJWT,
    jwtVerify: vi.fn(),
  };
});

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

import { hashPassword, verifyPassword, createToken, verifyToken, validateAdminCredentials } from '@/lib/auth';
import { jwtVerify } from 'jose';

const mockedJwtVerify = vi.mocked(jwtVerify);

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hashPassword / verifyPassword', () => {
    it('hashes and verifies a password', async () => {
      const password = 'test-password-123';
      const hashed = await hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(hashed).toMatch(/^\$2[aby]?\$/);

      const isValid = await verifyPassword(password, hashed);
      expect(isValid).toBe(true);
    });

    it('rejects wrong password', async () => {
      const hashed = await hashPassword('correct-password');
      const isValid = await verifyPassword('wrong-password', hashed);
      expect(isValid).toBe(false);
    });
  });

  describe('createToken', () => {
    it('creates a JWT token', async () => {
      const token = await createToken({ username: 'admin' });
      expect(token).toBe('mock-jwt-token');
    });
  });

  describe('verifyToken', () => {
    it('returns user for valid token', async () => {
      mockedJwtVerify.mockResolvedValue({
        payload: { username: 'admin' },
        protectedHeader: { alg: 'HS256' },
      } as any);

      const user = await verifyToken('valid-token');
      expect(user).toEqual({ username: 'admin' });
    });

    it('returns null for invalid token', async () => {
      mockedJwtVerify.mockRejectedValue(new Error('Invalid token'));

      const user = await verifyToken('invalid-token');
      expect(user).toBeNull();
    });

    it('returns null for token without username', async () => {
      mockedJwtVerify.mockResolvedValue({
        payload: { sub: '123' },
        protectedHeader: { alg: 'HS256' },
      } as any);

      const user = await verifyToken('token-no-username');
      expect(user).toBeNull();
    });
  });

  describe('validateAdminCredentials', () => {
    it('validates with default credentials', () => {
      // Default: admin / password
      expect(validateAdminCredentials('admin', 'password')).toBe(true);
    });

    it('rejects wrong username', () => {
      expect(validateAdminCredentials('wrong', 'password')).toBe(false);
    });

    it('rejects wrong password', () => {
      expect(validateAdminCredentials('admin', 'wrong')).toBe(false);
    });

    it('uses env vars when set', () => {
      const originalUser = process.env.ADMIN_USERNAME;
      const originalPass = process.env.ADMIN_PASSWORD;

      process.env.ADMIN_USERNAME = 'custom-user';
      process.env.ADMIN_PASSWORD = 'custom-pass';

      expect(validateAdminCredentials('custom-user', 'custom-pass')).toBe(true);
      expect(validateAdminCredentials('admin', 'password')).toBe(false);

      process.env.ADMIN_USERNAME = originalUser;
      process.env.ADMIN_PASSWORD = originalPass;
    });
  });
});
