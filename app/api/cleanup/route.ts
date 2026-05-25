export const runtime = "edge";

// Deletes expired uploaded files from Google Drive and marks them deleted in the DB.
// Trigger this daily via an external cron (e.g. cron-job.org) with the header:
//   X-Cleanup-Secret: <CLEANUP_SECRET env var>
// POST https://yourdomain.com/api/cleanup

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getValidToken } from "@/lib/google-token";
import { deleteFromDrive } from "@/lib/google-drive";

interface FileRow {
  id: string;
  user_id: string;
  drive_file_id: string;
}

export async function POST(req: Request) {
  if (req.headers.get("X-Cleanup-Secret") !== process.env.CLEANUP_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const admin = getSupabaseAdmin();

  const { data: files, error } = await admin
    .from("uploaded_files")
    .select("id, user_id, drive_file_id")
    .lt("expires_at", new Date().toISOString())
    .is("deleted_at", null)
    .returns<FileRow[]>();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!files?.length) {
    return new Response(JSON.stringify({ deleted: 0 }), { status: 200 });
  }

  let deleted = 0;
  const errors: string[] = [];

  for (const file of files) {
    try {
      const token = await getValidToken(file.user_id);
      await deleteFromDrive(file.drive_file_id, token);
      await admin
        .from("uploaded_files")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", file.id);
      deleted++;
    } catch (err) {
      errors.push(`file ${file.id}: ${err}`);
    }
  }

  return new Response(JSON.stringify({ deleted, errors }), { status: 200 });
}
