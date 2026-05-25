'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const handleConnect = () => {
    if (!userId) return;
    const params = new URLSearchParams({
      client_id: '49971326628-i70ptj87qfq956e0h864qpl21r7el37m.apps.googleusercontent.com',
      redirect_uri: `${window.location.origin}/api/google/callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/drive.file',
      access_type: 'offline',
      prompt: 'consent',
      state: userId,
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const handleSignOut = async () => {
    await getSupabase().auth.signOut();
    router.push('/');
  };

  const cardBase: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 12px rgba(59,130,246,0.08)',
    cursor: 'pointer',
    border: '1.5px solid #e2e8f0',
    textDecoration: 'none',
    color: '#0f172a',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 100%)',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 32px',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(59,130,246,0.1)',
      }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a', textDecoration: 'none' }}>
          PhotoDrop
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {email && <span style={{ fontSize: '14px', color: '#64748b' }}>{email}</span>}
          <button
            onClick={handleSignOut}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              border: '1.5px solid #e2e8f0',
              background: 'white',
              fontSize: '14px',
              fontWeight: 600,
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>
        <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3b82f6' }}>
          Dashboard
        </p>
        <h1 style={{ margin: '0 0 36px', fontSize: '36px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a' }}>
          Welcome back
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Upload */}
          <Link href="/upload" style={{ ...cardBase }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
              📷
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>Upload Photos</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Deliver photos to a customer</div>
            </div>
          </Link>

          {/* Connect Google Drive */}
          <button
            onClick={handleConnect}
            disabled={!userId}
            style={{
              ...cardBase,
              width: '100%',
              textAlign: 'left',
              opacity: userId ? 1 : 0.6,
              cursor: userId ? 'pointer' : 'not-allowed',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
              🔗
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>Connect Google Drive</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Authorise photo storage</div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
