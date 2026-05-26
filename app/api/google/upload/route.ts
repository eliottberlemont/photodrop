export const runtime = "edge";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getValidToken } from "@/lib/google-token";
import { getOrCreateFolderPath, uploadFileToDrive, shareFolderPublicly } from "@/lib/google-drive";

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

    // 2. Parse multipart form
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const eventName = (formData.get("event_name") as string | null)?.trim();
    const customerEmail = (formData.get("customer_email") as string | null)?.trim();
    const businessId = (formData.get("business_id") as string | null) ?? null;

    const sendEmail = (formData.get("send_email") as string | null) !== "false";

    if (!file || !eventName || !customerEmail) {
      return new Response(
        JSON.stringify({ error: "file, event_name, and customer_email are required" }),
        { status: 400 }
      );
    }

    // 3. Look up retention period from the selected business (fallback: 30 days)
    const admin = getSupabaseAdmin();
    let retentionDays = 30;

    if (businessId) {
      const { data: biz } = await admin
        .from("businesses")
        .select("retention_days")
        .eq("id", businessId)
        .eq("owner_id", user.id)
        .single<{ retention_days: number }>();
      if (biz?.retention_days) retentionDays = biz.retention_days;
    }

    // 4. Get a valid (auto-refreshed) Google access token for this user
    const accessToken = await getValidToken(user.id);

    // 5. Resolve/create folder path: PhotoDrop/YYYY-MM/DD/event-name
    const now = new Date();
    const ym = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const day = String(now.getUTCDate()).padStart(2, "0");
    const folderPath = ["PhotoDrop", ym, day, eventName];
    const folderId = await getOrCreateFolderPath(folderPath, accessToken);

    // 6. Share the event folder (anyone with link can view) and get its URL
    const folderLink = await shareFolderPublicly(folderId, accessToken);

    // 7. Upload file into that folder
    const driveFileId = await uploadFileToDrive(file, folderId, accessToken);

    // 8. Record the upload with its expiry date
    const expiresAt = new Date(Date.now() + retentionDays * 86_400_000).toISOString();
    await admin.from("uploaded_files").insert({
      user_id: user.id,
      business_id: businessId,
      drive_file_id: driveFileId,
      file_name: file.name,
      drive_folder_path: folderPath.join("/"),
      folder_link: folderLink,
      customer_email: customerEmail,
      expires_at: expiresAt,
    });

    // 9. Email the customer via Resend (non-fatal — upload is already done)
    if (!sendEmail) {
      return new Response(
        JSON.stringify({ success: true, fileId: driveFileId, folderPath: folderPath.join("/") }),
        { status: 200 }
      );
    }
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PhotoDrop <noreply@photodropusa.com>",
          to: customerEmail,
          subject: `Your photos from ${eventName} are ready!`,
          html: `<p>Hi there!</p>
<p>Your photos from <strong>${eventName}</strong> have been uploaded and are ready to view.</p>
<p><a href="${folderLink}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">View Your Photos</a></p>
<p>This link gives you view-only access to your event folder. It will be available until <strong>${new Date(expiresAt).toLocaleDateString("en-US", { dateStyle: "long" })}</strong>.</p>
<p>— PhotoDrop</p>`,
        }),
      });
    } catch {
      // Email failure is non-fatal
    }

    return new Response(
      JSON.stringify({ success: true, fileId: driveFileId, folderPath: folderPath.join("/") }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
