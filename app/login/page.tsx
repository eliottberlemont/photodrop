'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

const font = "'Helvetica Neue', Arial, sans-serif";

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: '8px',
  border: '1.5px solid #e2e8f0', fontSize: '15px', fontFamily: font,
  color: '#0f172a', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' as const,
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600,
  textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#64748b', marginBottom: '6px',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pd_saved_creds');
    if (saved) {
      try {
        const { email: e, password: p } = JSON.parse(saved);
        setEmail(e ?? '');
        setPassword(p ?? '');
        setRemember(true);
      } catch {}
    }
  }, []);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      if (remember) {
        localStorage.setItem('pd_saved_creds', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('pd_saved_creds');
      }
      router.push('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: font, padding: '24px' }}>
      <Link href="/" style={{ fontSize: '22px', fontWeight: 300, letterSpacing: '-0.03em', color: '#0f172a', textDecoration: 'none', marginBottom: '32px' }}>
        PhotoDrop
      </Link>

      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', border: '1px solid #e8e8e8' }}>
        <h1 style={{ margin: '0 0 28px', fontSize: '24px', fontWeight: 500, color: '#0f172a' }}>Log in</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' as const }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: '15px', height: '15px', accentColor: '#0f172a', cursor: 'pointer' }} />
            <span style={{ fontSize: '14px', color: '#64748b' }}>Remember my details</span>
          </label>

          {error && <p style={{ margin: 0, fontSize: '14px', color: '#ef4444' }}>{error}</p>}

          <button onClick={handleLogin} disabled={loading} style={{ marginTop: '4px', padding: '13px', borderRadius: '8px', border: 'none', background: loading ? '#94a3b8' : '#0f172a', color: 'white', fontWeight: 600, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </div>

        <p style={{ margin: '20px 0 0', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'underline' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
