import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials, createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

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
    
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24시간
      path: '/',
      domain: host ? `.${host.split('.').slice(-2).join('.')}` : undefined, // 상위 도메인으로 설정
    });

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