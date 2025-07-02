import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { CloudflareAPI } from '@/lib/cloudflare';
import { dbRun, dbGet, dbAll } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const apiKeyId = searchParams.get('apiKeyId');

    if (!apiKeyId) {
      return NextResponse.json(
        { error: 'API 키 ID를 지정해주세요.' },
        { status: 400 }
      );
    }

    // API 키 조회
    const apiKeyRecord = await dbGet('SELECT token FROM api_keys WHERE id = ?', [apiKeyId]);
    
    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: '유효하지 않은 API 키 ID입니다.' },
        { status: 404 }
      );
    }

    // Cloudflare에서 Zone 목록 조회
    const cloudflareAPI = new CloudflareAPI(apiKeyRecord.token);
    const zones = await cloudflareAPI.getZones();

    // 로컬 DB에 Zone 정보 동기화
    for (const zone of zones) {
      await dbRun(
        'INSERT OR REPLACE INTO zones (id, name, api_key_id) VALUES (?, ?, ?)',
        [zone.id, zone.name, apiKeyId]
      );
    }

    return NextResponse.json({
      success: true,
      zones,
    });
  } catch (error) {
    console.error('Get zones error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Zone 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 저장된 Zone 목록 조회
export async function POST() {
  try {
    // 인증 확인
    await requireAuth();

    // 로컬 DB에서 Zone 목록 조회
    const zones = await dbAll(`
      SELECT z.*, ak.token 
      FROM zones z 
      JOIN api_keys ak ON z.api_key_id = ak.id 
      ORDER BY z.name
    `);

    return NextResponse.json({
      success: true,
      zones: zones.map(zone => ({
        id: zone.id,
        name: zone.name,
        apiKeyId: zone.api_key_id,
        createdAt: zone.created_at,
        token: `${zone.token.substring(0, 8)}...${zone.token.substring(zone.token.length - 4)}`,
      })),
    });
  } catch (error) {
    console.error('Get saved zones error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: '저장된 Zone 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 