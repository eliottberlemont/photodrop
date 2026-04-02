"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { getSupabase } from "../../lib/supabase";

export default function UploadPage() {
  const supabase = getSupabase();
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    try {
      const { error } = await supabase.storage
        .from("uploads")
        .upload(`public/${Date.now()}-${file.name}`, file);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Upload successful!");
    } catch (err) {
      alert(
        `Unexpected error: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <main style={{ padding: "40px" }}>
      <h1>Upload</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ display: "block", marginBottom: "12px" }}
      />

      <button onClick={handleUpload}>Upload File</button>
    </main>
  );
}