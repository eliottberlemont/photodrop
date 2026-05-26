'use client';

import { useState } from 'react';
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      if (remember) {
        localStorage.setItem('pd_remember', '1');
        sessionStorage.removeItem('pd_active');
      } else {
        sessionStorage.setItem('pd_active', '1');
        localStorage.removeItem('pd_remember');
      }
      router.push('/dashboard');
    }
  };

  return (
    <div style={bg}>
      <Link href="/" style={{ fontSize: '28px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a', textDecoration: 'none', marginBottom: '32px' }}>
        PhotoDrop
      </Link>

      <div style={card}>
        <h1 style={{ margin: '0 0 28px', fontSize: '26px', fontWeight: 600, color: '#0f172a' }}>Log in</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={label}>Email</label>
            <input
              style={input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div>
            <label style={label}>Password</label>
            <input
              style={input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' as const }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#3b82f6', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', color: '#64748b' }}>Keep me logged in</span>
          </label>

          {error && (
            <p style={{ margin: 0, fontSize: '14px', color: '#ef4444' }}>{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              marginTop: '4px',
              padding: '14px',
              borderRadius: '999px',
              border: 'none',
              background: loading ? '#93c5fd' : '#3b82f6',
              color: 'white',
              fontWeight: 700,
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
            }}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </div>

        <p style={{ margin: '20px 0 0', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
