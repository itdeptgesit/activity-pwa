import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, AlertCircle, TrendingUp, 
  Calendar, ArrowRight, Wrench, Settings, Network,
  LifeBuoy, Code, PenTool, ShoppingCart, 
  ClipboardList, ChevronRight, MapPin, Compass, LucideIcon, User,
  Sun, CloudSun, MoonStar, Moon
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

const CATEGORY_MAP: Record<string, { icon: LucideIcon; bg: string; accent: string; label: string }> = {
  'Troubleshooting':           { icon: Wrench,       bg: 'rgba(239, 68, 68, 0.15)', accent: '#EF4444', label: 'Troubleshoot' },
  'Maintenance':               { icon: Settings,     bg: 'rgba(59, 130, 246, 0.15)', accent: '#3B82F6', label: 'Maintenance' },
  'Infrastructure & Network':  { icon: Network,      bg: 'rgba(99, 102, 241, 0.15)', accent: '#6366F1', label: 'Infra & Net' },
  'Technical Support':         { icon: LifeBuoy,     bg: 'rgba(34, 197, 94, 0.15)', accent: '#22C55E', label: 'Support' },
  'Web Development':           { icon: Code,         bg: 'rgba(139, 92, 246, 0.15)', accent: '#8B5CF6', label: 'Devel' },
  'Creative & Design':         { icon: PenTool,      bg: 'rgba(236, 72, 153, 0.15)', accent: '#EC4899', label: 'Design' },
  'Procurement & Assets':      { icon: ShoppingCart, bg: 'rgba(100, 116, 139, 0.15)', accent: '#64748B', label: 'Asset' },
  'Other':                     { icon: ClipboardList,bg: 'rgba(148, 163, 184, 0.15)', accent: '#94A3B8', label: 'Other' },
};

