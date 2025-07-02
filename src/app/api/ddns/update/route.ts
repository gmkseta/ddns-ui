import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { CloudflareAPI, getCurrentIP } from '@/lib/cloudflare';
import { dbRun, dbGet, dbAll } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    await requireAuth();

    const { apiKeyId } = await request.json();

    const results = [];
    let totalUpdated = 0;
    let totalErrors = 0;

    // 현재 공인 IP 조회
    const currentIP = await getCurrentIP();

    // 자동 업데이트가 활성화된 A/CNAME 레코드 조회 (특정 API 키만)
    let query = `
      SELECT dr.*, z.name as zone_name, ak.token
      FROM dns_records dr
      JOIN zones z ON dr.zone_id = z.id
      JOIN api_keys ak ON z.api_key_id = ak.id
      WHERE dr.auto_update = 1 AND dr.type IN ('A', 'CNAME')
    `;
    let params = [];

    if (apiKeyId) {
      query += ` AND ak.id = ?`;
      params.push(apiKeyId);
    }

    const autoUpdateRecords = await dbAll(query, params);

    console.log(`Found ${autoUpdateRecords.length} auto-update records`);

    for (const record of autoUpdateRecords) {
      try {
        // CNAME 레코드인 경우 A 레코드로 변환 필요, A 레코드인 경우 IP만 비교
        const needsUpdate = record.type === 'CNAME' || record.content !== currentIP;
        
        if (!needsUpdate) {
          results.push({
            recordId: record.id,
            name: record.name,
            zoneName: record.zone_name,
            status: 'skipped',
            message: 'IP 변경 없음',
            oldContent: record.content,
            newContent: currentIP,
            typeChanged: false,
          });
          continue;
        }

        // Cloudflare API로 레코드 업데이트 (CNAME → A 변환 포함)
        const cloudflareAPI = new CloudflareAPI(record.token);
        
        // CNAME → A 변환 시 proxied는 false로 설정 (Cloudflare 제약사항)
        const shouldDisableProxy = record.type === 'CNAME' && record.proxied;
        
        await cloudflareAPI.updateDNSRecord(record.zone_id, record.id, {
          name: record.name,
          type: 'A', // CNAME이든 A든 모두 A 레코드로 설정
          content: currentIP,
          ttl: record.ttl,
          proxied: shouldDisableProxy ? false : record.proxied, // CNAME → A 변환 시 proxy 비활성화
        });

        // 로컬 DB 업데이트 (타입도 A로 변경, proxied 상태도 업데이트)
        const newProxied = shouldDisableProxy ? false : record.proxied;
        await dbRun(`
          UPDATE dns_records 
          SET type = 'A', content = ?, proxied = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [currentIP, newProxied, record.id]);

        const wasConverted = record.type === 'CNAME';
        let statusMessage = wasConverted 
          ? `CNAME → A 레코드 변환 및 IP 업데이트 성공` 
          : 'IP 업데이트 성공';
        
        if (shouldDisableProxy) {
          statusMessage += ' (Proxy 비활성화됨)';
        }

        // 업데이트 로그 저장
        await dbRun(`
          INSERT INTO update_logs (record_id, old_ip, new_ip, status, message)
          VALUES (?, ?, ?, 'success', ?)
        `, [record.id, record.content, currentIP, statusMessage]);

        results.push({
          recordId: record.id,
          name: record.name,
          zoneName: record.zone_name,
          status: 'updated',
          message: statusMessage,
          oldContent: record.content,
          newContent: currentIP,
          oldType: record.type,
          newType: 'A',
          typeChanged: wasConverted,
        });

        totalUpdated++;

      } catch (error) {
        console.error(`Failed to update record ${record.id}:`, error);

        // 에러 로그 저장
        await dbRun(`
          INSERT INTO update_logs (record_id, old_ip, new_ip, status, message)
          VALUES (?, ?, ?, 'error', ?)
        `, [record.id, record.content, currentIP, error instanceof Error ? error.message : 'Unknown error']);

        results.push({
          recordId: record.id,
          name: record.name,
          zoneName: record.zone_name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          oldContent: record.content,
          newContent: currentIP,
          oldType: record.type,
          newType: 'A',
          typeChanged: record.type === 'CNAME',
        });

        totalErrors++;
      }
    }

    // 프론트엔드가 기대하는 구조로 응답 변환
    const updated = results.filter(r => r.status === 'updated').map(r => ({
      id: r.recordId,
      name: r.name,
      content: r.newContent,
      type: r.newType || 'A',
      zoneName: r.zoneName,
      message: r.message
    }));

    const errors = results.filter(r => r.status === 'error').map(r => ({
      recordId: r.recordId,
      name: r.name,
      zoneName: r.zoneName,
      message: r.message,
      error: r.message
    }));

    return NextResponse.json({
      success: true,
      currentIP,
      totalRecords: autoUpdateRecords.length,
      totalUpdated,
      totalErrors,
      updated,  // 프론트엔드가 기대하는 구조
      errors,   // 프론트엔드가 기대하는 구조
      results,  // 원본 결과도 포함 (디버깅용)
      message: `${totalUpdated}개 레코드 업데이트 완료, ${totalErrors}개 오류`,
    });

  } catch (error) {
    console.error('DDNS update error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'DDNS 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 자동 갱신 설정 조회
export async function GET() {
  try {
    // 인증 확인
    await requireAuth();

    // 자동 업데이트가 활성화된 레코드들 조회
    const autoUpdateRecords = await dbAll(`
      SELECT dr.id, dr.name, dr.type, dr.content, dr.auto_update, dr.updated_at,
             z.name as zone_name
      FROM dns_records dr
      JOIN zones z ON dr.zone_id = z.id
      WHERE dr.auto_update = 1
      ORDER BY dr.updated_at DESC
    `);

    // 최근 업데이트 로그 조회
    const recentLogs = await dbAll(`
      SELECT ul.*, dr.name, z.name as zone_name
      FROM update_logs ul
      JOIN dns_records dr ON ul.record_id = dr.id
      JOIN zones z ON dr.zone_id = z.id
      ORDER BY ul.created_at DESC
      LIMIT 10
    `);

    // 현재 IP 조회
    const currentIP = await getCurrentIP();

    return NextResponse.json({
      success: true,
      currentIP,
      autoUpdateRecords,
      recentLogs,
    });

  } catch (error) {
    console.error('Get DDNS status error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'DDNS 상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 