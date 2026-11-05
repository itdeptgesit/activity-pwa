import React, { useMemo, useState } from 'react';
import {
  Sun, Moon, Calendar, ChevronDown, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardStats, Activity, UserAccount } from "../types";
import { format, isToday, isSameDay, subDays } from "date-fns";

interface DashboardProps {
  user?: UserAccount | null;
  stats: DashboardStats;
  recentActivities: Activity[];
  onViewAll: () => void;
  onAddNew: () => void;
  onViewActivity: (a: Activity) => void;
  onNavigateWithFilter: (tab: 'journey', filter: any) => void;
  theme: 'light' | 'dark';
  onThemeToggle: (e?: React.MouseEvent) => void;
  loading?: boolean;
  loadError?: boolean;
  onRetryLoad?: () => void;
}

// Arah pastel (referensi pemilik produk, 5 Nov 2026): kartu statistik pastel dengan
// sparkline dari data nyata, kartu aktivitas putih, satu aksen ungu, tombol + hitam.
function tokens(theme?: string) {
  return theme === 'dark'
    ? {
        bg: '#12101D', card: '#1C1A2B', ink: '#F2F0FA', soft: '#B9B5CC', muted: '#9B97B0',
        line: '#2B2940', accent: '#8B7CFF', danger: '#E0685F', chip: '#232136',
        lav: '#2A2750', peach: '#3A2B1C', sky: '#1D3038', green: '#1F3325',
        lavInk: '#A79BFF', peachInk: '#F5B26B', skyInk: '#5FC4D6', greenInk: '#6FCF97',
        goBg: 'rgba(255,255,255,0.10)'
      }
    : {
        bg: '#F8F8FC', card: '#FFFFFF', ink: '#17172B', soft: '#3C3C55', muted: '#8A8FA3',
        line: '#ECEEF6', accent: '#6C4CF1', danger: '#D64545', chip: '#F2F1FA',
        lav: '#E7E4FB', peach: '#FDEBD7', sky: '#D8F0F5', green: '#DFF2E2',
        lavInk: '#7A6FF0', peachInk: '#F59E4C', skyInk: '#2EA8BC', greenInk: '#43A86B',
        goBg: 'rgba(255,255,255,0.75)'
      };
}
type T = ReturnType<typeof tokens>;

const CATEGORY_DOT: Record<string, string> = {
  'Troubleshooting': '#7A6FF0',
  'Technical Support': '#2EA8BC',
  'Maintenance': '#F59E0B',
  'Infrastructure & Network': '#6366F1',
  'Web Development': '#43A86B',
  'Creative & Design': '#EC4899',
  'Procurement & Assets': '#64748B'
};

function statusColor(status: string, t: T): string {
  if (status === 'Completed') return t.greenInk;
  if (status === 'In Progress') return t.accent;
  if (status === 'High Alert') return t.danger;
  return t.peachInk; // Pending dan status lain
}

// Sparkline kecil dari deret angka nyata (mis. jumlah log per hari, 7 hari terakhir).
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 52, h = 26, pad = 3;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(values.length - 1, 1);
    const y = h - pad - (v / max) * (h - pad * 2 - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden="true">
      <polyline points={pts} stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ t, bg, value, label, sub, spark, sparkColor, onClick }: {
  t: T; bg: string; value: number; label: string; sub?: React.ReactNode;
  spark?: number[]; sparkColor?: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: bg, border: 'none', borderRadius: 22, padding: '18px 18px 16px',
        minHeight: 118, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
        <span style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: t.ink }}>{value}</span>
        {spark && sparkColor ? <Sparkline values={spark} color={sparkColor} /> : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', gap: 8 }}>
        <span>
          <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: t.soft }}>{label}</span>
          {sub}
        </span>
        <span style={{
          width: 24, height: 24, borderRadius: '50%', background: t.goBg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.soft
        }}>
          <ChevronRight size={13} strokeWidth={3} />
        </span>
      </div>
    </button>
  );
}

