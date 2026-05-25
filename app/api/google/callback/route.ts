export const runtime = "edge";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

function redirect(base: string, qs: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: `${base}/dashboard?${qs}` },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  try {
    if (error) return redirect(base, `google_error=${encodeURIComponent(error)}`);
    if (!code || !state) return redirect(base, "google_error=missing_code");

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${base}/api/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      return redirect(base, `google_error=${encodeURIComponent("token_exchange_failed: " + body)}`);
    }

    const { access_token, refresh_token, expires_in } = await tokenRes.json();
    const token_expiry = new Date(Date.now() + expires_in * 1000).toISOString();

    const { error: dbError } = await getSupabaseAdmin()
      .from("google_tokens")
      .upsert({
        user_id: state,
        access_token,
        refresh_token,
        token_expiry,
        updated_at: new Date().toISOString(),
      });

    if (dbError) return redirect(base, `google_error=${encodeURIComponent(dbError.message)}`);

    return redirect(base, "google_connected=1");
  } catch (err) {
    return redirect(base, `google_error=${encodeURIComponent(String(err))}`);
  }
}
