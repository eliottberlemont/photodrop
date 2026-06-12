export const runtime = "edge";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getValidToken, GoogleReauthRequiredError } from "@/lib/google-token";
import { getOrCreateFolderPath, shareFolderPublicly } from "@/lib/google-drive";

// Resolves (creating if needed) and shares the Drive folder for an album once
// per upload batch, so individual file uploads don't each repeat this work.
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { event_name, business_id } = await req.json() as { event_name?: string; business_id?: string | null };
    const eventName = event_name?.trim();
    if (!eventName) {
      return new Response(JSON.stringify({ error: "event_name is required" }), { status: 400 });
    }

    // Look up retention period
    const admin = getSupabaseAdmin();
    let retentionDays = 30;

    const { data: userSettings } = await admin
      .from("user_settings")
      .select("default_retention_days")
      .eq("user_id", user.id)
      .maybeSingle<{ default_retention_days: number }>();

    if (userSettings?.default_retention_days) retentionDays = userSettings.default_retention_days;

    if (business_id) {
      const { data: biz } = await admin
        .from("businesses")
        .select("retention_days")
        .eq("id", business_id)
        .eq("owner_id", user.id)
        .single<{ retention_days: number }>();
      if (biz?.retention_days) retentionDays = biz.retention_days;
    }

    let accessToken: string;
    try {
      accessToken = await getValidToken(user.id);
    } catch (err) {
      if (err instanceof GoogleReauthRequiredError) {
        return new Response(
          JSON.stringify({ error: "reauth_required", message: err.message }),
          { status: 409 }
        );
      }
      throw err;
    }

    // Resolve/create folder path: PhotoDrop/YYYY-MM/DD/event-name
    const now = new Date();
    const ym = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const day = String(now.getUTCDate()).padStart(2, "0");
    const folderPath = ["PhotoDrop", ym, day, eventName];
    const folderId = await getOrCreateFolderPath(folderPath, accessToken);

    // Share the event folder (anyone with link can view) and get its URL
    const folderLink = await shareFolderPublicly(folderId, accessToken);

    const expiresAt = new Date(Date.now() + retentionDays * 86_400_000).toISOString();

    return new Response(
      JSON.stringify({ folderId, folderPath: folderPath.join("/"), folderLink, expiresAt }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
