import React, { useState } from 'react';
import { 
  CheckCircle2, AlertCircle, TrendingUp,
  Calendar, ArrowRight, Wrench, Settings, Network,
  LifeBuoy, Code, PenTool, ShoppingCart,
  ClipboardList, LucideIcon, User,
  Sun, MoonStar, Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardStats, Activity, UserAccount } from "../types";
import { format, startOfWeek, addDays, isToday, isSameDay } from "date-fns";

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
}

const CATEGORY_MAP: Record<string, { icon: LucideIcon; bg: string; accent: string; label: string; token: string }> = {
  'Troubleshooting':           { icon: Wrench,       bg: 'rgba(248, 113, 113, 0.1)', accent: '#F87171', label: 'Troubleshoot', token: 'var(--cat-troubleshoot)' },
  'Maintenance':               { icon: Settings,     bg: 'rgba(99, 102, 241, 0.1)',  accent: '#6366F1', label: 'Maintenance',  token: 'var(--cat-maintenance)' },
  'Infrastructure & Network':  { icon: Network,      bg: 'rgba(79, 70, 229, 0.1)',   accent: '#4F46E5', label: 'Infra & Net',  token: 'var(--cat-network)' },
  'Technical Support':         { icon: LifeBuoy,     bg: 'rgba(16, 185, 129, 0.1)',  accent: '#10B981', label: 'Support',      token: 'var(--cat-support)' },
  'Web Development':           { icon: Code,         bg: 'rgba(139, 92, 246, 0.1)',  accent: '#8B5C08', label: 'Development',  token: 'var(--cat-dev)' },
  'Creative & Design':         { icon: PenTool,      bg: 'rgba(236, 72, 153, 0.1)',  accent: '#EC4899', label: 'Design',       token: 'var(--cat-design)' },
  'Procurement & Assets':      { icon: ShoppingCart, bg: 'rgba(100, 116, 139, 0.1)',  accent: '#64748B', label: 'Assets',       token: 'var(--cat-asset)' },
  'Other':                     { icon: ClipboardList,bg: 'rgba(148, 163, 184, 0.1)',  accent: '#94A3B8', label: 'Other',        token: 'var(--cat-other)' },
};

// ── CIRCULAR PROGRESS ──────────────────────────────────────────────
function CircularProgress({ percent, size = 60, strokeWidth = 5 }: { percent: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="var(--app-border)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          cx={size / 2} cy={size / 2} r={radius}
          stroke="var(--accent)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <span style={{ position: 'absolute', fontSize: 11, fontWeight: 800, color: 'var(--app-text)' }}>{percent}%</span>
    </div>
  );
}

