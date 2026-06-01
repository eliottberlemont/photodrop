'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const font = "'Helvetica Neue', Arial, sans-serif";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { ref, visible } = useFadeIn();
  return (
    <div ref={ref} style={{
      border: `1.5px solid ${visible ? '#0f172a' : 'transparent'}`,
      borderRadius: '20px',
      padding: 'clamp(32px, 5vw, 56px)',
      transition: 'border-color 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
      ...style,
    }}>
      {children}
    </div>
  );
}

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

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 clamp(20px, 4vw, 48px)', height: '60px',
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e8e8e8',
      }}>
        <span style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '-0.02em' }}>PhotoDrop</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/pricing" style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', textDecoration: 'none', padding: '8px 14px' }}>
            Pricing
          </Link>
          <Link href="/login" style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', textDecoration: 'none', padding: '8px 14px' }}>
            Log in
          </Link>
          <Link href="/signup" style={{
            fontSize: '14px', fontWeight: 600, color: '#fff', textDecoration: 'none',
            padding: '8px 18px', borderRadius: '8px', background: '#0f172a',
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: '860px', margin: '0 auto',
        padding: 'clamp(80px, 14vw, 160px) clamp(20px, 4vw, 48px) clamp(60px, 10vw, 120px)',
      }}>
        <h1 style={{
          fontSize: 'clamp(44px, 8vw, 96px)', fontWeight: 300, letterSpacing: '-0.04em',
          lineHeight: 1.02, margin: '0 0 32px', color: '#0f172a',
        }}>
          Take the photo.<br />Your customer gets it.<br />
          <span style={{ color: '#94a3b8' }}>That's the whole thing.</span>
        </h1>
        <p style={{
          fontSize: 'clamp(16px, 2vw, 19px)', color: '#475569', lineHeight: 1.75,
          maxWidth: '520px', margin: '0 0 48px',
        }}>
          Upload photos from any device, add a customer's email, and PhotoDrop sends them a link. No app required on their end. No manual file sharing. It just works.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            padding: '13px 32px', borderRadius: '8px', background: '#0f172a', color: '#fff',
            fontWeight: 600, fontSize: '15px', textDecoration: 'none',
          }}>
            Request access
          </Link>
          <Link href="/login" style={{
            padding: '13px 32px', borderRadius: '8px', border: '1.5px solid #cbd5e1',
            background: 'transparent', color: '#0f172a', fontWeight: 600, fontSize: '15px', textDecoration: 'none',
          }}>
            Log in
          </Link>
        </div>
      </section>

      {/* Sections wrapper */}
      <div style={{
        maxWidth: '860px', margin: '0 auto',
        padding: '0 clamp(20px, 4vw, 48px) clamp(80px, 10vw, 120px)',
        display: 'flex', flexDirection: 'column', gap: '20px',
      }}>

        {/* How it works */}
        <Section>
          <p style={{ margin: '0 0 40px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em' }}>
            How it works
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
            {[
              { n: '01', title: 'Upload', body: 'Open PhotoDrop, pick the photos, type in the customer\'s email. Takes about thirty seconds.' },
              { n: '02', title: 'Deliver', body: 'We email your customer a link to their album. Your logo, your message, your brand.' },
              { n: '03', title: 'Done', body: 'They open the link, view their photos, share them. No account needed on their side.' },
            ].map(s => (
              <div key={s.n}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '14px' }}>{s.n}</span>
                <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 600 }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* What's included */}
        <Section>
          <p style={{ margin: '0 0 32px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em' }}>
            What's included
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0' }}>
            {[
              ['Upload from anywhere', 'Your phone on the water, your laptop at the office. Doesn\'t matter.'],
              ['One upload, multiple people', 'Add as many email addresses as you need on a single upload.'],
              ['Your branding on every email', 'Add a banner image and custom message. Customers see your name, not ours.'],
              ['Photos live in your Google Drive', 'Sorted by date and event automatically. You always own the files.'],
              ['Set when links expire', 'Choose how long each album stays accessible — a week, a month, up to a year.'],
              ['Full upload history', 'See every album you\'ve sent, who got it, and when.'],
            ].map(([title, body], i) => (
              <div key={title} style={{
                padding: '24px 0',
                borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
                display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', alignItems: 'start',
              }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{title}</span>
                <span style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.65 }}>{body}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Google Drive note */}
        <Section style={{ background: '#fafafa' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em' }}>
            Storage
          </p>
          <p style={{ margin: 0, fontSize: '15px', color: '#374151', lineHeight: 1.75, maxWidth: '600px' }}>
            <strong>Google Drive storage is not included.</strong> PhotoDrop connects to your Google account and stores photos there. A standard Google account gives you 15 GB free. Depending on how many photos you take, you may need a Google One plan for more space — that's between you and Google.
          </p>
        </Section>

        {/* Waitlist */}
        <Section>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em' }}>
            Pricing
          </p>
          <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 300, letterSpacing: '-0.03em' }}>
            Working on it.
          </h2>
          <p style={{ margin: '0 0 28px', fontSize: '15px', color: '#64748b', lineHeight: 1.7 }}>
            Pricing isn't live yet. Leave your email and we'll reach out when it is.
          </p>

          {waitlistStatus === 'done' ? (
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#16a34a' }}>Got it — we'll be in touch.</p>
          ) : (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', maxWidth: '460px' }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleWaitlist()}
                style={{
                  flex: 1, minWidth: '180px', padding: '12px 16px', borderRadius: '8px',
                  border: '1.5px solid #e2e8f0', fontSize: '15px', fontFamily: font,
                  outline: 'none', color: '#0f172a', background: '#f8fafc',
                }}
              />
              <button
                onClick={handleWaitlist}
                disabled={waitlistStatus === 'loading'}
                style={{
                  padding: '12px 24px', borderRadius: '8px', border: 'none',
                  background: waitlistStatus === 'loading' ? '#94a3b8' : '#0f172a',
                  color: '#fff', fontWeight: 600, fontSize: '14px',
                  cursor: waitlistStatus === 'loading' ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {waitlistStatus === 'loading' ? 'Joining…' : 'Join waitlist'}
              </button>
            </div>
          )}
          {waitlistStatus === 'error' && (
            <p style={{ marginTop: '10px', fontSize: '13px', color: '#ef4444' }}>Something went wrong — try again.</p>
          )}
        </Section>

      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #f1f5f9', padding: '28px clamp(20px, 4vw, 48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>© {new Date().getFullYear()} PhotoDrop</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/pricing" style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/login" style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'none' }}>Log in</Link>
        </div>
      </footer>

    </div>
  );
}
