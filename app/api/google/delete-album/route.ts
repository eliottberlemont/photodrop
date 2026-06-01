export const runtime = "edge";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getValidToken } from "@/lib/google-token";
import { deleteFromDrive } from "@/lib/google-drive";

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

    const { folder_path } = await req.json() as { folder_path: string };
    if (!folder_path) {
      return new Response(JSON.stringify({ error: "folder_path is required" }), { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Fetch all file IDs and the folder link for this album
    const { data: rows, error: fetchErr } = await admin
      .from("uploaded_files")
      .select("id, drive_file_id, folder_link")
      .eq("user_id", user.id)
      .eq("drive_folder_path", folder_path)
      .is("deleted_at", null);

    if (fetchErr) {
      return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500 });
    }
    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ error: "Album not found" }), { status: 404 });
    }

    const accessToken = await getValidToken(user.id);

    // Delete each unique file from Drive
    const seenFileIds = new Set<string>();
    for (const row of rows) {
      if (row.drive_file_id && !seenFileIds.has(row.drive_file_id)) {
        seenFileIds.add(row.drive_file_id);
        await deleteFromDrive(row.drive_file_id, accessToken);
      }
    }

    // Extract the Drive folder ID from the folder link and delete it
    const folderLink: string | null = rows[0].folder_link;
    if (folderLink) {
      const match = folderLink.match(/folders\/([a-zA-Z0-9_-]+)/);
      if (match) {
        await deleteFromDrive(match[1], accessToken);
      }
    }

    // Soft-delete DB records
    await admin
      .from("uploaded_files")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("drive_folder_path", folder_path)
      .is("deleted_at", null);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
