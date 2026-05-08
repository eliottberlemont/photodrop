export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Missing access token" }), {
        status: 500,
      });
    }

    const metadata = {
      name: file.name,
    };

    const body = new FormData();
    body.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    body.append("file", file);

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      }
    );

    const data = await uploadRes.json();

    return new Response(JSON.stringify(data), {
      status: uploadRes.ok ? 200 : uploadRes.status,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}