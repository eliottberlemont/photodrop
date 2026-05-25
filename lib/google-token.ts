import { getSupabaseAdmin } from "./supabase-admin";

interface TokenRow {
  access_token: string;
  refresh_token: string;
  token_expiry: string;
}

export async function getValidToken(userId: string): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("google_tokens")
    .select("access_token, refresh_token, token_expiry")
    .eq("user_id", userId)
    .single<TokenRow>();

  if (error || !data) throw new Error("No Google token for user — connect Google Drive first");

  // Return existing token if it won't expire within the next 60 seconds
  if (new Date(data.token_expiry).getTime() - Date.now() > 60_000) {
    return data.access_token;
  }

  // Refresh expired token
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error("Google token refresh failed");

  const { access_token, expires_in } = await res.json();
  const token_expiry = new Date(Date.now() + expires_in * 1000).toISOString();

  await supabase
    .from("google_tokens")
    .update({ access_token, token_expiry, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  return access_token;
}