// ── BENTO GRID ───────────────────────────────────────────────
function BentoGrid({ stats, currentActivity, activities, onViewAll, onViewActivity, onNavigateWithFilter }: { 
  stats: DashboardStats, 
  currentActivity: Activity | null, 
  activities: Activity[], 
  onViewAll: () => void,
  onViewActivity: (a: Activity) => void,
  onNavigateWithFilter: (tab: 'journey', filter: any) => void
}) {
  // Calculate daily progress
  const today = new Date();
  const completedToday = activities.filter(a => a.status === 'Completed' && a.created_at && isToday(new Date(a.created_at))).length;
  const totalToday = activities.filter(a => a.created_at && isToday(new Date(a.created_at))).length || 1;
  const progressPercent = Math.round((completedToday / totalToday) * 100);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
      {/* Hero Card (Full Width) */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={() => currentActivity && onViewActivity(currentActivity)}
        style={{
          gridColumn: '1 / -1',
          background: 'linear-gradient(135deg, #6366F1, #312E81)', borderRadius: 32, padding: '24px 28px',
          color: '#fff', display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden', minHeight: 180,
          cursor: currentActivity ? 'pointer' : 'default',
          boxShadow: '0 10px 30px rgba(99, 102, 241, 0.2)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={22} color="#fff" />
            <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>Current Mission</h3>
          </div>
          <button style={{
            background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none',
            borderRadius: 20, padding: '6px 14px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>Active</button>
        </div>
        
        {currentActivity ? (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, lineHeight: 1.1, letterSpacing: '-0.5px' }}>{currentActivity.activity_name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
               <Calendar size={14} />
               <span>{format(new Date(currentActivity.created_at || new Date()), 'd MMM')}</span>
               <span style={{ opacity: 0.4 }}>•</span>
               <span>{currentActivity.category}</span>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 'auto' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>Ready to Roll?</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>No active tasks detected.</p>
          </div>
        )}
        {/* Abstract ornament accent */}
        <div style={{ position: 'absolute', bottom: -10, right: 10, opacity: 0.15 }}>
           <TrendingUp size={120} color="#fff" strokeWidth={1} />
        </div>
      </motion.div>

      {/* Daily Progress Widget (Half Width) */}
      <motion.div 
        whileTap={{ scale: 0.96 }}
        onClick={() => onNavigateWithFilter('journey', 'Today')}
        style={{
          background: 'var(--app-card)', borderRadius: 28, padding: '24px',
          color: 'var(--app-text)', display: 'flex', flexDirection: 'column', cursor: 'pointer',
          border: '1px solid var(--app-border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: 6, borderRadius: '50%', color: 'var(--accent)' }}>
            <CheckCircle2 size={16} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--app-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Daily</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>{progressPercent}%</span>
          <p style={{ fontSize: 11, color: 'var(--app-muted)', marginTop: 2, fontWeight: 700 }}>{completedToday}/{totalToday} logs</p>
        </div>
        <div style={{ height: 8, background: 'var(--app-border)', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ height: '100%', background: 'var(--accent)', borderRadius: 4 }} />
        </div>
      </motion.div>

      {/* Persistence / Alert Widget (Half Width) */}
      <motion.div 
        whileTap={{ scale: 0.96 }}
        onClick={() => onNavigateWithFilter('journey', stats.highAlert > 0 ? 'Critical' : 'In Progress')}
        style={{
          background: stats.highAlert > 0 ? '#EF4444' : 'var(--app-text)', borderRadius: 28, padding: '24px',
          color: stats.highAlert > 0 ? '#fff' : 'var(--app-bg)', display: 'flex', flexDirection: 'column', position: 'relative', cursor: 'pointer',
          boxShadow: stats.highAlert > 0 ? '0 10px 30px rgba(239, 68, 68, 0.25)' : 'none',
          border: stats.highAlert > 0 ? '1px solid rgba(255,255,255,0.2)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: '50%' }}>
            {stats.highAlert > 0 ? <AlertCircle size={16} /> : <TrendingUp size={16} />}
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stats.highAlert > 0 ? 'Urgent' : 'Status'}</span>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>{stats.highAlert > 0 ? stats.highAlert : stats.inProgress}</span>
          <p style={{ fontSize: 11, opacity: 0.9, marginTop: 2, fontWeight: 700 }}>{stats.highAlert > 0 ? 'Action required' : 'Active logs'}</p>
        </div>
        <ArrowRight size={20} style={{ position: 'absolute', bottom: 24, right: 24, opacity: 0.5 }} />
      </motion.div>
    </div>
  );
}

// ── QUICK LOG CARDS ────────────────────────────────────────────────
function QuickLogCards({ activities, onViewAll, onViewActivity }: { activities: Activity[]; onViewAll: () => void, onViewActivity: (a: Activity) => void }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '0 4px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--app-text)', letterSpacing: '-0.3px' }}>Recent Activity</h2>
        <button onClick={onViewAll} style={{
          fontSize: 13, fontWeight: 700, color: '#10B981',
          background: 'none', border: 'none', cursor: 'pointer'
        }}>
          See All
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
        {activities.length > 0 ? (
          activities.slice(0, 4).map((a, i) => {
            const config = CATEGORY_MAP[a.category ?? 'Other'] || CATEGORY_MAP['Other'];
            // Bento style colors
            const bentoColors = [
              { bg: '#A3C4F3', text: '#1E293B' },
              { bg: '#FFD166', text: '#1E293B' },
              { bg: '#D4FF26', text: '#1E293B' },
              { bg: '#1E293B', text: '#F8FAFC' }
            ];
            const color = bentoColors[i % bentoColors.length];
            return (
              <motion.div
                key={a.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewActivity(a)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: color.bg, borderRadius: 28, padding: '24px',
                  color: color.text, display: 'flex', flexDirection: 'column', gap: 12,
                  position: 'relative', overflow: 'hidden', cursor: 'pointer',
                  border: i % 4 === 3 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}
              >
                {/* Large Background Icon */}
                <div style={{ position: 'absolute', bottom: -15, right: -10, opacity: 0.12, transform: 'rotate(-10deg)', pointerEvents: 'none' }}>
                  <config.icon size={110} color={color.text} strokeWidth={1.5} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>{a.activity_name}</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 12px', opacity: 0.75, fontSize: 11, fontWeight: 600 }}>
                      <span>{a.created_at ? format(new Date(a.created_at), 'd MMM') : 'Today'}</span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', opacity: 0.3 }} />
                      <span>{config.label}</span>
                      {a.it_personnel && (
                        <>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', opacity: 0.3 }} />
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <User size={10} strokeWidth={3} /> {a.it_personnel}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div style={{ background: 'var(--app-card)', borderRadius: 28, padding: '30px', textAlign: 'center', color: 'var(--app-muted)', border: '1px solid var(--app-border)' }}>
            <ClipboardList size={28} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600 }}>No recent logs.</p>
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

  // Greeting and Date Logic
  const now = new Date();
  const hour = now.getHours();
  const dateStr = format(now, 'EEEE, d MMMM');
  
  let greeting = 'Good Evening';
  let TimeIcon = MoonStar;
  let iconColor = theme === 'dark' ? '#A3C4F3' : '#6366F1';

  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning';
    TimeIcon = Sun;
    iconColor = '#F59E0B';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
    TimeIcon = CloudSun;
    iconColor = '#3B82F6';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good Evening';
    TimeIcon = MoonStar;
    iconColor = theme === 'dark' ? '#A3C4F3' : '#6366F1';
  } else {
    greeting = 'Good Night';
    TimeIcon = MoonStar;
    iconColor = theme === 'dark' ? '#A3C4F3' : '#475569';
  }

  return (
    <div style={{ paddingBottom: 100, background: 'transparent', minHeight: '100dvh' }}>
      {/* ── STICKY HEADER ── */}
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        background: 'var(--app-header-bg)', 
        backdropFilter: 'blur(20px)', 
        WebkitBackdropFilter: 'blur(20px)',
        padding: '16px 24px 20px',
        borderBottom: '1px solid var(--app-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <TimeIcon size={18} color={iconColor} strokeWidth={2.5} />
              <span style={{ fontSize: 11, fontWeight: 800, color: iconColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {greeting}
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--app-text)', letterSpacing: '-0.7px', lineHeight: 1.1 }}>
              {user?.fullName ? user.fullName.split(' ')[0] : 'Rudi'} 
            </h1>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-muted)', marginTop: 4 }}>
              {dateStr}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => onThemeToggle(e)}
              style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'var(--app-card)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid var(--app-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--app-text)'
              }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </motion.button>

            <div style={{
              width: 52, height: 52, borderRadius: 18, background: 'var(--app-card)',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--app-card)', boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
              color: 'var(--app-text)', fontSize: 20, fontWeight: 700
            }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{user?.fullName ? user.fullName[0].toUpperCase() : 'U'}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 24px 0' }}>
        <BentoGrid 
          stats={stats} 
          currentActivity={currentActivity} 
          activities={recentActivities} 
          onViewAll={onViewAll} 
          onViewActivity={onViewActivity}
          onNavigateWithFilter={onNavigateWithFilter}
        />
        <QuickLogCards 
          activities={completedRecent} 
          onViewAll={onViewAll} 
          onViewActivity={onViewActivity}
        />
      </div>
    </div>
  );
}
