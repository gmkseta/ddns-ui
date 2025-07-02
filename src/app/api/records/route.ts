import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { CloudflareAPI } from '@/lib/cloudflare';
import { dbRun, dbGet, dbAll } from '@/lib/database';

// 레코드 조회
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId');

    if (!zoneId) {
      return NextResponse.json(
        { error: 'Zone ID를 지정해주세요.' },
        { status: 400 }
      );
    }

    // Zone과 API 키 정보 조회
    const zoneRecord = await dbGet(`
      SELECT z.*, ak.token 
      FROM zones z 
      JOIN api_keys ak ON z.api_key_id = ak.id 
      WHERE z.id = ?
    `, [zoneId]);

    if (!zoneRecord) {
      return NextResponse.json(
        { error: '유효하지 않은 Zone ID입니다.' },
        { status: 404 }
      );
    }

    // Cloudflare에서 DNS 레코드 조회
    const cloudflareAPI = new CloudflareAPI(zoneRecord.token);
    const records = await cloudflareAPI.getDNSRecords(zoneId);

    // 로컬 DB에서 자동 업데이트 설정 조회
    const localRecords = await dbAll('SELECT id, auto_update FROM dns_records WHERE zone_id = ?', [zoneId]);
    const autoUpdateMap = new Map(localRecords.map(r => [r.id, r.auto_update]));

    // 결과 병합
    const recordsWithSettings = records.map(record => ({
      ...record,
      autoUpdate: autoUpdateMap.get(record.id) || false,
    }));

    return NextResponse.json({
      success: true,
      records: recordsWithSettings,
    });
  } catch (error) {
    console.error('Get records error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'DNS 레코드 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 레코드 생성
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    await requireAuth();

    const { zoneId, name, type, content, ttl, proxied, autoUpdate } = await request.json();

    if (!zoneId || !name || !type || !content) {
      return NextResponse.json(
        { error: '필수 필드를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // Zone과 API 키 정보 조회
    const zoneRecord = await dbGet(`
      SELECT z.*, ak.token 
      FROM zones z 
      JOIN api_keys ak ON z.api_key_id = ak.id 
      WHERE z.id = ?
    `, [zoneId]);

    if (!zoneRecord) {
      return NextResponse.json(
        { error: '유효하지 않은 Zone ID입니다.' },
        { status: 404 }
      );
    }

    // Cloudflare에 DNS 레코드 생성
    const cloudflareAPI = new CloudflareAPI(zoneRecord.token);
    const record = await cloudflareAPI.createDNSRecord(zoneId, {
      name,
      type,
      content,
      ttl: ttl || 120,
      proxied: proxied || false,
    });

    // 로컬 DB에 레코드 정보 저장
    await dbRun(`
      INSERT INTO dns_records (id, zone_id, name, type, content, ttl, proxied, auto_update)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [record.id, zoneId, name, type, content, ttl || 120, proxied || false, autoUpdate || false]);

    return NextResponse.json({
      success: true,
      record: {
        ...record,
        autoUpdate: autoUpdate || false,
      },
    });
  } catch (error) {
    console.error('Create record error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'DNS 레코드 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 레코드 수정
export async function PUT(request: NextRequest) {
  try {
    // 인증 확인
    await requireAuth();

    const { recordId, zoneId, name, type, content, ttl, proxied, autoUpdate } = await request.json();

    if (!recordId || !zoneId || !name || !type || !content) {
      return NextResponse.json(
        { error: '필수 필드를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // Zone과 API 키 정보 조회
    const zoneRecord = await dbGet(`
      SELECT z.*, ak.token 
      FROM zones z 
      JOIN api_keys ak ON z.api_key_id = ak.id 
      WHERE z.id = ?
    `, [zoneId]);

    if (!zoneRecord) {
      return NextResponse.json(
        { error: '유효하지 않은 Zone ID입니다.' },
        { status: 404 }
      );
    }

    // Cloudflare에서 DNS 레코드 수정
    const cloudflareAPI = new CloudflareAPI(zoneRecord.token);
    const record = await cloudflareAPI.updateDNSRecord(zoneId, recordId, {
      name,
      type,
      content,
      ttl: ttl || 120,
      proxied: proxied || false,
    });

    // 로컬 DB 업데이트
    await dbRun(`
      INSERT OR REPLACE INTO dns_records (id, zone_id, name, type, content, ttl, proxied, auto_update, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [recordId, zoneId, name, type, content, ttl || 120, proxied || false, autoUpdate || false]);

    return NextResponse.json({
      success: true,
      record: {
        ...record,
        autoUpdate: autoUpdate || false,
      },
    });
  } catch (error) {
    console.error('Update record error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'DNS 레코드 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 레코드 삭제
export async function DELETE(request: NextRequest) {
  try {
    // 인증 확인
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('recordId');
    const zoneId = searchParams.get('zoneId');

    if (!recordId || !zoneId) {
      return NextResponse.json(
        { error: 'Record ID와 Zone ID를 지정해주세요.' },
        { status: 400 }
      );
    }

    // Zone과 API 키 정보 조회
    const zoneRecord = await dbGet(`
      SELECT z.*, ak.token 
      FROM zones z 
      JOIN api_keys ak ON z.api_key_id = ak.id 
      WHERE z.id = ?
    `, [zoneId]);

    if (!zoneRecord) {
      return NextResponse.json(
        { error: '유효하지 않은 Zone ID입니다.' },
        { status: 404 }
      );
    }

    // Cloudflare에서 DNS 레코드 삭제
    const cloudflareAPI = new CloudflareAPI(zoneRecord.token);
    await cloudflareAPI.deleteDNSRecord(zoneId, recordId);

    // 로컬 DB에서 레코드 삭제
    await dbRun('DELETE FROM update_logs WHERE record_id = ?', [recordId]);
    await dbRun('DELETE FROM dns_records WHERE id = ?', [recordId]);

    return NextResponse.json({
      success: true,
      message: 'DNS 레코드가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete record error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'DNS 레코드 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 