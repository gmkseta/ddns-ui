import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn(
    '\x1b[33m[SECURITY WARNING]\x1b[0m JWT_SECRET is not set. ' +
    'Using a fallback key is insecure in production. ' +
    'Set the JWT_SECRET environment variable.'
  );
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);

export interface AuthUser {
  username: string;
}

// 비밀번호 해시 생성
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// 비밀번호 검증
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT 토큰 생성
export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({ username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

// JWT 토큰 검증
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload;
    
    if (payload && typeof payload.username === 'string') {
      return { username: payload.username };
    }
    return null;
  } catch {
    return null;
  }
}

// 쿠키에서 토큰 가져오기
export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value || null;
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  
  return verifyToken(token);
}

// 타이밍 공격 방지를 위한 상수 시간 비교
function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);

  // 길이가 다르더라도 일정한 시간이 소요되도록 처리
  const maxLen = Math.max(bufA.length, bufB.length);
  const paddedA = new Uint8Array(maxLen);
  const paddedB = new Uint8Array(maxLen);
  paddedA.set(bufA);
  paddedB.set(bufB);

  let result = bufA.length ^ bufB.length;
  for (let i = 0; i < maxLen; i++) {
    result |= paddedA[i] ^ paddedB[i];
  }
  return result === 0;
}

// 어드민 계정 검증 (환경변수 기반, 타이밍 공격 방지)
export function validateAdminCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password';

  return timingSafeEqual(username, adminUsername) && timingSafeEqual(password, adminPassword);
}

// 인증 미들웨어 (API 라우트용)
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
} 