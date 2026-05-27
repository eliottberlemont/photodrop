'use client';

import { useState } from 'react';
import Link from 'next/link';

const font = "'Helvetica Neue', Arial, sans-serif";

const steps = [
  {
    num: '01',
    title: 'Upload on-site',
    body: 'Right after the activity, open PhotoDrop on any device, select the photos and enter your customers\' emails.',
  },
  {
    num: '02',
    title: 'Automatic delivery',
    body: 'PhotoDrop emails each customer a branded link to their photos — before they even leave the dock.',
  },
  {
    num: '03',
    title: 'Customers relive the moment',
    body: 'Customers view and share their photos on any device. No app download, no account needed.',
  },
];

const features = [
  {
    icon: '📱',
    title: 'Works from any device',
    body: 'Upload from your phone, tablet, or laptop — no desktop app required.',
  },
  {
    icon: '✉️',
    title: 'Branded emails',
    body: 'Add your logo and a custom message so every delivery feels like it came from you.',
  },
  {
    icon: '📁',
    title: 'Organised storage',
    body: 'Photos are automatically sorted in Google Drive by date and event name.',
  },
  {
    icon: '👥',
    title: 'Multi-customer uploads',
    body: 'One upload, multiple recipients. Perfect for group activities.',
  },
  {
    icon: '⏱️',
    title: 'Retention control',
    body: 'Set how long photos stay available — per business or per upload.',
  },
  {
    icon: '📊',
    title: 'History dashboard',
    body: 'See every past upload, album, and customer in one place.',
  },
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleWaitlist = async () => {
    if (!email.includes('@')) return;
    setWaitlistStatus('loading');
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setWaitlistStatus(res.ok ? 'done' : 'error');
  };

  return (
    <div style={{ fontFamily: font, color: '#0f172a', background: '#fff' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 32px', height: '64px',
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <span style={{ fontSize: '22px', fontWeight: 200, letterSpacing: '-0.03em' }}>PhotoDrop</span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/pricing" style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textDecoration: 'none', padding: '8px 16px' }}>
            Pricing
          </Link>
          <Link href="/login" style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textDecoration: 'none', padding: '8px 16px' }}>
            Log in
          </Link>
          <Link href="/signup" style={{
            fontSize: '14px', fontWeight: 700, color: '#fff', textDecoration: 'none',
            padding: '9px 20px', borderRadius: '999px', background: '#3b82f6',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 50%, #e0f2fe 100%)',
        padding: 'clamp(80px, 12vw, 140px) 24px clamp(80px, 10vw, 120px)',
        textAlign: 'center',
      }}>
        <p style={{
          display: 'inline-block', marginBottom: '24px',
          fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#3b82f6', background: '#eff6ff', border: '1px solid #bfdbfe',
          padding: '5px 14px', borderRadius: '999px',
        }}>
          Built for parasailing, whale watching &amp; more
        </p>

        <h1 style={{
          fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 200, letterSpacing: '-0.04em',
          lineHeight: 1.05, margin: '0 auto 24px', maxWidth: '800px',
        }}>
          Deliver photos to your customers —&nbsp;automatically.
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)', color: '#475569', lineHeight: 1.7,
          maxWidth: '540px', margin: '0 auto 48px',
        }}>
          Upload from the boat or beach. Your customers get a branded email with their photos before they even get home.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            padding: '15px 40px', borderRadius: '999px', background: '#3b82f6', color: '#fff',
            fontWeight: 700, fontSize: '16px', textDecoration: 'none',
            boxShadow: '0 8px 28px rgba(59,130,246,0.35)',
          }}>
            Get started free
          </Link>
          <Link href="/login" style={{
            padding: '15px 40px', borderRadius: '999px', border: '2px solid #cbd5e1',
            background: 'transparent', color: '#0f172a', fontWeight: 700, fontSize: '16px', textDecoration: 'none',
          }}>
            Log in
          </Link>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) 24px', maxWidth: '960px', margin: '0 auto' }}>
        <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: '12px' }}>
          How it works
        </p>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 200, letterSpacing: '-0.03em', margin: '0 0 56px' }}>
          Three steps. That's it.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
          {steps.map(s => (
            <div key={s.num} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em' }}>{s.num}</span>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#0f172a' }}>{s.title}</h3>
              <p style={{ margin: 0, fontSize: '15px', color: '#64748b', lineHeight: 1.7 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ background: '#f8fafc', padding: 'clamp(64px, 8vw, 100px) 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: '12px' }}>
            Features
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 200, letterSpacing: '-0.03em', margin: '0 0 56px' }}>
            Everything you need, nothing you don't.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {features.map(f => (
              <div key={f.title} style={{
                background: 'white', borderRadius: '16px', padding: '28px',
                border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                <span style={{ fontSize: '28px' }}>{f.icon}</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.65 }}>{f.body}</p>
              </div>
            ))}
          </div>

          {/* Google Drive disclaimer */}
          <div style={{
            marginTop: '40px', padding: '18px 24px', borderRadius: '12px',
            background: '#fff7ed', border: '1px solid #fed7aa',
            display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>ℹ️</span>
            <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: 1.6 }}>
              <strong>Google Drive storage is not included.</strong> PhotoDrop stores photos in your connected Google Drive account. A free Google account includes 15 GB of storage — depending on your upload volume, a Google One subscription may be required for additional space.
            </p>
          </div>
        </div>
      </section>

      {/* ── Waitlist ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        padding: 'clamp(64px, 8vw, 100px) 24px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 200, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 12px' }}>
          Pricing coming soon.
        </h2>
        <p style={{ fontSize: '17px', color: '#bfdbfe', margin: '0 0 40px', lineHeight: 1.6 }}>
          Join the waitlist and be the first to know when plans go live.
        </p>

        {waitlistStatus === 'done' ? (
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '16px 32px', borderRadius: '12px' }}>
            You're on the list. We'll be in touch!
          </p>
        ) : (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '480px', margin: '0 auto' }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleWaitlist()}
              style={{
                flex: 1, minWidth: '200px', padding: '14px 18px', borderRadius: '999px',
                border: 'none', fontSize: '15px', fontFamily: font,
                outline: 'none', color: '#0f172a',
              }}
            />
            <button
              onClick={handleWaitlist}
              disabled={waitlistStatus === 'loading'}
              style={{
                padding: '14px 28px', borderRadius: '999px', border: 'none',
                background: waitlistStatus === 'loading' ? '#93c5fd' : '#fff',
                color: '#1e40af', fontWeight: 700, fontSize: '15px',
                cursor: waitlistStatus === 'loading' ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {waitlistStatus === 'loading' ? 'Joining…' : 'Join waitlist'}
            </button>
          </div>
        )}

        {waitlistStatus === 'error' && (
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#fca5a5' }}>Something went wrong — please try again.</p>
        )}
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '32px 24px', textAlign: 'center',
        borderTop: '1px solid #f1f5f9',
      }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
          © {new Date().getFullYear()} PhotoDrop. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
