import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { dbAll } from '@/lib/database';

export async function GET(request: Request) {
  try {
    // 인증 확인
    await requireAuth();

    // URL 파라미터 확인
    const { searchParams } = new URL(request.url);
    const includeLogs = searchParams.get('includeLogs') !== 'false'; // 기본값은 true

    // API 키 조회
    const apiKeys = await dbAll('SELECT * FROM api_keys');

    // Zone 조회
    const zones = await dbAll('SELECT * FROM zones');

    // DNS 레코드 조회
    const records = await dbAll('SELECT * FROM dns_records');

    // 설정 조회
    const settings = await dbAll('SELECT * FROM settings');

    // 로그 조회 (선택적)
    let logs = null;
    if (includeLogs) {
      logs = await dbAll('SELECT * FROM update_logs ORDER BY created_at DESC LIMIT 100');
    }

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      warning: '이 파일에는 민감한 API 토큰이 포함되어 있습니다. 안전하게 보관하세요.',
      options: {
        includeLogs
      },
      data: {
        apiKeys,  // 전체 토큰 포함 (가져오기가 가능하도록)
        zones,
        records,
        settings,
        ...(includeLogs && { logs })  // logs가 있을 때만 포함
      }
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: '설정 내보내기에 실패했습니다.' }, { status: 500 });
  }
} 