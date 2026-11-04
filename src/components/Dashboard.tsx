import React from 'react';
import {
  Sun, MoonStar, Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardStats, Activity, UserAccount } from "../types";
import { format, isToday } from "date-fns";

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

// Editorial direction (dipilih pemilik produk): latar kertas, satu aksen hijau tua,
// daftar bergaris tipis, judul serif. Warna lain hanya untuk status data yang nyata.
const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";

function tokens(theme?: string) {
  return theme === 'dark'
    ? { bg: '#16140F', ink: '#EDE8DD', muted: '#A79E8F', line: '#2E2A23', accent: '#3ECF8E', danger: '#E0685F' }
    : { bg: '#FAF7F1', ink: '#1D1A16', muted: '#6E675C', line: '#E2DCD0', accent: '#0B6E4F', danger: '#B3372F' };
}

const labelStyle = (t: ReturnType<typeof tokens>): React.CSSProperties => ({
  fontSize: 11, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.09em'
});

// ── OVERVIEW: misi berjalan + ringkasan hari ini, tanpa kartu ──────────────
function Overview({ stats, currentActivity, activities, onViewActivity, onNavigateWithFilter, theme }: {
  stats: DashboardStats,
  currentActivity: Activity | null,
  activities: Activity[],
  onViewActivity: (a: Activity) => void,
  onNavigateWithFilter: (tab: 'journey', filter: any) => void,
  theme: 'light' | 'dark'
}) {
  const t = tokens(theme);
  const completedToday = activities.filter(a => a.status === 'Completed' && a.created_at && isToday(new Date(a.created_at))).length;
  const totalToday = activities.filter(a => a.created_at && isToday(new Date(a.created_at))).length || 1;
  const progressPercent = Math.round((completedToday / totalToday) * 100);
  const urgentCount = stats.highAlert > 0 ? stats.highAlert : stats.inProgress;

  return (
    <div style={{ marginBottom: 34 }}>
      {/* Focal point: pekerjaan yang sedang berjalan */}
      <div
        onClick={() => currentActivity && onViewActivity(currentActivity)}
        style={{ padding: '4px 0 20px', cursor: currentActivity ? 'pointer' : 'default' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={labelStyle(t)}>Current mission</span>
          {currentActivity && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent, display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Active</span>
            </span>
          )}
        </div>

        {currentActivity ? (
          <div>
            <h2 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 600, color: t.ink, marginBottom: 8, lineHeight: 1.15, letterSpacing: '-0.3px' }}>{currentActivity.activity_name}</h2>
            <p style={{ fontSize: 12.5, color: t.muted, fontWeight: 500 }}>
              {currentActivity.created_at ? format(new Date(currentActivity.created_at), 'd MMM') : 'Today'}
              {' · '}{currentActivity.category}
              {' · '}{currentActivity.it_personnel || 'Admin'}
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 600, color: t.ink, marginBottom: 6, lineHeight: 1.2 }}>Nothing in progress</h2>
            <p style={{ fontSize: 13, color: t.muted, fontWeight: 500 }}>No active work right now. Work in progress will appear here.</p>
          </div>
        )}
      </div>

      {/* Ringkasan: dua angka dipisah garis tipis, bukan kartu statistik */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
        <div
          onClick={() => onNavigateWithFilter('journey', 'Today')}
          style={{ padding: '16px 16px 18px 0', cursor: 'pointer' }}
        >
          <p style={{ ...labelStyle(t), marginBottom: 8 }}>Today</p>
          <h3 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: t.ink, marginBottom: 4, lineHeight: 1 }}>{progressPercent}%</h3>
          <p style={{ fontSize: 12, fontWeight: 500, color: t.muted, marginBottom: 12 }}>{completedToday}/{totalToday} logs done</p>
          <div style={{ height: 2, width: '100%', background: t.line, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              style={{ height: '100%', background: t.accent }}
            />
          </div>
        </div>

        <div
          onClick={() => onNavigateWithFilter('journey', stats.highAlert > 0 ? 'Critical' : 'In Progress')}
          style={{ padding: '16px 0 18px 16px', borderLeft: `1px solid ${t.line}`, cursor: 'pointer' }}
        >
          <p style={{ ...labelStyle(t), marginBottom: 8 }}>Needs action</p>
          <h3 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: stats.highAlert > 0 ? t.danger : t.ink, marginBottom: 4, lineHeight: 1 }}>{urgentCount}</h3>
          <p style={{ fontSize: 12, fontWeight: 500, color: t.muted }}>
            {stats.highAlert > 0 ? 'Critical items waiting' : 'Items in progress'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── RECENT ACTIVITY: daftar bergaris tipis ─────────────────────────────────
function QuickLogCards({ activities, onViewAll, onViewActivity, theme, loading, loadError, onRetryLoad }: { activities: Activity[]; onViewAll: () => void, onViewActivity: (a: Activity) => void, theme?: string, loading?: boolean, loadError?: boolean, onRetryLoad?: () => void }) {
  const t = tokens(theme);

  const stateBox: React.CSSProperties = {
    border: `1px solid ${t.line}`, padding: '28px 24px', textAlign: 'center', color: t.muted
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, padding: '0 2px' }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: t.ink, letterSpacing: '-0.2px' }}>Recent Activity</h2>
        <button onClick={onViewAll} style={{ fontSize: 13, fontWeight: 700, color: t.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          See All
        </button>
      </div>

      <div>
        {activities.length > 0 ? (
          activities.slice(0, 3).map((a) => (
            <div
              key={a.id}
              onClick={() => onViewActivity(a)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14,
                padding: '14px 2px', borderBottom: `1px solid ${t.line}`, cursor: 'pointer'
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: 15.5, fontWeight: 600, color: t.ink, marginBottom: 4, lineHeight: 1.3 }}>{a.activity_name}</h3>
                <p style={{ fontSize: 12, fontWeight: 500, color: t.muted }}>
                  {a.category}
                  {' · '}{a.it_personnel || 'Admin'}
                  {' · '}
                  <span style={{ color: a.status === 'In Progress' ? t.accent : t.muted, fontWeight: a.status === 'In Progress' ? 700 : 500 }}>{a.status}</span>
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: t.muted, whiteSpace: 'nowrap', paddingTop: 2 }}>
                {a.created_at ? format(new Date(a.created_at), 'd MMM') : 'Today'}
              </span>
            </div>
          ))
        ) : loading ? (
          <div style={stateBox}>
            <p style={{ fontWeight: 600, fontSize: 13.5 }}>Loading activities...</p>
          </div>
        ) : loadError ? (
          <div style={stateBox}>
            <p style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 16, color: t.ink, marginBottom: 6 }}>Couldn't load activities.</p>
            <p style={{ fontSize: 12.5, marginBottom: 16 }}>The data is still saved on the server. Check your connection, then try again.</p>
            <button onClick={onRetryLoad} style={{ fontSize: 13, fontWeight: 700, color: t.accent, background: 'none', border: `1px solid ${t.accent}`, borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}>Try Again</button>
          </div>
        ) : (
          <div style={stateBox}>
            <p style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>No activity found.</p>
            <p style={{ fontSize: 12.5 }}>Activities logged by the team will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
export default function Dashboard({ user, stats, recentActivities, onViewAll, onAddNew, onViewActivity, onNavigateWithFilter, theme, onThemeToggle, loading, loadError, onRetryLoad }: DashboardProps) {
  const t = tokens(theme);
  const currentActivity = recentActivities.find(a => a.status === 'In Progress') ?? null;

  const now = new Date();
  const hour = now.getHours();
  const dateStr = format(now, 'EEEE, d MMMM');

  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';
  else if (hour < 21) greeting = 'Good Evening';
  else greeting = 'Good Night';

  return (
    <div style={{ padding: '32px 24px 0', background: t.bg, minHeight: '100%' }}>
      {/* Header (Greeting & Theme) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 14,
        position: 'sticky',
        top: 0,
        zIndex: 40,
        margin: '-8px -24px 24px',
        padding: '14px 24px 16px',
        background: t.bg,
        borderBottom: `1px solid ${t.line}`
      }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ ...labelStyle(t), marginBottom: 6 }}>{greeting}</p>
          <h1 style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, lineHeight: 1.05, color: t.ink, letterSpacing: '-0.5px', marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.fullName ? user.fullName.split(' ')[0] : 'Rudi'}
          </h1>
          <p style={{ fontSize: 13, fontWeight: 500, color: t.muted }}>{dateStr}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onThemeToggle}
            aria-label="Toggle theme"
            style={{
              width: 44, height: 44, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: `1px solid ${t.line}`,
              color: t.ink, cursor: 'pointer'
            }}
          >
            {theme === 'light' ? <Moon size={18} strokeWidth={2.2} /> : <Sun size={18} strokeWidth={2.2} />}
          </motion.button>

          <div style={{
            width: 44, height: 44, borderRadius: 10, background: 'transparent',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${t.line}`,
            color: t.ink, fontSize: 16, fontWeight: 700
          }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{user?.fullName ? user.fullName[0].toUpperCase() : 'U'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingBottom: 100 }}>
        <Overview
          stats={stats}
          currentActivity={currentActivity}
          activities={recentActivities}
          onViewActivity={onViewActivity}
          onNavigateWithFilter={onNavigateWithFilter}
          theme={theme}
        />
        <QuickLogCards
          activities={recentActivities}
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
