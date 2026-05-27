export const runtime = "edge";

import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { email } = await req.json() as { email: string };
  if (!email || !email.includes("@")) {
    return new Response(JSON.stringify({ error: "Invalid email." }), { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase
    .from("waitlist")
    .insert({ email: email.toLowerCase().trim() });

  if (error) {
    if (error.code === "23505") {
      // Already on the list — treat as success so we don't reveal duplicates
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
