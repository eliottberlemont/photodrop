import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  const iss = req.nextUrl.searchParams.get('iss');

  return NextResponse.json({
    ok: true,
    hasCode: !!code,
    error,
    iss,
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? null,
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  });
}