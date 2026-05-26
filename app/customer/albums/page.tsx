'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

interface UploadedFile {
  id: string;
  drive_folder_path: string;
  folder_link: string | null;
  file_name: string;
  uploaded_at: string;
  expires_at: string;
}

interface Album {
  folderPath: string;
  folderLink: string | null;
  eventName: string;
  count: number;
  expiresAt: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toDateStr(iso: string) {
  return iso.slice(0, 10); // YYYY-MM-DD
}

function getCalendarDays(year: number, month: number) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function CustomerAlbumsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [allFiles, setAllFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(toDateStr(today.toISOString()));

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/customer');
        return;
      }
      setEmail(session.user.email ?? null);

      const { data } = await supabase
        .from('uploaded_files')
        .select('id, drive_folder_path, folder_link, file_name, uploaded_at, expires_at')
        .is('deleted_at', null)
        .order('uploaded_at', { ascending: false });

      setAllFiles((data as UploadedFile[]) ?? []);
      setLoading(false);
    }
    init();
  }, [router]);

  const datesWithPhotos = new Set(allFiles.map(f => toDateStr(f.uploaded_at)));

  // Group selected day's files into albums by folder path
  const dayFiles = allFiles.filter(f => toDateStr(f.uploaded_at) === selectedDate);
  const albumMap = new Map<string, Album>();
  for (const f of dayFiles) {
    const existing = albumMap.get(f.drive_folder_path);
    if (existing) {
      existing.count += 1;
    } else {
      const segments = f.drive_folder_path.split('/');
      albumMap.set(f.drive_folder_path, {
        folderPath: f.drive_folder_path,
        folderLink: f.folder_link,
        eventName: segments[segments.length - 1],
        count: 1,
        expiresAt: f.expires_at,
      });
    }
  }
  const albums = Array.from(albumMap.values());

  const calDays = getCalendarDays(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const handleSignOut = async () => {
    await getSupabase().auth.signOut();
    router.push('/customer');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
        <p style={{ color: '#64748b' }}>Loading your photos…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 100%)', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a', textDecoration: 'none' }}>
          PhotoDrop
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {email && <span style={{ fontSize: '14px', color: '#64748b' }}>{email}</span>}
          <button onClick={handleSignOut} style={{ padding: '8px 18px', borderRadius: '999px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '14px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ margin: '0 0 32px', fontSize: '32px', fontWeight: 200, letterSpacing: '-0.03em', color: '#0f172a' }}>
          Your photo albums
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Calendar */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 20px rgba(59,130,246,0.1)' }}>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b', padding: '4px 8px' }}>‹</button>
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{MONTHS[calMonth]} {calYear}</span>
              <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b', padding: '4px 8px' }}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#94a3b8', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
              {calDays.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasPhotos = datesWithPhotos.has(dateStr);
                const isSelected = dateStr === selectedDate;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(dateStr)}
                    style={{
                      position: 'relative',
                      padding: '6px 2px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSelected ? '#3b82f6' : 'transparent',
                      color: isSelected ? 'white' : hasPhotos ? '#1d4ed8' : '#64748b',
                      fontWeight: hasPhotos || isSelected ? 700 : 400,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    {day}
                    {hasPhotos && (
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.8)' : '#3b82f6' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Albums for selected day */}
          <div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            {albums.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(59,130,246,0.08)' }}>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px' }}>No photos on this day.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {albums.map(album => (
                  <div key={album.folderPath} style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 4px 20px rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '17px', color: '#0f172a', marginBottom: '4px' }}>
                        {album.eventName.replace(/-/g, ' ')}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {album.count} photo{album.count !== 1 ? 's' : ''} · expires {new Date(album.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    {album.folderLink ? (
                      <a
                        href={album.folderLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '10px 20px', borderRadius: '999px', background: '#3b82f6', color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        View photos
                      </a>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>Link unavailable</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
