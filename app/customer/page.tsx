'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

const bg: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  padding: '24px',
};

const card: React.CSSProperties = {
  background: 'white',
  borderRadius: '24px',
  padding: '40px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 20px 60px rgba(59,130,246,0.12)',
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: '#64748b',
  marginBottom: '6px',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1.5px solid #e2e8f0',
  fontSize: '15px',
  fontFamily: 'inherit',
  color: '#0f172a',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box' as const,
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
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div style={bg}>
      <Link href="/" style={{ fontSize: '28px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a', textDecoration: 'none', marginBottom: '32px' }}>
        PhotoDrop
      </Link>

      <div style={card}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📬</div>
            <h1 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 600, color: '#0f172a' }}>Check your email</h1>
            <p style={{ margin: 0, fontSize: '15px', color: '#64748b', lineHeight: 1.6 }}>
              We sent a sign-in link to <strong>{email}</strong>. Click it to view your photos.
            </p>
          </div>
        ) : (
          <>
            <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 600, color: '#0f172a' }}>View your photos</h1>
            <p style={{ margin: '0 0 28px', fontSize: '15px', color: '#64748b' }}>
              Enter the email address your photos were sent to.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={label}>Email address</label>
                <input
                  style={input}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
              </div>

              {error && <p style={{ margin: 0, fontSize: '14px', color: '#ef4444' }}>{error}</p>}

              <button
                onClick={handleSend}
                disabled={loading || !email}
                style={{
                  padding: '14px',
                  borderRadius: '999px',
                  border: 'none',
                  background: loading || !email ? '#93c5fd' : '#3b82f6',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: loading || !email ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
                }}
              >
                {loading ? 'Sending…' : 'Send sign-in link'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
