export async function register() {
  // 서버 사이드에서만 스케줄러 시작 (빌드 타임 제외)
  if (
    typeof window === 'undefined' &&
    process.env.NEXT_PHASE !== 'phase-production-build' &&
    process.env.SKIP_SCHEDULER !== '1'
  ) {
    const { ddnsScheduler } = await import('@/lib/scheduler');
    const updateInterval = parseInt(process.env.UPDATE_INTERVAL || '5', 10);

    // DB 초기화 대기 후 스케줄러 시작
    setTimeout(() => {
      console.log(`[Instrumentation] Starting DDNS scheduler with ${updateInterval} minute interval`);
      ddnsScheduler.start(updateInterval);
    }, 10000);
  }
}
