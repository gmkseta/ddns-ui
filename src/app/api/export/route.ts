import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { dbAll } from '@/lib/database';

export async function GET() {
  try {
    // 인증 확인
    await requireAuth();

    // API 키 조회
    const apiKeys = await dbAll('SELECT * FROM api_keys');

    // Zone 조회
    const zones = await dbAll('SELECT * FROM zones');

    // DNS 레코드 조회
    const records = await dbAll('SELECT * FROM dns_records');

    // 설정 조회
    const settings = await dbAll('SELECT * FROM settings');

    // 로그 조회 (최근 100개)
    const logs = await dbAll('SELECT * FROM update_logs ORDER BY created_at DESC LIMIT 100');

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        apiKeys: apiKeys.map((key: any) => ({
          ...key,
          // 보안을 위해 토큰 마스킹
          token: key.token.slice(0, 8) + '*'.repeat(24) + key.token.slice(-8)
        })),
        zones,
        records,
        settings,
        logs
      }
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: '설정 내보내기에 실패했습니다.' }, { status: 500 });
  }
} 