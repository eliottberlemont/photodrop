export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  return Response.redirect(new URL("/dashboard", req.url));
}