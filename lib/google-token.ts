import { getSupabaseAdmin } from "./supabase-admin";

interface TokenRow {
  access_token: string;
  refresh_token: string;
  token_expiry: string;
}

// Thrown when the stored Google connection is missing or permanently invalid
// (refresh token revoked/expired) — the user needs to reconnect Google Drive.
export class GoogleReauthRequiredError extends Error {
  constructor(message = "Google Drive is not connected — reconnect it to resume uploads") {
    super(message);
    this.name = "GoogleReauthRequiredError";
  }
}

export async function getValidToken(userId: string): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("google_tokens")
    .select("access_token, refresh_token, token_expiry")
    .eq("user_id", userId)
    .single<TokenRow>();

  if (error || !data) throw new GoogleReauthRequiredError();

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

  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null;

    // Refresh token was revoked or expired (e.g. user revoked access, or an
    // unverified OAuth app's tokens expired after 7 days of inactivity).
    // Clear the stale row so the dashboard correctly prompts reconnection.
    if (body?.error === "invalid_grant") {
      await supabase.from("google_tokens").delete().eq("user_id", userId);
      throw new GoogleReauthRequiredError();
    }

    throw new Error(`Google token refresh failed: ${body?.error ?? res.status}`);
  }

  const { access_token, expires_in } = await res.json();
  const token_expiry = new Date(Date.now() + expires_in * 1000).toISOString();

  await supabase
    .from("google_tokens")
    .update({ access_token, token_expiry, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  return access_token;
}