// ── OVERVIEW: empat kartu pastel + misi yang sedang berjalan ───────────────
function Overview({ stats, currentActivity, activities, onViewActivity, onNavigateWithFilter, onViewAll, theme }: {
  stats: DashboardStats,
  currentActivity: Activity | null,
  activities: Activity[],
  onViewActivity: (a: Activity) => void,
  onNavigateWithFilter: (tab: 'journey', filter: any) => void,
  onViewAll: () => void,
  theme: 'light' | 'dark'
}) {
  const t = tokens(theme);

  const { todayCount, weekSeries, cumulativeSeries } = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    const perDay = days.map(d => activities.filter(a => a.created_at && isSameDay(new Date(a.created_at), d)).length);
    const before = activities.filter(a => a.created_at && new Date(a.created_at) < days[0]).length;
    let run = before;
    const cumulative = perDay.map(n => (run += n));
    return {
      todayCount: activities.filter(a => a.created_at && isToday(new Date(a.created_at))).length,
      weekSeries: perDay,
      cumulativeSeries: cumulative
    };
  }, [activities]);
  const weekTotal = weekSeries.reduce((s, n) => s + n, 0);

  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 21, fontWeight: 800, color: t.ink, letterSpacing: '-0.2px' }}>Overview</h2>
        <button
          onClick={() => onNavigateWithFilter('journey', 'Week')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 36,
            background: t.card, border: `1px solid ${t.line}`, borderRadius: 999,
            padding: '8px 13px', fontSize: 12.5, fontWeight: 600, color: t.ink,
            cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          This Week <ChevronDown size={14} color={t.muted} strokeWidth={2.4} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <StatCard t={t} bg={t.lav} value={todayCount} label="Today"
          onClick={() => onNavigateWithFilter('journey', 'Today')} />
        <StatCard t={t} bg={t.peach} value={weekTotal} label="This Week"
          spark={weekSeries} sparkColor={t.peachInk}
          onClick={() => onNavigateWithFilter('journey', 'Week')} />
        <StatCard t={t} bg={t.sky} value={stats.inProgress} label="In Progress"
          sub={stats.highAlert > 0
            ? <span style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: t.danger, marginTop: 2 }}>{stats.highAlert} critical</span>
            : undefined}
          onClick={() => onNavigateWithFilter('journey', 'In Progress')} />
        <StatCard t={t} bg={t.green} value={stats.total} label="All Activity"
          spark={cumulativeSeries} sparkColor={t.greenInk}
          onClick={onViewAll} />
      </div>

      {currentActivity && (
        <div
          onClick={() => onViewActivity(currentActivity)}
          style={{
            marginTop: 14, background: t.card, border: `1px solid ${t.line}`, borderRadius: 22,
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer'
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.accent, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>In progress now</p>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: t.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentActivity.activity_name}</p>
          </div>
          <ChevronRight size={17} color={t.muted} />
        </div>
      )}
    </div>
  );
}

