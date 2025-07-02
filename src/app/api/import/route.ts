import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { dbRun } from '@/lib/database';

export async function POST(request: Request) {
  try {
    // 인증 확인
    await requireAuth();

    const body = await request.json();
    
    if (!body.data) {
      return NextResponse.json({ error: '잘못된 설정 파일 형식입니다.' }, { status: 400 });
    }

    const { apiKeys, zones, records, settings } = body.data;

    // 트랜잭션으로 데이터 가져오기
    try {
      // 기존 데이터 삭제 (선택적)
      // await dbRun('DELETE FROM update_logs');
      // await dbRun('DELETE FROM dns_records');
      // await dbRun('DELETE FROM zones');
      // await dbRun('DELETE FROM api_keys');
      // await dbRun('DELETE FROM settings');

      // API 키 가져오기
      if (apiKeys && Array.isArray(apiKeys)) {
        for (const key of apiKeys) {
          // 마스킹된 토큰은 건너뛰기
          if (key.token && !key.token.includes('*')) {
            await dbRun(
              'INSERT OR REPLACE INTO api_keys (id, token, created_at) VALUES (?, ?, ?)',
              [key.id, key.token, key.created_at]
            );
          }
        }
      }

      // Zone 가져오기
      if (zones && Array.isArray(zones)) {
        for (const zone of zones) {
          await dbRun(
            'INSERT OR REPLACE INTO zones (id, name, api_key_id, created_at) VALUES (?, ?, ?, ?)',
            [zone.id, zone.name, zone.api_key_id, zone.created_at]
          );
        }
      }

      // DNS 레코드 가져오기
      if (records && Array.isArray(records)) {
        for (const record of records) {
          await dbRun(
            'INSERT OR REPLACE INTO dns_records (id, zone_id, name, type, content, ttl, proxied, auto_update, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [record.id, record.zone_id, record.name, record.type, record.content, record.ttl, record.proxied, record.auto_update, record.created_at, record.updated_at]
          );
        }
      }

      // 설정 가져오기
      if (settings && Array.isArray(settings)) {
        for (const setting of settings) {
          await dbRun(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
            [setting.key, setting.value, setting.updated_at]
          );
        }
      }

      return NextResponse.json({ 
        message: '설정을 성공적으로 가져왔습니다.',
        imported: {
          apiKeys: apiKeys?.length || 0,
          zones: zones?.length || 0,
          records: records?.length || 0,
          settings: settings?.length || 0
        }
      });

    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: '데이터베이스 오류가 발생했습니다.' }, { status: 500 });
    }

  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    console.error('Import error:', error);
    return NextResponse.json({ error: '설정 가져오기에 실패했습니다.' }, { status: 500 });
  }
} 