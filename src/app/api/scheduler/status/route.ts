import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ddnsScheduler } from '@/lib/scheduler';

export async function GET() {
  try {
    await requireAuth();

    const isRunning = ddnsScheduler.isSchedulerRunning();
    const isUpdating = ddnsScheduler.isUpdateInProgress();

    return NextResponse.json({
      success: true,
      isRunning,
      isUpdating,
      environment: process.env.NODE_ENV,
      updateInterval: parseInt(process.env.UPDATE_INTERVAL || '5', 10),
    });
  } catch (error) {
    console.error('Get scheduler status error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: '스케줄러 상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();

    const { action } = await request.json();

    if (action === 'start') {
      const interval = parseInt(process.env.UPDATE_INTERVAL || '5', 10);
      ddnsScheduler.start(interval);
      return NextResponse.json({
        success: true,
        message: '스케줄러가 시작되었습니다.',
      });
    } else if (action === 'stop') {
      ddnsScheduler.stop();
      return NextResponse.json({
        success: true,
        message: '스케줄러가 중지되었습니다.',
      });
    } else if (action === 'run') {
      // 수동으로 한 번 실행
      ddnsScheduler.runUpdate();
      return NextResponse.json({
        success: true,
        message: '스케줄러 수동 실행이 시작되었습니다.',
      });
    } else {
      return NextResponse.json(
        { error: '잘못된 액션입니다.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Scheduler action error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: '스케줄러 제어 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}