// ── BENTO GRID (SYNCED WITH SCREENSHOT) ───────────────────────────────
function BentoGrid({ stats, currentActivity, activities, onViewAll, onViewActivity, onNavigateWithFilter, theme }: { 
  stats: DashboardStats, 
  currentActivity: Activity | null, 
  activities: Activity[], 
  onViewAll: () => void,
  onViewActivity: (a: Activity) => void,
  onNavigateWithFilter: (tab: 'journey', filter: any) => void,
  theme: 'light' | 'dark'
}) {
  const today = new Date();
  const completedToday = activities.filter(a => a.status === 'Completed' && a.created_at && isToday(new Date(a.created_at))).length;
  const totalToday = activities.filter(a => a.created_at && isToday(new Date(a.created_at))).length || 1;
  const progressPercent = Math.round((completedToday / totalToday) * 100);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
      {/* Hero Card: Current Mission */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={() => currentActivity && onViewActivity(currentActivity)}
        style={{
          gridColumn: '1 / -1',
          background: 'linear-gradient(140deg, var(--home-hero-start), var(--home-hero-end))', borderRadius: 24, padding: '22px 24px',
          color: '#fff', display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden', minHeight: 160,
          cursor: currentActivity ? 'pointer' : 'default',
          boxShadow: theme === 'dark' ? '0 10px 28px rgba(91, 83, 247, 0.38), 0 0 0 1px rgba(143, 151, 255, 0.18)' : '0 12px 30px rgba(79, 70, 229, 0.25)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <TrendingUp size={18} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
              <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>Current Mission</span>
            </div>
            {currentActivity && (
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: '0.05em' }}>ACTIVE</div>
            )}
          </div>
          
          {currentActivity ? (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, lineHeight: 1.1, letterSpacing: '-0.5px' }}>{currentActivity.activity_name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} />
                    <span>{currentActivity.created_at ? format(new Date(currentActivity.created_at), 'd MMM') : 'Today'}</span>
                 </div>
                 <span style={{ opacity: 0.4 }}>•</span>
                 <span>{currentActivity.category}</span>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 'auto' }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>System Ready</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>No active missions logged.</p>
            </div>
          )}
        </div>
        
        {/* Decorative Background Icon */}
        <div style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.1, color: '#fff' }}>
           <TrendingUp size={140} strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Daily Progress Widget (Theme Aware) */}
      <motion.div 
        whileTap={{ scale: 0.96 }}
        onClick={() => onNavigateWithFilter('journey', 'Today')}
        style={{
          background: 'var(--home-soft-card)', borderRadius: 24, padding: '22px',
          color: 'var(--app-text)', display: 'flex', flexDirection: 'column', gap: 16, cursor: 'pointer',
          border: '1px solid var(--home-soft-card-border)',
          boxShadow: theme === 'dark' ? '0 8px 24px rgba(0,0,0,0.32), 0 0 22px rgba(143, 151, 255, 0.14)' : '0 8px 30px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
           <div style={{ padding: 6, background: theme === 'dark' ? 'rgba(123, 131, 255, 0.14)' : 'rgba(99, 102, 241, 0.1)', borderRadius: 10, color: 'var(--home-soft-progress)' }}>
              <CheckCircle2 size={16} strokeWidth={2.5} />
           </div>
           <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--app-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily</span>
        </div>
        
        <div>
          <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{progressPercent}%</h3>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-muted)', marginBottom: 12 }}>{completedToday}/{totalToday} logs</p>
          <div style={{ height: 6, width: '100%', background: 'var(--secondary)', borderRadius: 3, overflow: 'hidden' }}>
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progressPercent}%` }}
               style={{ height: '100%', background: 'var(--home-soft-progress)', borderRadius: 3 }} 
             />
          </div>
        </div>
      </motion.div>

      {/* Urgent Alert Widget (Coral Style) */}
      <motion.div 
        whileTap={{ scale: 0.96 }}
        onClick={() => onNavigateWithFilter('journey', stats.highAlert > 0 ? 'Critical' : 'In Progress')}
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(145deg, var(--home-soft-urgent-start), var(--home-soft-urgent-end))'
            : 'var(--soft-coral)', borderRadius: 24, padding: '22px',
          color: '#fff', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: theme === 'dark' ? '0 10px 28px rgba(217, 70, 239, 0.28), 0 0 0 1px rgba(255, 95, 135, 0.2)' : '0 12px 30px rgba(251, 113, 133, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
           <div style={{ padding: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 10 }}>
              <AlertCircle size={16} strokeWidth={2.5} />
           </div>
           <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Urgent</span>
        </div>
        
        <div>
          <h3 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{stats.highAlert > 0 ? stats.highAlert : stats.inProgress}</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Action required</p>
             <ArrowRight size={18} strokeWidth={2.5} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── QUICK LOG CARDS (Premium Synced Cards) ───────────────────────────────────────────
function QuickLogCards({ activities, onViewAll, onViewActivity, theme }: { activities: Activity[]; onViewAll: () => void, onViewActivity: (a: Activity) => void, theme?: string }) {
  const isDark = theme === 'dark';

  const COLOR_VARIANTS = isDark ? [
    { bg: '#434dbe', text: '#f4f6ff', muted: 'rgba(244,246,255,0.78)', icon: LifeBuoy }, // Electric indigo
    { bg: '#b8842a', text: '#fff7e6', muted: 'rgba(255,247,230,0.78)', icon: Wrench },   // Glowing amber
    { bg: '#2e9469', text: '#ecfff6', muted: 'rgba(236,255,246,0.78)', icon: Wrench },   // Bright emerald
  ] : [
    { bg: '#BFDBFE', text: '#1E3A8A', muted: 'rgba(30,58,138,0.6)', icon: LifeBuoy }, // Pastel Blue
    { bg: '#FEF3C7', text: '#92400E', muted: 'rgba(146,64,14,0.6)', icon: Wrench },   // Pastel Amber
    { bg: '#ECFCCB', text: '#3F6212', muted: 'rgba(63,98,18,0.6)', icon: Wrench },   // Pastel Lime
  ];

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '0 4px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--app-text)', letterSpacing: '-0.4px' }}>Recent Activity</h2>
        <button onClick={onViewAll} style={{ fontSize: 13, fontWeight: 700, color: '#10B981', background: 'none', border: 'none', cursor: 'pointer' }}>
          See All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {activities.length > 0 ? (
          activities.slice(0, 3).map((a, i) => {
            const variant = COLOR_VARIANTS[i % COLOR_VARIANTS.length];
            const config = CATEGORY_MAP[a.category ?? 'Other'] || CATEGORY_MAP['Other'];
            
            return (
              <motion.div
                key={a.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewActivity(a)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                style={{
                  background: variant.bg, borderRadius: 24, padding: '22px 24px',
                  color: variant.text, display: 'flex', flexDirection: 'column',
                  position: 'relative', overflow: 'hidden', cursor: 'pointer',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.03)',
                  boxShadow: isDark ? `0 8px 25px ${variant.bg}25` : '0 4px 15px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, lineHeight: 1.2, letterSpacing: '-0.3px' }}>{a.activity_name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: variant.muted }}>
                    <span>{a.created_at ? format(new Date(a.created_at), 'd MMM') : 'Today'}</span>
                    <span style={{ opacity: 0.4 }}>•</span>
                    <span>{config.label}</span>
                    <span style={{ opacity: 0.4 }}>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                       <User size={12} strokeWidth={2.5} />
                       <span>{a.it_personnel || 'Admin'}</span>
                    </div>
                  </div>
                </div>

                {/* Background Decor Icon */}
                <div style={{ position: 'absolute', top: '50%', right: -10, transform: 'translateY(-50%)', opacity: 0.15, color: variant.text }}>
                   <variant.icon size={100} strokeWidth={1.5} />
                </div>
              </motion.div>
            );
          })
        ) : (
          <div style={{ background: 'var(--app-card)', borderRadius: 24, padding: '32px', textAlign: 'center', color: 'var(--app-muted)', border: '1px solid var(--app-border)' }}>
             <p style={{ fontWeight: 700, fontSize: 14 }}>No activity found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
export default function Dashboard({ user, stats, recentActivities, onViewAll, onAddNew, onViewActivity, onNavigateWithFilter, theme, onThemeToggle }: DashboardProps) {
  const currentActivity = recentActivities.find(a => a.status === 'In Progress') ?? null;
  const completedRecent = recentActivities.filter(a => a.status === 'Completed');

  const now = new Date();
  const hour = now.getHours();
  const dateStr = format(now, 'EEEE, d MMMM');
  
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';
  else if (hour < 21) greeting = 'Good Evening';
  else greeting = 'Good Night';

  return (
    <div style={{ padding: '32px 24px 0' }}>
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
        background: 'var(--app-header-bg)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--app-border)'
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            {hour >= 21 || hour < 5 ? <MoonStar size={12} color="var(--accent)" /> : <Sun size={12} color="var(--accent)" />}
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--app-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{greeting}</p>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.05, color: 'var(--app-text)', letterSpacing: '-1px', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.fullName ? user.fullName.split(' ')[0] : 'Rudi'}
          </h1>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-muted)', opacity: 0.85 }}>{dateStr}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, paddingTop: 2 }}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => onThemeToggle(e)}
            aria-label="Toggle theme"
            style={{
              width: 42, height: 42, borderRadius: 13,
              background: 'var(--app-card)', border: '1px solid var(--app-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--app-text)', boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
            }}
          >
            {theme === 'light' ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
          </motion.button>

          <div style={{
            width: 44, height: 44, borderRadius: 14, background: 'var(--secondary)',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--app-card)', boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
            color: 'var(--app-text)', fontSize: 16, fontWeight: 700
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
        <BentoGrid 
          stats={stats} 
          currentActivity={currentActivity} 
          activities={recentActivities} 
          onViewAll={onViewAll} 
          onViewActivity={onViewActivity}
          onNavigateWithFilter={onNavigateWithFilter}
          theme={theme}
        />
        <QuickLogCards 
          activities={recentActivities} 
          onViewAll={onViewAll} 
          onViewActivity={onViewActivity}
          theme={theme}
        />
      </div>
    </div>
  );
}
