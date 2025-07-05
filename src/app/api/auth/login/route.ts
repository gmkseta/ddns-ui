import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials, createToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { getSiteUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 어드민 계정 검증
    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: '잘못된 사용자명 또는 비밀번호입니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const token = await createToken({ username });

    // 쿠키에 토큰 저장
    const cookieStore = await cookies();
    const isHttps = process.env.USE_HTTPS === 'true' || request.headers.get('x-forwarded-proto') === 'https';
    const host = request.headers.get('host');
    
    // 동적 사이트 URL 생성 (로깅용)
    const siteUrl = getSiteUrl(request);
    console.log('Login successful for:', siteUrl, 'Host:', host, 'HTTPS:', isHttps);
    
    // 쿠키 도메인 설정 - 프록시 환경에서는 도메인 설정하지 않는 것이 더 안전
    const cookieOptions: any = {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24시간
      path: '/',
    };
    
    // 환경변수로 명시적으로 도메인이 설정된 경우에만 사용
    if (process.env.COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }
    // 그렇지 않으면 도메인 설정 없이 현재 호스트에서만 작동
    
    cookieStore.set('auth-token', token, cookieOptions);

    return NextResponse.json({
      success: true,
      user: { username },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 