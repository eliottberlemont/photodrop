export const runtime = "edge";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
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

  const { folder_link, event_name, customer_emails, expires_at } =
    await req.json() as {
      folder_link: string;
      event_name: string;
      customer_emails: string[];
      expires_at: string;
    };

  if (!folder_link || !event_name || !customer_emails?.length) {
    return new Response(JSON.stringify({ error: "Missing required fields." }), { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: userSettings } = await admin
    .from("user_settings")
    .select("email_banner_url, email_custom_text, email_subject")
    .eq("user_id", user.id)
    .maybeSingle<{ email_banner_url: string | null; email_custom_text: string | null; email_subject: string | null }>();

  const expiryLabel = expires_at
    ? new Date(expires_at).toLocaleDateString("en-US", { dateStyle: "long" })
    : null;

  let emailRes: Response;
  try {
    emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PhotoDrop <noreply@photodropusa.com>",
        to: customer_emails,
        subject: userSettings?.email_subject || `Your photos from ${event_name} are ready!`,
        html: `${userSettings?.email_banner_url ? `<img src="${userSettings.email_banner_url}" alt="" style="width:100%;max-width:600px;display:block;margin-bottom:16px;border-radius:8px;" />` : ""}${userSettings?.email_custom_text ? `<p>${userSettings.email_custom_text}</p>` : ""}
<p><a href="${folder_link}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">View Your Photos</a></p>${expiryLabel ? `<p style="font-size:13px;color:#64748b;">This link will be available until ${expiryLabel}.</p>` : ""}`,
      }),
    });
  } catch (err) {
    console.error("Resend send threw:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 502 });
  }

  if (!emailRes.ok) {
    const errText = await emailRes.text();
    console.error("Resend send failed:", emailRes.status, errText);
    return new Response(JSON.stringify({ error: errText }), { status: 502 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
