const FOLDER_MIME = "application/vnd.google-apps.folder";

async function findFolder(
  name: string,
  parentId: string | null,
  token: string
): Promise<string | null> {
  const parent = parentId ? `'${parentId}'` : "'root'";
  const q = `name='${name}' and mimeType='${FOLDER_MIME}' and ${parent} in parents and trashed=false`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return (data.files?.[0]?.id as string) ?? null;
}

async function createFolder(
  name: string,
  parentId: string | null,
  token: string
): Promise<string> {
  const metadata: Record<string, unknown> = { name, mimeType: FOLDER_MIME };
  if (parentId) metadata.parents = [parentId];

  const res = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });
  const data = await res.json();
  if (!data.id) throw new Error(`Failed to create Drive folder "${name}": ${JSON.stringify(data)}`);
  return data.id as string;
}

async function findOrCreateFolder(
  name: string,
  parentId: string | null,
  token: string
): Promise<string> {
  return (await findFolder(name, parentId, token)) ?? (await createFolder(name, parentId, token));
}

// Walks the path array, finding or creating each folder in sequence.
// Returns the Drive ID of the deepest folder.
export async function getOrCreateFolderPath(
  segments: string[],
  token: string
): Promise<string> {
  let parentId: string | null = null;
  for (const seg of segments) {
    parentId = await findOrCreateFolder(seg, parentId, token);
  }
  return parentId!;
}

// Resumable upload: multipart/media uploads are capped at 5MB by Drive, so we
// use the resumable protocol (no size cap) for every file. For files that fit
// in one request we still send the body in a single PUT to the session URL.
export async function uploadFileToDrive(
  file: File,
  folderId: string,
  token: string
): Promise<string> {
  const metadata = { name: file.name, parents: [folderId] };

  const initRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": file.type || "application/octet-stream",
        "X-Upload-Content-Length": String(file.size),
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initRes.ok) {
    throw new Error(`Drive upload init failed: ${await initRes.text()}`);
  }

  const sessionUrl = initRes.headers.get("Location");
  if (!sessionUrl) throw new Error("Drive upload init failed: no session URL returned");

  const uploadRes = await fetch(sessionUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "Content-Length": String(file.size),
    },
    body: file,
  });

  const data = await uploadRes.json();
  if (!data.id) throw new Error(`Drive upload failed: ${JSON.stringify(data)}`);
  return data.id as string;
}

// Grants "anyone with the link" read access to a folder and returns its view URL.
// Safe to call multiple times on the same folder — Drive allows only one "anyone" permission.
export async function shareFolderPublicly(folderId: string, token: string): Promise<string> {
  await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${folderId}?fields=webViewLink`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return data.webViewLink as string;
}

export async function deleteFromDrive(fileId: string, token: string): Promise<void> {
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
