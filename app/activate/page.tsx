'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

const inputStyle: React.CSSProperties = {
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
  letterSpacing: '0.08em',
};

export default function ActivatePage() {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: license } = await supabase
        .from('user_licenses')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (license) { router.push('/dashboard'); return; }

      setToken(session.access_token);
    }
    init();
  }, [router]);

  const handleActivate = async () => {
    if (!key.trim() || !token) return;
    setLoading(true);
    setError('');

    const res = await fetch('/api/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ key: key.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Invalid key.');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div style={bg}>
      <Link href="/" style={{ fontSize: '28px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a', textDecoration: 'none', marginBottom: '32px' }}>
        PhotoDrop
      </Link>

      <div style={card}>
        <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 600, color: '#0f172a' }}>Access required</h1>
        <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
          Enter your activation key to unlock your account. Contact the administrator if you don't have one.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            style={inputStyle}
            type="text"
            placeholder="Activation key"
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleActivate()}
            autoFocus
          />

          {error && (
            <p style={{ margin: 0, fontSize: '14px', color: '#ef4444' }}>{error}</p>
          )}

          <button
            onClick={handleActivate}
            disabled={loading || !key.trim()}
            style={{
              padding: '14px',
              borderRadius: '999px',
              border: 'none',
              background: loading || !key.trim() ? '#93c5fd' : '#3b82f6',
              color: 'white',
              fontWeight: 700,
              fontSize: '16px',
              cursor: loading || !key.trim() ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
            }}
          >
            {loading ? 'Activating…' : 'Activate account'}
          </button>
        </div>
      </div>
    </div>
  );
}
