import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request | NextRequest): Promise<NextResponse> {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
  const url = new URL(req.url);
  const singleId = url.searchParams.get('id');

  try {
    const targetUrl = singleId
      ? `${backendUrl}/api/agents/${singleId}`
      : `${backendUrl}/api/agents${url.search}`;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(err || { error: `Backend responded with HTTP ${res.status}` }, {
        status: res.status
      });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: `Carefold Python backend is unreachable at ${backendUrl}. Please ensure it is running: ${err.message}`,
        code: 'BACKEND_UNREACHABLE'
      },
      { status: 503 }
    );
  }
}
