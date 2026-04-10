export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      return new Response(`Google OAuth error: ${error}`, { status: 400 });
    }

    if (!code) {
      return new Response("Missing code", { status: 400 });
    }

    return Response.redirect(new URL("/dashboard", url.origin), 302);
  } catch (err) {
    return new Response(
      `Callback failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}