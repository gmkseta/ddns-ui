import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { CloudflareAPI } from '@/lib/cloudflare';
import { dbRun, dbGet, dbAll } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    await requireAuth();

    const { token, name } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'API 토큰을 입력해주세요.' },
        { status: 400 }
      );
    }

    // Cloudflare API 토큰 유효성 검증
    const cloudflareAPI = new CloudflareAPI(token);
    try {
      await cloudflareAPI.getZones();
    } catch {
      return NextResponse.json(
        { error: '유효하지 않은 API 토큰입니다.' },
        { status: 400 }
      );
    }

    // 기존 API 키가 있는지 확인
    const existingKey = await dbGet('SELECT id FROM api_keys WHERE token = ?', [token]);
    
    if (existingKey) {
      return NextResponse.json({
        success: true,
        message: 'API 키가 이미 등록되어 있습니다.',
        id: existingKey.id,
      });
    }

    // API 키 저장
    const result = await dbRun('INSERT INTO api_keys (token, name) VALUES (?, ?)', [token, name || null]);

    return NextResponse.json({
      success: true,
      message: 'API 키가 성공적으로 등록되었습니다.',
      id: result.lastID,
    });
  } catch (error) {
    console.error('API key save error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'API 키 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 인증 확인
    await requireAuth();

    // 저장된 API 키 목록 조회
    const keys = await dbAll('SELECT id, token, name, created_at FROM api_keys ORDER BY created_at DESC');

    return NextResponse.json({
      success: true,
      apiKeys: keys.map(key => ({
        id: key.id,
        token: key.token, // 전체 토큰 반환 (선택시 필요)
        name: key.name,
        createdAt: key.created_at,
      })),
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'API 키 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 인증 확인
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'API 키 ID를 지정해주세요.' },
        { status: 400 }
      );
    }

    // API 키 삭제 (관련된 zone과 record도 함께 삭제)
    await dbRun('DELETE FROM update_logs WHERE record_id IN (SELECT id FROM dns_records WHERE zone_id IN (SELECT id FROM zones WHERE api_key_id = ?))', [keyId]);
    await dbRun('DELETE FROM dns_records WHERE zone_id IN (SELECT id FROM zones WHERE api_key_id = ?)', [keyId]);
    await dbRun('DELETE FROM zones WHERE api_key_id = ?', [keyId]);
    await dbRun('DELETE FROM api_keys WHERE id = ?', [keyId]);

    return NextResponse.json({
      success: true,
      message: 'API 키가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'API 키 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 