import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { dbAll, dbGet } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const logs = await dbAll(`
      SELECT ul.*, dr.name as record_name, dr.type as record_type, z.name as zone_name
      FROM update_logs ul
      JOIN dns_records dr ON ul.record_id = dr.id
      JOIN zones z ON dr.zone_id = z.id
      ORDER BY ul.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const totalResult = await dbGet(`
      SELECT COUNT(*) as total
      FROM update_logs ul
      JOIN dns_records dr ON ul.record_id = dr.id
      JOIN zones z ON dr.zone_id = z.id
    `);

    return NextResponse.json({
      success: true,
      logs,
      total: totalResult?.total || 0,
    });
  } catch (error) {
    console.error('Get scheduler logs error:', error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: '스케줄러 로그 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
