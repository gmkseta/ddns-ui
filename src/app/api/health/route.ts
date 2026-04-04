import { NextResponse } from 'next/server';

const startTime = Date.now();

export async function GET() {
  try {
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    return NextResponse.json({
      status: 'ok',
      uptime,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
