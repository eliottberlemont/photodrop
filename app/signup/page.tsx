'use client';

import { useState } from 'react';
import Link from 'next/link';

const font = "'Helvetica Neue', Arial, sans-serif";

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleJoin = async () => {
    if (!email.includes('@')) return;
    setStatus('loading');
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? 'done' : 'error');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: font, padding: '24px',
    }}>
      <Link href="/" style={{ fontSize: '28px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a', textDecoration: 'none', marginBottom: '32px' }}>
        PhotoDrop
      </Link>

      <div style={{
        background: 'white', borderRadius: '24px', padding: '40px',
        width: '100%', maxWidth: '440px',
        border: '1px solid #e8e8e8',
      }}>
        {status === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h1 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 600, color: '#0f172a' }}>You're on the list!</h1>
            <p style={{ margin: '0 0 24px', fontSize: '15px', color: '#64748b', lineHeight: 1.6 }}>
              We'll reach out when we're ready to bring you on board.
            </p>
            <Link href="/" style={{ fontSize: '14px', color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
              ← Back to home
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'inline-block', marginBottom: '20px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '6px' }}>
              Early access
            </div>

            <h1 style={{ margin: '0 0 12px', fontSize: '26px', fontWeight: 600, color: '#0f172a' }}>
              Request access
            </h1>
            <p style={{ margin: '0 0 28px', fontSize: '15px', color: '#64748b', lineHeight: 1.6 }}>
              PhotoDrop is currently invite-only. Join the waitlist and we'll be in touch when we're ready to bring you on.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                style={{
                  width: '100%', padding: '13px 16px', borderRadius: '10px',
                  border: '1.5px solid #e2e8f0', fontSize: '15px', fontFamily: font,
                  color: '#0f172a', background: '#f8fafc', outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />

              {status === 'error' && (
                <p style={{ margin: 0, fontSize: '14px', color: '#ef4444' }}>Something went wrong — please try again.</p>
              )}

              <button
                onClick={handleJoin}
                disabled={status === 'loading' || !email.includes('@')}
                style={{
                  padding: '13px', borderRadius: '8px', border: 'none',
                  background: status === 'loading' || !email.includes('@') ? '#94a3b8' : '#0f172a',
                  color: 'white', fontWeight: 600, fontSize: '15px',
                  cursor: status === 'loading' || !email.includes('@') ? 'not-allowed' : 'pointer',
                }}
              >
                {status === 'loading' ? 'Joining…' : 'Join waitlist'}
              </button>
            </div>

            <p style={{ margin: '24px 0 0', fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
              {' · '}
              <Link href="/signup/account" style={{ color: '#94a3b8', textDecoration: 'none' }}>Have an invitation?</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
