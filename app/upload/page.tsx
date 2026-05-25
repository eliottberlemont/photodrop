'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

interface Business {
  id: string;
  name: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [eventName, setEventName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      setToken(session?.access_token ?? null);

      if (session) {
        const { data } = await supabase
          .from('businesses')
          .select('id, name')
          .eq('owner_id', session.user.id);
        setBusinesses((data as Business[]) ?? []);
      }
    }
    init();
  }, []);

  const handleUpload = async () => {
    if (files.length === 0 || !eventName || !customerEmail) {
      alert('Please fill in all fields and select at least one file.');
      return;
    }
    if (!token) {
      alert('Please log in first.');
      return;
    }

    setUploading(true);
    let folderPath = '';
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`Uploading ${i + 1} / ${files.length}…`);
        const fd = new FormData();
        fd.append('file', files[i]);
        fd.append('event_name', eventName);
        fd.append('customer_email', customerEmail);
        fd.append('send_email', i === files.length - 1 ? 'true' : 'false');
        if (businessId) fd.append('business_id', businessId);

        const res = await fetch('/api/google/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();

        if (!res.ok) {
          alert(`File ${i + 1} failed: ${data.error || 'Upload failed.'}`);
          return;
        }
        folderPath = data.folderPath;
      }

      alert(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded to ${folderPath}. Customer notified.`);
      setFiles([]);
      setEventName('');
      setCustomerEmail('');
      setProgress('');
    } catch {
      alert('Something went wrong during upload.');
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  const inputStyle = {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ padding: '24px', maxWidth: '440px' }}>
      <h1 style={{ marginBottom: '20px' }}>Upload Photos</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {businesses.length > 0 && (
          <select
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            style={inputStyle}
          >
            <option value="">No business (30-day retention)</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder="Event name (e.g. beach-wedding)"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Customer email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
        />
        {files.length > 0 && (
          <div style={{ fontSize: '13px', color: '#666' }}>
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !token}
          style={{
            padding: '10px',
            cursor: uploading || !token ? 'not-allowed' : 'pointer',
            opacity: !token ? 0.5 : 1,
          }}
        >
          {uploading ? (progress || 'Uploading…') : 'Upload'}
        </button>
      </div>
    </div>
  );
}
