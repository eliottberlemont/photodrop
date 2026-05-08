export const runtime = 'edge';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return Response.redirect(
      new URL(`/dashboard?google_error=${encodeURIComponent(error)}`, url.origin)
    );
  }

  if (!code) {
    return Response.redirect(
      new URL('/dashboard?google_error=missing_code', url.origin)
    );
  }

  return Response.redirect(
    new URL('/dashboard?google_connected=1', url.origin)
  );
}