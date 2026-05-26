'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [eventName, setEventName] = useState('');
  const [customerEmails, setCustomerEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      if (!localStorage.getItem('pd_remember') && !sessionStorage.getItem('pd_active')) {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }
      setToken(session.access_token);

      const { data } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_id', session.user.id);
      setBusinesses((data as Business[]) ?? []);
    }
    init();
  }, [router]);

  const addEmail = () => {
    const e = emailInput.trim().toLowerCase();
    if (e && !customerEmails.includes(e)) setCustomerEmails(prev => [...prev, e]);
    setEmailInput('');
  };

  const removeEmail = (e: string) => setCustomerEmails(prev => prev.filter(x => x !== e));

  const handleUpload = async () => {
    if (files.length === 0 || !eventName || customerEmails.length === 0) {
      alert('Please fill in all fields, add at least one customer email, and select files.');
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
        fd.append('customer_emails', customerEmails.join(','));
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

      alert(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded to ${folderPath}. ${customerEmails.length} customer${customerEmails.length > 1 ? 's' : ''} notified.`);
      setFiles([]);
      setEventName('');
      setCustomerEmails([]);
      setEmailInput('');
      setProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      alert('Something went wrong during upload.');
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  return (
    <>
      <div className="page">
        <header className="header">
          <Link href="/" className="brand">PhotoDrop</Link>
          <nav className="nav">
            <Link href="/dashboard" className="navLink">Dashboard</Link>
          </nav>
        </header>

        <main className="wrap">
          <section className="left">
            <p className="eyebrow">Upload photos</p>
            <h1 className="title">Deliver photos to your customers.</h1>
            <p className="subtext">
              Select one or more photos, enter the event name and customer email,
              and PhotoDrop will upload them to Google Drive and notify the
              customer automatically.
            </p>
          </section>

          <section className="card">
            <h2 className="cardTitle">New upload</h2>

            <div className="form">
              {businesses.length > 0 && (
                <div className="field">
                  <label>Business</label>
                  <select value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
                    <option value="">No business (30-day retention)</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="field">
                <label>Event name</label>
                <input
                  type="text"
                  placeholder="e.g. beach-wedding"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Customer emails</label>
                <div style={{ border: '1px solid #d1d5db', borderRadius: '10px', padding: '8px 10px', background: '#fafafa', display: 'flex', flexWrap: 'wrap' as const, gap: '6px', cursor: 'text' }} onClick={() => document.getElementById('email-tag-input')?.focus()}>
                  {customerEmails.map(e => (
                    <span key={e} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '999px', padding: '3px 10px', fontSize: '13px', fontWeight: 600 }}>
                      {e}
                      <button type="button" onClick={() => removeEmail(e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '14px', lineHeight: 1, padding: 0 }}>×</button>
                    </span>
                  ))}
                  <input
                    id="email-tag-input"
                    type="email"
                    placeholder={customerEmails.length === 0 ? 'customer@example.com' : 'Add another…'}
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEmail(); } if (e.key === 'Backspace' && !emailInput) removeEmail(customerEmails[customerEmails.length - 1]); }}
                    onBlur={addEmail}
                    style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '15px', minWidth: '180px', flex: 1, fontFamily: 'inherit', color: '#18202a' }}
                  />
                </div>
                <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#9ca3af' }}>Press Enter or comma to add each address</p>
              </div>

              <div className="field">
                <label>Photos</label>
                <div
                  className="dropZone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {files.length > 0 ? (
                    <span className="fileCount">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
                  ) : (
                    <span className="dropHint">Click to select photos</span>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
                  />
                </div>
              </div>

              <button
                className="btnPrimary"
                onClick={handleUpload}
                disabled={uploading || !token}
              >
                {uploading ? (progress || 'Uploading…') : 'Upload Photos'}
              </button>
            </div>
          </section>
        </main>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: linear-gradient(180deg, #faf7f0 0%, #f1eadc 100%);
          font-family: Arial, Helvetica, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          max-width: 1100px;
          margin: auto;
        }

        .brand {
          font-size: 32px;
          font-weight: bold;
          color: #2f9a45;
          text-decoration: none;
        }

        .nav {
          display: flex;
          gap: 16px;
        }

        .navLink {
          text-decoration: none;
          color: #333;
          font-weight: 600;
        }

        .wrap {
          display: grid;
          grid-template-columns: 1fr 440px;
          gap: 40px;
          max-width: 1100px;
          margin: auto;
          padding: 40px 20px 80px;
          align-items: start;
        }

        .eyebrow {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #5d7358;
          margin: 0 0 12px;
        }

        .title {
          font-size: 48px;
          font-weight: 300;
          letter-spacing: -0.04em;
          color: #101418;
          margin: 0 0 20px;
          line-height: 1.05;
        }

        .subtext {
          font-size: 18px;
          line-height: 1.7;
          color: #3f4752;
          margin: 0;
          max-width: 480px;
        }

        .card {
          background: white;
          padding: 32px;
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(70, 62, 39, 0.1);
        }

        .cardTitle {
          margin: 0 0 24px;
          font-size: 22px;
          color: #18202a;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-size: 13px;
          font-weight: 700;
          color: #4a5568;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        input,
        select {
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          font-size: 15px;
          font-family: Arial, Helvetica, sans-serif;
          color: #18202a;
          background: #fafafa;
          outline: none;
          transition: border-color 0.15s;
        }

        input:focus,
        select:focus {
          border-color: #2f9a45;
          background: white;
        }

        .dropZone {
          border: 2px dashed #d1d5db;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          background: #fafafa;
        }

        .dropZone:hover {
          border-color: #2f9a45;
          background: #f6fbf6;
        }

        .dropHint {
          color: #9ca3af;
          font-size: 14px;
        }

        .fileCount {
          color: #2f9a45;
          font-weight: 700;
          font-size: 14px;
        }

        .btnPrimary {
          margin-top: 4px;
          padding: 14px;
          border-radius: 999px;
          border: none;
          background: #efc93f;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
        }

        .btnPrimary:hover:not(:disabled) {
          transform: translateY(-1px);
          opacity: 0.9;
        }

        .btnPrimary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 800px) {
          .wrap {
            grid-template-columns: 1fr;
          }

          .title {
            font-size: 36px;
          }
        }
      `}</style>
    </>
  );
}
