import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { dbRun, dbGet } from '@/lib/database';

// DDNS 자동 업데이트 토글
export async function PUT(request: NextRequest) {
  try {
    // 인증 확인
    await requireAuth();

    const { recordId, autoUpdate, zoneId, apiKeyId } = await request.json();

    if (!recordId || typeof autoUpdate !== 'boolean') {
      return NextResponse.json(
        { error: 'recordId와 autoUpdate 값이 필요합니다.' },
        { status: 400 }
      );
    }

    // 레코드 존재 확인
    const record = await dbGet(`
      SELECT id, name, type 
      FROM dns_records 
      WHERE id = ?
    `, [recordId]);

    if (!record) {
      console.log('로컬 DB에 레코드가 없음, Cloudflare에서 조회 후 생성...');
      
      if (!zoneId || !apiKeyId) {
        return NextResponse.json(
          { error: '새 레코드 생성을 위해 zoneId와 apiKeyId가 필요합니다.' },
          { status: 400 }
        );
      }

      try {
        // Zone과 API 키 정보 조회
        const zoneRecord = await dbGet(`
          SELECT z.*, ak.token 
          FROM zones z 
          JOIN api_keys ak ON z.api_key_id = ak.id 
          WHERE z.id = ? AND ak.id = ?
        `, [zoneId, apiKeyId]);

        if (!zoneRecord) {
          return NextResponse.json(
            { error: '유효하지 않은 Zone ID 또는 API Key ID입니다.' },
            { status: 404 }
          );
        }

        // Cloudflare에서 레코드 정보 조회
        const { CloudflareAPI } = await import('@/lib/cloudflare');
        const cloudflareAPI = new CloudflareAPI(zoneRecord.token);
        const records = await cloudflareAPI.getDNSRecords(zoneId);
        const foundRecord = records.find(r => r.id === recordId);

        if (!foundRecord) {
          return NextResponse.json(
            { error: '레코드를 찾을 수 없습니다. Cloudflare에서도 해당 레코드가 존재하지 않습니다.' },
            { status: 404 }
          );
        }

        // 로컬 DB에 레코드 생성
        await dbRun(`
          INSERT INTO dns_records (id, zone_id, name, type, content, ttl, proxied, auto_update, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          foundRecord.id,
          zoneId,
          foundRecord.name,
          foundRecord.type,
          foundRecord.content,
          foundRecord.ttl,
          foundRecord.proxied ? 1 : 0,
          autoUpdate ? 1 : 0
        ]);

      } catch (error) {
        console.error('레코드 생성 중 오류:', error);
        return NextResponse.json(
          { error: '레코드를 생성할 수 없습니다.' },
          { status: 500 }
        );
      }
    } else {
      // 기존 레코드의 auto_update 값만 업데이트
      await dbRun(`
        UPDATE dns_records 
        SET auto_update = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [autoUpdate ? 1 : 0, recordId]);
    }

    // 업데이트된 레코드 정보 조회 (이름 포함)
    const updatedRecord = await dbGet(`
      SELECT dr.name, dr.type, z.name as zone_name
      FROM dns_records dr
      JOIN zones z ON dr.zone_id = z.id
      WHERE dr.id = ?
    `, [recordId]);

    const recordName = updatedRecord ? `${updatedRecord.name} (${updatedRecord.type})` : 'Unknown';

    return NextResponse.json({
      success: true,
      recordId,
      autoUpdate,
      message: `${recordName} 레코드의 DDNS 자동 업데이트가 ${autoUpdate ? '활성화' : '비활성화'}되었습니다.`,
    });

  } catch (error) {
    console.error('DDNS toggle error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'DDNS 설정 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 