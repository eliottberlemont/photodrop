export const runtime = "edge";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getValidToken, GoogleReauthRequiredError } from "@/lib/google-token";
import { uploadFileToDrive } from "@/lib/google-drive";

export async function POST(req: Request) {
  try {
    // 1. Verify caller is a logged-in Supabase user
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

    // 2. Parse multipart form — folder is resolved/shared once up front via /api/google/prepare-album
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderId = (formData.get("folder_id") as string | null)?.trim();
    const folderPath = (formData.get("folder_path") as string | null)?.trim();
    const folderLink = (formData.get("folder_link") as string | null)?.trim();
    const expiresAt = (formData.get("expires_at") as string | null)?.trim();
    const customerEmailsRaw = (formData.get("customer_emails") as string | null)?.trim();
    const customerEmails = customerEmailsRaw ? customerEmailsRaw.split(",").map(e => e.trim()).filter(Boolean) : [];
    const businessId = (formData.get("business_id") as string | null) ?? null;

    if (!file || !folderId || !folderPath || !folderLink || !expiresAt || customerEmails.length === 0) {
      return new Response(
        JSON.stringify({ error: "file, folder_id, folder_path, folder_link, expires_at, and customer_emails are required" }),
        { status: 400 }
      );
    }

    // 3. Get a valid (auto-refreshed) Google access token for this user
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

    // 4. Upload file into the pre-resolved folder
    const driveFileId = await uploadFileToDrive(file, folderId, accessToken);

    // 5. Record one row per customer email
    const admin = getSupabaseAdmin();
    await admin.from("uploaded_files").insert(
      customerEmails.map(email => ({
        user_id: user.id,
        business_id: businessId,
        drive_file_id: driveFileId,
        file_name: file.name,
        drive_folder_path: folderPath,
        folder_link: folderLink,
        customer_email: email,
        expires_at: expiresAt,
      }))
    );

    return new Response(
      JSON.stringify({ success: true, fileId: driveFileId, folderPath }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
