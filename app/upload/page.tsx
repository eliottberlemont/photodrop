'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

interface Business {
  id: string;
  name: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [eventName, setEventName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    if (!file || !eventName || !customerEmail) {
      alert('Please fill in all fields and select a file.');
      return;
    }
    if (!token) {
      alert('Please log in first.');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('event_name', eventName);
      fd.append('customer_email', customerEmail);
      if (businessId) fd.append('business_id', businessId);

      const res = await fetch('/api/google/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Upload failed.');
        return;
      }

      alert(`Uploaded to ${data.folderPath}. Customer notification sent.`);
      setFile(null);
      setEventName('');
      setCustomerEmail('');
    } catch {
      alert('Something went wrong during upload.');
    } finally {
      setUploading(false);
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
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleUpload}
          disabled={uploading || !token}
          style={{
            padding: '10px',
            cursor: uploading || !token ? 'not-allowed' : 'pointer',
            opacity: !token ? 0.5 : 1,
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}
