
export const runtime = 'edge';

import type { NextApiRequest, NextApiResponse } from 'next';

function getBaseUrl(req: NextApiRequest) {
  const host = req.headers.host;

  if (!host) {
    throw new Error('Missing host header');
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto =
    typeof forwardedProto === 'string'
      ? forwardedProto
      : host.includes('localhost')
      ? 'http'
      : 'https';

  return `${proto}://${host}`;
}

function makeCookie(name: string, value: string, maxAge: number, secure: boolean) {
  return [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    secure ? 'Secure' : '',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ]
    .filter(Boolean)
    .join('; ');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const code = req.query.code;

    if (!code || typeof code !== 'string') {
      return res.redirect('/dashboard?google_error=missing_code');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
      return res.redirect('/dashboard?google_error=missing_env');
    }

    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/api/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', tokenData);
      return res.redirect('/dashboard?google_error=token_exchange_failed');
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    if (!accessToken) {
      console.error('No access token returned from Google:', tokenData);
      return res.redirect('/dashboard?google_error=no_access_token');
    }

    const secure = !baseUrl.includes('localhost');

    const cookies = [
      makeCookie('google_access_token', accessToken, 60 * 60, secure),
    ];

    if (refreshToken) {
      cookies.push(makeCookie('google_refresh_token', refreshToken, 60 * 60 * 24 * 30, secure));
    }

    res.setHeader('Set-Cookie', cookies);

    return res.redirect('/dashboard?google=connected');
  } catch (error) {
    console.error('Google callback error:', error);
    return res.redirect('/dashboard?google_error=server_error');
  }
}