// ── RECENT ACTIVITY: tab My/Team + kartu putih ─────────────────────────────
function QuickLogCards({ activities, user, onViewAll, onViewActivity, theme, loading, loadError, onRetryLoad }: {
  activities: Activity[]; user?: UserAccount | null;
  onViewAll: () => void, onViewActivity: (a: Activity) => void, theme?: string,
  loading?: boolean, loadError?: boolean, onRetryLoad?: () => void
}) {
  const t = tokens(theme);
  const [scope, setScope] = useState<'mine' | 'team'>('mine');

  const myName = (user?.fullName || '').trim().toLowerCase();
  const mine = useMemo(
    () => (myName ? activities.filter(a => (a.it_personnel || '').trim().toLowerCase() === myName) : []),
    [activities, myName]
  );
  const team = useMemo(
    () => (myName ? activities.filter(a => (a.it_personnel || '').trim().toLowerCase() !== myName) : activities),
    [activities, myName]
  );
  const scoped = scope === 'mine' ? mine : team;

  const stateCard: React.CSSProperties = {
    background: t.card, border: `1px solid ${t.line}`, borderRadius: 22,
    padding: '28px 24px', textAlign: 'center', color: t.muted
  };
  const tabStyle = (active: boolean): React.CSSProperties => ({
    borderRadius: 999, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
    minHeight: 40, display: 'inline-flex', alignItems: 'center', fontFamily: 'inherit',
    background: active ? t.ink : t.card, color: active ? t.bg : t.muted,
    border: `1px solid ${active ? t.ink : t.line}`
  });

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 21, fontWeight: 800, color: t.ink, letterSpacing: '-0.2px' }}>Recent Activity</h2>
        <button onClick={onViewAll} style={{ fontSize: 13, fontWeight: 700, color: t.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
          See All
        </button>
      </div>

      {activities.length > 0 ? (
        <>
          {myName && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setScope('mine')} style={tabStyle(scope === 'mine')}>My Activity ({mine.length})</button>
              <button onClick={() => setScope('team')} style={tabStyle(scope === 'team')}>Team ({team.length})</button>
            </div>
          )}
          {scoped.length > 0 ? scoped.slice(0, 3).map((a) => (
            <div
              key={a.id}
              onClick={() => onViewActivity(a)}
              style={{
                background: t.card, border: `1px solid ${t.line}`, borderRadius: 22,
                padding: '16px 18px 18px', marginBottom: 14, cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7, background: t.chip,
                  borderRadius: 999, padding: '7px 12px', fontSize: 12, fontWeight: 600, color: t.ink, whiteSpace: 'nowrap'
                }}>
                  <Calendar size={14} color={t.accent} />
                  {a.created_at ? format(new Date(a.created_at), 'd MMM yyyy') : 'Today'}
                </span>
                {a.duration ? <span style={{ fontSize: 12, fontWeight: 500, color: t.muted, whiteSpace: 'nowrap' }}>{a.duration}</span> : null}
              </div>
              <h3 style={{ fontSize: 16.5, fontWeight: 800, color: t.ink, margin: '11px 0 9px', lineHeight: 1.35, letterSpacing: '-0.2px' }}>{a.activity_name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12.5, fontWeight: 600, color: t.muted, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_DOT[a.category] || '#94A3B8' }} />
                  {a.category}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(a.status, t) }} />
                  <span style={{ color: statusColor(a.status, t) }}>{a.status}</span>
                </span>
              </div>
            </div>
          )) : (
            <div style={stateCard}>
              <p style={{ fontWeight: 600, fontSize: 13.5 }}>No activity found.</p>
            </div>
          )}
        </>
      ) : loading ? (
        <div style={stateCard}>
          <p style={{ fontWeight: 600, fontSize: 13.5 }}>Loading activities...</p>
        </div>
      ) : loadError ? (
        <div style={stateCard}>
          <p style={{ fontWeight: 700, fontSize: 16, color: t.ink, marginBottom: 6 }}>Couldn't load activities.</p>
          <p style={{ fontSize: 12.5, marginBottom: 16 }}>The data is still saved on the server. Check your connection, then try again.</p>
          <button onClick={onRetryLoad} style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', background: t.accent, border: 'none', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', fontFamily: 'inherit' }}>Try Again</button>
        </div>
      ) : (
        <div style={stateCard}>
          <p style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>No activity found.</p>
          <p style={{ fontSize: 12.5 }}>Activities logged by the team will appear here.</p>
        </div>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
export default function Dashboard({ user, stats, recentActivities, onViewAll, onAddNew, onViewActivity, onNavigateWithFilter, theme, onThemeToggle, loading, loadError, onRetryLoad }: DashboardProps) {
  const t = tokens(theme);
  const currentActivity = recentActivities.find(a => a.status === 'In Progress') ?? null;

  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';
  else if (hour < 21) greeting = 'Good Evening';
  else greeting = 'Good Night';

  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div style={{ padding: '32px 24px 0', background: t.bg, minHeight: '100%' }}>
      {/* Header: avatar + sapaan, tombol tema bulat */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 14, position: 'sticky', top: 0, zIndex: 40,
        margin: '-8px -24px 24px', padding: '14px 24px 14px', background: t.bg
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%', background: t.lav, flexShrink: 0,
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.lavInk, fontSize: 15, fontWeight: 800
          }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12.5, color: t.muted, lineHeight: 1.25 }}>{greeting}</p>
            <h1 style={{ fontSize: 16.5, fontWeight: 800, lineHeight: 1.25, color: t.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName || 'Rudi'}
            </h1>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onThemeToggle}
          aria-label="Toggle theme"
          style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: t.card, border: `1px solid ${t.line}`,
            color: t.ink, cursor: 'pointer'
          }}
        >
          {theme === 'light' ? <Moon size={19} strokeWidth={2.2} /> : <Sun size={19} strokeWidth={2.2} />}
        </motion.button>
      </div>

      {/* Content */}
      <div style={{ paddingBottom: 40 }}>
        <Overview
          stats={stats}
          currentActivity={currentActivity}
          activities={recentActivities}
          onViewActivity={onViewActivity}
          onNavigateWithFilter={onNavigateWithFilter}
          onViewAll={onViewAll}
          theme={theme}
        />
        <QuickLogCards
          activities={recentActivities}
          user={user}
          onViewAll={onViewAll}
          onViewActivity={onViewActivity}
          theme={theme}
          loading={loading}
          loadError={loadError}
          onRetryLoad={onRetryLoad}
        />
      </div>
    </div>
  );
}
