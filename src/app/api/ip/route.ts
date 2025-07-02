import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getCurrentIP } from '@/lib/cloudflare';

export async function GET() {
  try {
    // 인증 확인
    await requireAuth();

    // 현재 공인 IP 조회
    const ip = await getCurrentIP();

    return NextResponse.json({
      success: true,
      ip,
    });
  } catch (error) {
    console.error('Get IP error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'IP 주소 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 