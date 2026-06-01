'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

const font = "'Helvetica Neue', Arial, sans-serif";

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: '8px',
  border: '1.5px solid #e2e8f0', fontSize: '15px', fontFamily: font,
  color: '#0f172a', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' as const,
};

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    const { error } = await getSupabase().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/customer/albums` },
    });
    setLoading(false);
    if (error) { setError(error.message); } else { setSent(true); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: font, padding: '24px' }}>
      <Link href="/" style={{ fontSize: '22px', fontWeight: 300, letterSpacing: '-0.03em', color: '#0f172a', textDecoration: 'none', marginBottom: '32px' }}>
        PhotoDrop
      </Link>

      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', border: '1px solid #e8e8e8' }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 500, color: '#0f172a' }}>Check your email</h1>
            <p style={{ margin: 0, fontSize: '15px', color: '#64748b', lineHeight: 1.6 }}>
              We sent a sign-in link to <strong>{email}</strong>. Click it to view your photos.
            </p>
          </div>
        ) : (
          <>
            <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 500, color: '#0f172a' }}>View your photos</h1>
            <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#64748b' }}>Enter the email address your photos were sent to.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />

              {error && <p style={{ margin: 0, fontSize: '14px', color: '#ef4444' }}>{error}</p>}

              <button onClick={handleSend} disabled={loading || !email} style={{ padding: '13px', borderRadius: '8px', border: 'none', background: loading || !email ? '#94a3b8' : '#0f172a', color: 'white', fontWeight: 600, fontSize: '15px', cursor: loading || !email ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Sending…' : 'Send sign-in link'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
