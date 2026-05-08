
"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/google/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Upload failed.");
        return;
      }

      alert("Uploaded to Google Drive successfully.");
      console.log(data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Upload</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}