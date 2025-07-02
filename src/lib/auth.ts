import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

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

// 어드민 계정 검증 (환경변수 기반)
export function validateAdminCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password';
  
  return username === adminUsername && password === adminPassword;
}

// 인증 미들웨어 (API 라우트용)
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
} 