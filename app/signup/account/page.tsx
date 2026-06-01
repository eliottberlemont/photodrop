'use client';

import { useState } from 'react';
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

export default function SignupAccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const { error } = await getSupabase().auth.signUp({ email, password });
    setLoading(false);
    if (error) { setError(error.message); } else { router.push('/activate'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: font, padding: '24px' }}>
      <Link href="/" style={{ fontSize: '22px', fontWeight: 300, letterSpacing: '-0.03em', color: '#0f172a', textDecoration: 'none', marginBottom: '32px' }}>
        PhotoDrop
      </Link>

      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', border: '1px solid #e8e8e8' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 500, color: '#0f172a' }}>Create your account</h1>
        <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#64748b' }}>You'll need an activation key after signing up.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignup()} />
          </div>

          {error && <p style={{ margin: 0, fontSize: '14px', color: '#ef4444' }}>{error}</p>}

          <button onClick={handleSignup} disabled={loading} style={{ marginTop: '4px', padding: '13px', borderRadius: '8px', border: 'none', background: loading ? '#94a3b8' : '#0f172a', color: 'white', fontWeight: 600, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </div>

        <p style={{ margin: '20px 0 0', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'underline' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
