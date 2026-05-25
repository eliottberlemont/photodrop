import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      padding: '24px',
    }}>
      {/* Brand */}
      <p style={{
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#3b82f6',
        margin: '0 0 20px',
      }}>
        Professional photo delivery
      </p>

      <h1 style={{
        fontSize: 'clamp(52px, 10vw, 110px)',
        fontWeight: 200,
        letterSpacing: '-0.04em',
        color: '#0f172a',
        margin: '0 0 24px',
        textAlign: 'center',
        lineHeight: 1,
      }}>
        PhotoDrop
      </h1>

      <p style={{
        fontSize: '18px',
        color: '#64748b',
        margin: '0 0 48px',
        textAlign: 'center',
        maxWidth: '380px',
        lineHeight: 1.6,
        fontWeight: 400,
      }}>
        Upload, organize, and deliver photos to your customers — automatically.
      </p>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/login" style={{
          padding: '14px 36px',
          borderRadius: '999px',
          border: '2px solid #0f172a',
          background: 'transparent',
          color: '#0f172a',
          fontWeight: 700,
          fontSize: '16px',
          textDecoration: 'none',
          letterSpacing: '0.02em',
        }}>
          Log In
        </Link>

        <Link href="/signup" style={{
          padding: '14px 36px',
          borderRadius: '999px',
          border: '2px solid transparent',
          background: '#3b82f6',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '16px',
          textDecoration: 'none',
          letterSpacing: '0.02em',
          boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
        }}>
          Sign Up
        </Link>
      </div>
    </div>
  );
}
