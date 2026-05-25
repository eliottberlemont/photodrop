export const runtime = "edge";

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // Supabase user_id, set by dashboard
  const error = url.searchParams.get("error");

  const redirect = (qs: string) =>
    NextResponse.redirect(new URL(`/dashboard?${qs}`, url.origin));

  if (error) return redirect(`google_error=${encodeURIComponent(error)}`);
  if (!code || !state) return redirect("google_error=missing_code");

  // Exchange authorization code for access + refresh tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${url.origin}/api/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) return redirect("google_error=token_exchange_failed");

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

  if (dbError) return redirect(`google_error=${encodeURIComponent(dbError.message)}`);

  return redirect("google_connected=1");
}
