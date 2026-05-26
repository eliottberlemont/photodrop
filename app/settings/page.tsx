'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
  retention_days: number;
}

interface UserSettings {
  email_banner_url: string;
  email_custom_text: string;
  default_retention_days: number;
}

const sectionCard: React.CSSProperties = {
  background: 'white',
  borderRadius: '20px',
  padding: '28px 32px',
  boxShadow: '0 4px 20px rgba(59,130,246,0.08)',
  marginBottom: '20px',
};

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: '#64748b',
  marginBottom: '6px',
};

const fieldInput: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1.5px solid #e2e8f0',
  fontSize: '15px',
  fontFamily: 'inherit',
  color: '#0f172a',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const saveBtn = (loading: boolean): React.CSSProperties => ({
  marginTop: '16px',
  padding: '11px 24px',
  borderRadius: '999px',
  border: 'none',
  background: loading ? '#93c5fd' : '#3b82f6',
  color: 'white',
  fontWeight: 700,
  fontSize: '14px',
  cursor: loading ? 'not-allowed' : 'pointer',
});

function SaveStatus({ msg }: { msg: string }) {
  if (!msg) return null;
  const isError = msg.startsWith('Error');
  return (
    <p style={{ margin: '8px 0 0', fontSize: '13px', color: isError ? '#ef4444' : '#16a34a' }}>
      {msg}
    </p>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);

  // Account
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [accountMsg, setAccountMsg] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);

  // Email template
  const [bannerUrl, setBannerUrl] = useState('');
  const [customText, setCustomText] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Retention
  const [defaultRetention, setDefaultRetention] = useState(30);
  const [bizRetention, setBizRetention] = useState<Record<string, number>>({});
  const [retentionMsg, setRetentionMsg] = useState('');
  const [retentionLoading, setRetentionLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      if (!localStorage.getItem('pd_remember') && !sessionStorage.getItem('pd_active')) {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email ?? '');
      setNewEmail(user.email ?? '');

      const [settingsRes, bizRes] = await Promise.all([
        supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('businesses').select('id, name, retention_days').eq('owner_id', user.id),
      ]);

      if (settingsRes.data) {
        setBannerUrl(settingsRes.data.email_banner_url ?? '');
        setCustomText(settingsRes.data.email_custom_text ?? '');
        setDefaultRetention(settingsRes.data.default_retention_days ?? 30);
      }

      const bizList = (bizRes.data as Business[]) ?? [];
      setBusinesses(bizList);
      const retMap: Record<string, number> = {};
      bizList.forEach(b => { retMap[b.id] = b.retention_days; });
      setBizRetention(retMap);
    }
    init();
  }, [router]);

  const saveEmail = async () => {
    setAccountLoading(true);
    setAccountMsg('');
    const { error } = await getSupabase().auth.updateUser({ email: newEmail });
    setAccountLoading(false);
    setAccountMsg(error ? `Error: ${error.message}` : 'Confirmation sent to new email address.');
  };

  const savePassword = async () => {
    if (!newPassword) return;
    setAccountLoading(true);
    setAccountMsg('');
    const { error } = await getSupabase().auth.updateUser({ password: newPassword });
    setAccountLoading(false);
    if (!error) setNewPassword('');
    setAccountMsg(error ? `Error: ${error.message}` : 'Password updated.');
  };

  const saveEmailTemplate = async () => {
    if (!userId) return;
    setEmailLoading(true);
    setEmailMsg('');
    const { error } = await getSupabase().from('user_settings').upsert({
      user_id: userId,
      email_banner_url: bannerUrl || null,
      email_custom_text: customText || null,
      updated_at: new Date().toISOString(),
    });
    setEmailLoading(false);
    setEmailMsg(error ? `Error: ${error.message}` : 'Email template saved.');
  };

  const saveRetention = async () => {
    if (!userId) return;
    setRetentionLoading(true);
    setRetentionMsg('');
    const supabase = getSupabase();

    const [settingsResult, ...bizResults] = await Promise.all([
      supabase.from('user_settings').upsert({
        user_id: userId,
        default_retention_days: defaultRetention,
        updated_at: new Date().toISOString(),
      }),
      ...businesses.map(b =>
        supabase.from('businesses').update({ retention_days: bizRetention[b.id] }).eq('id', b.id)
      ),
    ]);

    const anyError = settingsResult.error || bizResults.some(r => r.error);
    setRetentionLoading(false);
    setRetentionMsg(anyError ? 'Error saving retention settings.' : 'Retention settings saved.');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 100%)', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a', textDecoration: 'none' }}>
          PhotoDrop
        </Link>
        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/dashboard" style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/upload" style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>Upload</Link>
        </nav>
      </header>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
        <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3b82f6' }}>
          Settings
        </p>
        <h1 style={{ margin: '0 0 36px', fontSize: '36px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a' }}>
          Your account
        </h1>

        {/* ── Account ── */}
        <div style={sectionCard}>
          <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Account</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={fieldLabel}>Email address</label>
              <input style={fieldInput} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            </div>
            <div>
              <button onClick={saveEmail} disabled={accountLoading || newEmail === userEmail} style={saveBtn(accountLoading)}>
                Update email
              </button>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '4px' }}>
              <label style={fieldLabel}>New password</label>
              <input style={fieldInput} type="password" placeholder="Enter a new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div>
              <button onClick={savePassword} disabled={accountLoading || !newPassword} style={saveBtn(accountLoading)}>
                Update password
              </button>
            </div>
          </div>

          <SaveStatus msg={accountMsg} />
        </div>

        {/* ── Email template ── */}
        <div style={sectionCard}>
          <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Customer email</h2>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b' }}>
            Customise the email your customers receive when photos are ready.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={fieldLabel}>Banner image URL</label>
              <input
                style={fieldInput}
                type="url"
                placeholder="https://your-site.com/banner.jpg"
                value={bannerUrl}
                onChange={e => setBannerUrl(e.target.value)}
              />
              {bannerUrl && (
                <img src={bannerUrl} alt="Banner preview" style={{ marginTop: '10px', maxWidth: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px' }} />
              )}
            </div>

            <div>
              <label style={fieldLabel}>Custom message</label>
              <textarea
                style={{ ...fieldInput, minHeight: '100px', resize: 'vertical' as const, lineHeight: 1.6 }}
                placeholder="e.g. Thank you for choosing us! We hope you love your photos."
                value={customText}
                onChange={e => setCustomText(e.target.value)}
              />
            </div>

            <button onClick={saveEmailTemplate} disabled={emailLoading} style={saveBtn(emailLoading)}>
              Save email template
            </button>
          </div>

          <SaveStatus msg={emailMsg} />
        </div>

        {/* ── Retention ── */}
        <div style={sectionCard}>
          <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Photo retention</h2>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b' }}>
            How long photos are kept before being deleted from Google Drive.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={fieldLabel}>Default retention (days)</label>
              <input
                style={{ ...fieldInput, width: '120px' }}
                type="number"
                min={1}
                max={365}
                value={defaultRetention}
                onChange={e => setDefaultRetention(Number(e.target.value))}
              />
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#94a3b8' }}>Applied when no business is selected on upload.</p>
            </div>

            {businesses.length > 0 && (
              <div>
                <label style={{ ...fieldLabel, marginBottom: '10px' }}>Per-business retention</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {businesses.map(b => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ flex: 1, fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{b.name}</span>
                      <input
                        style={{ ...fieldInput, width: '90px' }}
                        type="number"
                        min={1}
                        max={365}
                        value={bizRetention[b.id] ?? 30}
                        onChange={e => setBizRetention(prev => ({ ...prev, [b.id]: Number(e.target.value) }))}
                      />
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>days</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={saveRetention} disabled={retentionLoading} style={saveBtn(retentionLoading)}>
              Save retention settings
            </button>
          </div>

          <SaveStatus msg={retentionMsg} />
        </div>
      </main>
    </div>
  );
}
