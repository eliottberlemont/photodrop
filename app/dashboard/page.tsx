'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

type Tab = 'overview' | 'history' | 'messages' | 'settings';

interface FileRow {
  id: string;
  drive_folder_path: string;
  customer_email: string;
  uploaded_at: string;
  expires_at: string;
}

interface Business {
  id: string;
  name: string;
  retention_days: number;
}

interface UserSettings {
  email_banner_url: string | null;
  email_custom_text: string | null;
  default_retention_days: number;
}

// ── Shared styles ──────────────────────────────────────
const card: React.CSSProperties = {
  background: 'white',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 4px 20px rgba(59,130,246,0.08)',
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

const primaryBtn = (disabled = false): React.CSSProperties => ({
  padding: '11px 24px',
  borderRadius: '999px',
  border: 'none',
  background: disabled ? '#93c5fd' : '#3b82f6',
  color: 'white',
  fontWeight: 700,
  fontSize: '14px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  marginTop: '16px',
});

function SaveStatus({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p style={{ margin: '10px 0 0', fontSize: '13px', color: msg.startsWith('Error') ? '#ef4444' : '#16a34a' }}>{msg}</p>;
}

// ── History helpers ──────────────────────────────────────
function buildHistory(files: FileRow[]) {
  const byDate = new Map<string, Map<string, { photos: number; customers: Set<string> }>>();
  for (const f of files) {
    const date = f.uploaded_at.slice(0, 10);
    const name = f.drive_folder_path.split('/').pop() ?? f.drive_folder_path;
    if (!byDate.has(date)) byDate.set(date, new Map());
    const day = byDate.get(date)!;
    if (!day.has(name)) day.set(name, { photos: 0, customers: new Set() });
    const album = day.get(name)!;
    album.photos += 1;
    album.customers.add(f.customer_email);
  }
  return [...byDate.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

// ── Main component ────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ email_banner_url: null, email_custom_text: null, default_retention_days: 30 });
  const [loading, setLoading] = useState(true);

  // Messages tab state
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerUploading, setBannerUploading] = useState(false);
  const [customText, setCustomText] = useState('');
  const [msgSaveMsg, setMsgSaveMsg] = useState('');
  const [msgSaving, setMsgSaving] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Settings tab state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [defaultRetention, setDefaultRetention] = useState(30);
  const [bizRetention, setBizRetention] = useState<Record<string, number>>({});
  const [acctMsg, setAcctMsg] = useState('');
  const [retMsg, setRetMsg] = useState('');
  const [acctSaving, setAcctSaving] = useState(false);
  const [retSaving, setRetSaving] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      setUserEmail(user.email ?? '');
      setNewEmail(user.email ?? '');

      const [filesRes, settingsRes, bizRes, tokenRes] = await Promise.all([
        supabase.from('uploaded_files').select('id,drive_folder_path,customer_email,uploaded_at,expires_at').eq('user_id', user.id).is('deleted_at', null).order('uploaded_at', { ascending: false }),
        supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('businesses').select('id,name,retention_days').eq('owner_id', user.id),
        supabase.from('google_tokens').select('user_id').eq('user_id', user.id).maybeSingle(),
      ]);

      setFiles((filesRes.data as FileRow[]) ?? []);
      setDriveConnected(!!tokenRes.data);

      const biz = (bizRes.data as Business[]) ?? [];
      setBusinesses(biz);
      const retMap: Record<string, number> = {};
      biz.forEach(b => { retMap[b.id] = b.retention_days; });
      setBizRetention(retMap);

      if (settingsRes.data) {
        setSettings(settingsRes.data as UserSettings);
        setBannerUrl(settingsRes.data.email_banner_url ?? '');
        setCustomText(settingsRes.data.email_custom_text ?? '');
        setDefaultRetention(settingsRes.data.default_retention_days ?? 30);
      }

      setLoading(false);
    }
    init();
  }, [router]);

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

  const handleBannerUpload = async (file: File) => {
    if (!userId) return;
    setBannerUploading(true);
    setMsgSaveMsg('');
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/banner.${ext}`;
    const supabase = getSupabase();
    const { error: upErr } = await supabase.storage.from('banners').upload(path, file, { upsert: true });
    if (upErr) { setMsgSaveMsg(`Error: ${upErr.message}`); setBannerUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(path);
    setBannerUrl(publicUrl);
    const { error: dbErr } = await supabase.from('user_settings').upsert({ user_id: userId, email_banner_url: publicUrl, email_custom_text: customText || null, updated_at: new Date().toISOString() });
    setBannerUploading(false);
    setMsgSaveMsg(dbErr ? `Error saving: ${dbErr.message}` : 'Banner saved.');
  };

  const removeBanner = async () => {
    if (!userId) return;
    setBannerUrl('');
    await getSupabase().from('user_settings').upsert({ user_id: userId, email_banner_url: null, email_custom_text: customText || null, updated_at: new Date().toISOString() });
    setMsgSaveMsg('Banner removed.');
  };

  const saveMessages = async () => {
    if (!userId) return;
    setMsgSaving(true); setMsgSaveMsg('');
    const { error } = await getSupabase().from('user_settings').upsert({ user_id: userId, email_banner_url: bannerUrl || null, email_custom_text: customText || null, updated_at: new Date().toISOString() });
    setMsgSaving(false);
    setMsgSaveMsg(error ? `Error: ${error.message}` : 'Saved.');
  };

  const saveEmail = async () => {
    setAcctSaving(true); setAcctMsg('');
    const { error } = await getSupabase().auth.updateUser({ email: newEmail });
    setAcctSaving(false);
    setAcctMsg(error ? `Error: ${error.message}` : 'Confirmation sent to new address.');
  };

  const savePassword = async () => {
    if (!newPassword) return;
    setAcctSaving(true); setAcctMsg('');
    const { error } = await getSupabase().auth.updateUser({ password: newPassword });
    setAcctSaving(false);
    if (!error) setNewPassword('');
    setAcctMsg(error ? `Error: ${error.message}` : 'Password updated.');
  };

  const saveRetention = async () => {
    if (!userId) return;
    setRetSaving(true); setRetMsg('');
    const supabase = getSupabase();
    const [r1, ...rest] = await Promise.all([
      supabase.from('user_settings').upsert({ user_id: userId, default_retention_days: defaultRetention, updated_at: new Date().toISOString() }),
      ...businesses.map(b => supabase.from('businesses').update({ retention_days: bizRetention[b.id] }).eq('id', b.id)),
    ]);
    setRetSaving(false);
    setRetMsg(r1.error || rest.some(r => r.error) ? 'Error saving.' : 'Retention saved.');
  };

  // Computed metrics
  const totalPhotos = files.length;
  const totalCustomers = new Set(files.map(f => f.customer_email)).size;
  const totalAlbums = new Set(files.map(f => f.drive_folder_path)).size;
  const expiringCount = files.filter(f => new Date(f.expires_at) <= new Date(Date.now() + 7 * 86_400_000)).length;
  const history = buildHistory(files);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'history', label: 'History' },
    { key: 'messages', label: 'Messages' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 100%)', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(59,130,246,0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/" style={{ fontSize: '22px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a', textDecoration: 'none' }}>PhotoDrop</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {userEmail && <span style={{ fontSize: '13px', color: '#94a3b8' }}>{userEmail}</span>}
          <Link href="/upload" style={{ padding: '8px 18px', borderRadius: '999px', background: '#3b82f6', color: 'white', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>Upload photos</Link>
          <button onClick={handleSignOut} style={{ padding: '8px 18px', borderRadius: '999px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '13px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>Sign out</button>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{ background: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(59,130,246,0.08)', padding: '0 32px', display: 'flex', gap: '4px' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '14px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? '#3b82f6' : '#64748b',
              borderBottom: tab === t.key ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: '-1px',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading…</p>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div>
                <h1 style={{ margin: '0 0 28px', fontSize: '32px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a' }}>Overview</h1>

                {/* Metrics grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '28px' }}>
                  {[
                    { label: 'Photos uploaded', value: totalPhotos },
                    { label: 'Customers reached', value: totalCustomers },
                    { label: 'Albums created', value: totalAlbums },
                    { label: 'Expiring in 7 days', value: expiringCount, warn: expiringCount > 0 },
                  ].map(m => (
                    <div key={m.label} style={{ ...card, textAlign: 'center' as const }}>
                      <div style={{ fontSize: '42px', fontWeight: 200, color: m.warn ? '#f59e0b' : '#0f172a', letterSpacing: '-0.02em' }}>{m.value}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link href="/upload" style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: '#0f172a', cursor: 'pointer' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>📷</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>Upload photos</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Deliver a new album to customers</div>
                    </div>
                  </Link>

                  {driveConnected === true && (
                    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>✅</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#16a34a' }}>Google Drive connected</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Photos are being saved to your Drive</div>
                      </div>
                    </div>
                  )}

                  {driveConnected === false && (
                    <button onClick={handleConnect} style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px', width: '100%', textAlign: 'left', border: '1.5px solid #e2e8f0', cursor: 'pointer' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🔗</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>Connect Google Drive</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Required before uploading photos</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── HISTORY ── */}
            {tab === 'history' && (
              <div>
                <h1 style={{ margin: '0 0 28px', fontSize: '32px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a' }}>History</h1>
                {history.length === 0 ? (
                  <div style={{ ...card, textAlign: 'center', color: '#94a3b8', padding: '48px' }}>No uploads yet.</div>
                ) : (
                  history.map(([date, albums]) => (
                    <div key={date} style={{ marginBottom: '28px' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[...albums.entries()].map(([name, data]) => (
                          <div key={name} style={{ ...card, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>{name.replace(/-/g, ' ')}</div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                              <span style={{ fontSize: '13px', color: '#64748b' }}>{data.photos} photo{data.photos !== 1 ? 's' : ''}</span>
                              <span style={{ fontSize: '13px', color: '#64748b' }}>{data.customers.size} customer{data.customers.size !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── MESSAGES ── */}
            {tab === 'messages' && (
              <div>
                <h1 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a' }}>Messages</h1>
                <p style={{ margin: '0 0 28px', fontSize: '15px', color: '#64748b' }}>Customise the email your customers receive when their photos are ready.</p>

                <div style={card}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={fieldLabel}>Banner image</label>
                      <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleBannerUpload(f); }} />
                      {bannerUrl ? (
                        <div>
                          <img src={bannerUrl} alt="Banner" style={{ maxWidth: '100%', maxHeight: '130px', objectFit: 'cover', borderRadius: '10px', display: 'block', marginBottom: '10px' }} />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" onClick={() => bannerInputRef.current?.click()} disabled={bannerUploading} style={{ padding: '7px 16px', borderRadius: '999px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '13px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                              {bannerUploading ? 'Uploading…' : 'Change image'}
                            </button>
                            <button type="button" onClick={removeBanner} style={{ padding: '7px 16px', borderRadius: '999px', border: '1.5px solid #fecaca', background: 'white', fontSize: '13px', fontWeight: 600, color: '#ef4444', cursor: 'pointer' }}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => !bannerUploading && bannerInputRef.current?.click()}
                          style={{ border: '2px dashed #d1d5db', borderRadius: '10px', padding: '28px', textAlign: 'center' as const, cursor: bannerUploading ? 'not-allowed' : 'pointer', background: '#fafafa', color: bannerUploading ? '#94a3b8' : '#64748b', fontSize: '14px' }}
                        >
                          {bannerUploading ? 'Uploading…' : 'Click to upload a banner image'}
                        </div>
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
                    <button onClick={saveMessages} disabled={msgSaving} style={primaryBtn(msgSaving)}>Save message</button>
                  </div>
                  <SaveStatus msg={msgSaveMsg} />
                </div>
              </div>
            )}

            {/* ── SETTINGS ── */}
            {tab === 'settings' && (
              <div>
                <h1 style={{ margin: '0 0 28px', fontSize: '32px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a' }}>Settings</h1>

                {/* Account */}
                <div style={{ ...card, marginBottom: '20px' }}>
                  <h2 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Account</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={fieldLabel}>Email address</label>
                      <input style={fieldInput} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                      <button onClick={saveEmail} disabled={acctSaving || newEmail === userEmail} style={primaryBtn(acctSaving || newEmail === userEmail)}>Update email</button>
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <label style={fieldLabel}>New password</label>
                      <input style={fieldInput} type="password" placeholder="Enter a new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      <button onClick={savePassword} disabled={acctSaving || !newPassword} style={primaryBtn(acctSaving || !newPassword)}>Update password</button>
                    </div>
                  </div>
                  <SaveStatus msg={acctMsg} />
                </div>

                {/* Retention */}
                <div style={card}>
                  <h2 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Photo retention</h2>
                  <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#64748b' }}>How many days photos are kept before being deleted from Google Drive.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={fieldLabel}>Default (days)</label>
                      <input style={{ ...fieldInput, width: '120px' }} type="number" min={1} max={365} value={defaultRetention} onChange={e => setDefaultRetention(Number(e.target.value))} />
                      <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#94a3b8' }}>Used when no business is selected on upload.</p>
                    </div>
                    {businesses.length > 0 && (
                      <div>
                        <label style={{ ...fieldLabel, marginBottom: '10px' }}>Per business</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {businesses.map(b => (
                            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ flex: 1, fontSize: '15px', color: '#0f172a' }}>{b.name}</span>
                              <input style={{ ...fieldInput, width: '90px' }} type="number" min={1} max={365} value={bizRetention[b.id] ?? 30} onChange={e => setBizRetention(p => ({ ...p, [b.id]: Number(e.target.value) }))} />
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>days</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <button onClick={saveRetention} disabled={retSaving} style={primaryBtn(retSaving)}>Save retention</button>
                  </div>
                  <SaveStatus msg={retMsg} />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
