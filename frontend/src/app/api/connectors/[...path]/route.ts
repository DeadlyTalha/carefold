/*
 * Carefold — Healthcare AI Agent Marketplace & Runtime
 * Copyright 2026 Spectrayan (https://spectrayan.com)
 *
 * Licensed under the PolyForm Noncommercial License 1.0.0 and the
 * Carefold Additional Terms (see LICENSE and ADDITIONAL-TERMS.md).
 * Personal and household local use only. Commercial use, hosted service
 * offering, rebranding, white-labeling, and redistribution of modified
 * forks are prohibited without a written commercial license from Spectrayan.
 *
 * Required Notice: Copyright 2026 Spectrayan (https://spectrayan.com)
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8010';
  const url = new URL(req.url);
  const subpath = path.join('/');

  try {
    const targetUrl = `${backendUrl}/api/v1/connectors/${subpath}${url.search}`;
    const headers: Record<string, string> = { Accept: 'application/json' };
    const incomingCookie = req.headers.get('cookie');
    if (incomingCookie) headers['cookie'] = incomingCookie;
    const authHeader = req.headers.get('authorization');
    if (authHeader) headers['authorization'] = authHeader;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: `Carefold Python backend is unreachable at ${backendUrl}: ${err.message}`,
        code: 'BACKEND_UNREACHABLE'
      },
      { status: 503 }
    );
  }
}
