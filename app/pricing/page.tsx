import Link from 'next/link';

const font = "'Helvetica Neue', Arial, sans-serif";

const tiers = [
  {
    name: 'Starter',
    badge: null,
    price: 'Coming soon',
    description: 'Perfect for small operators and solo photographers.',
    features: [
      '1 business profile',
      'Unlimited photo uploads',
      '30-day photo retention',
      'Branded customer emails',
      'Multi-customer upload',
      'Upload history dashboard',
    ],
    cta: 'Join waitlist',
    ctaHref: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    badge: 'Most popular',
    price: 'Coming soon',
    description: 'For growing businesses with multiple locations or brands.',
    features: [
      'Multiple business profiles',
      'Unlimited photo uploads',
      'Custom retention periods per business',
      'Branded customer emails with logo',
      'Custom email subject lines',
      'Priority support',
    ],
    cta: 'Join waitlist',
    ctaHref: '/signup',
    highlight: true,
  },
  {
    name: 'Enterprise',
    badge: null,
    price: 'Contact us',
    description: 'For high-volume operators who need full control over their data.',
    features: [
      'Everything in Pro',
      'Self-hosted NAS storage option',
      'Custom data retention policies',
      'Dedicated onboarding',
      'SLA-backed support',
      'Custom integrations',
    ],
    cta: 'Get in touch',
    ctaHref: '/signup',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div style={{ fontFamily: font, color: '#0f172a', background: '#fff', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 32px', height: '64px',
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8e8e8', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ fontSize: '22px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a', textDecoration: 'none' }}>
          PhotoDrop
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/pricing" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', textDecoration: 'none', padding: '8px 16px' }}>Pricing</Link>
          <Link href="/login" style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textDecoration: 'none', padding: '8px 16px' }}>Log in</Link>
          <Link href="/signup" style={{
            fontSize: '14px', fontWeight: 700, color: '#fff', textDecoration: 'none',
            padding: '8px 18px', borderRadius: '8px', background: '#0f172a',
          }}>Get started</Link>
        </div>
      </nav>

      {/* Header */}
      <section style={{
        background: '#f8fafc',
        padding: 'clamp(64px, 10vw, 100px) 24px clamp(48px, 8vw, 80px)',
        textAlign: 'center',
        borderBottom: '1px solid #e8e8e8',
      }}>
        <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '16px' }}>
          Pricing
        </p>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 200, letterSpacing: '-0.04em', margin: '0 0 20px', lineHeight: 1.05 }}>
          Simple, transparent pricing.
        </h1>
        <p style={{ fontSize: '18px', color: '#475569', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          Plans are coming soon. Join the waitlist to get early access and be the first to know when we launch.
        </p>
      </section>

      {/* Tiers */}
      <section style={{ maxWidth: '1040px', margin: '0 auto', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>
          {tiers.map(t => (
            <div key={t.name} style={{
              borderRadius: '20px', padding: '32px',
              border: t.highlight ? '2px solid #0f172a' : '1px solid #e8e8e8',
              background: 'white',
              boxShadow: 'none',
              display: 'flex', flexDirection: 'column', gap: '0',
              position: 'relative' as const,
            }}>
              {t.badge && (
                <div style={{
                  position: 'absolute' as const, top: '-13px', left: '50%', transform: 'translateX(-50%)',
                  background: '#0f172a', color: '#fff', fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                  padding: '4px 14px', borderRadius: '999px', whiteSpace: 'nowrap' as const,
                }}>
                  {t.badge}
                </div>
              )}

              <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>{t.name}</h2>
              <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>{t.description}</p>

              <div style={{ margin: '0 0 24px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{t.price}</span>
              </div>

              <ul style={{ margin: '0 0 32px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {t.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#374151' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={t.ctaHref} style={{
                display: 'block', textAlign: 'center',
                padding: '13px', borderRadius: '999px', textDecoration: 'none',
                fontWeight: 700, fontSize: '15px',
                background: t.highlight ? '#0f172a' : 'transparent',
                color: t.highlight ? '#fff' : '#0f172a',
                border: t.highlight ? 'none' : '1.5px solid #e2e8f0',
                boxShadow: 'none',
                marginTop: 'auto',
              }}>
                {t.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Google Drive note */}
        <div style={{
          marginTop: '48px', padding: '20px 24px', borderRadius: '12px',
          background: '#fff7ed', border: '1px solid #fed7aa',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>ℹ️</span>
          <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: 1.6 }}>
            <strong>Google Drive storage is not included in any plan.</strong> PhotoDrop stores photos in your connected Google Drive account. A free Google account includes 15 GB — depending on your upload volume, a Google One subscription may be required for additional storage.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
          © {new Date().getFullYear()} PhotoDrop. All rights reserved.{' '}
          <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
        </p>
      </footer>
    </div>
  );
}
