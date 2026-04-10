import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, AlertCircle, TrendingUp, 
  Calendar, ArrowRight, Wrench, Settings, Network,
  LifeBuoy, Code, PenTool, ShoppingCart, 
  ClipboardList, ChevronRight, MapPin, Compass, LucideIcon, User,
  Sun, CloudSun, MoonStar
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
}

const CATEGORY_MAP: Record<string, { icon: LucideIcon; bg: string; accent: string; label: string }> = {
  'Troubleshooting':           { icon: Wrench,       bg: '#FDE2E4', accent: '#EF4444', label: 'Troubleshoot' },
  'Maintenance':               { icon: Settings,     bg: '#E2EAFB', accent: '#3B82F6', label: 'Maintenance' },
  'Infrastructure & Network':  { icon: Network,      bg: '#E0E7FF', accent: '#6366F1', label: 'Infra & Net' },
  'Technical Support':         { icon: LifeBuoy,     bg: '#DCFCE7', accent: '#22C55E', label: 'Support' },
  'Web Development':           { icon: Code,         bg: '#F5F3FF', accent: '#8B5CF6', label: 'Devel' },
  'Creative & Design':         { icon: PenTool,      bg: '#FCE7F3', accent: '#EC4899', label: 'Design' },
  'Procurement & Assets':      { icon: ShoppingCart, bg: '#F1F5F9', accent: '#64748B', label: 'Asset' },
  'Other':                     { icon: ClipboardList,bg: '#F5F5F0', accent: '#94A3B8', label: 'Other' },
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
          background: '#0F4C5C', borderRadius: 32, padding: '24px 28px',
          color: '#fff', display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden', minHeight: 180,
          cursor: currentActivity ? 'pointer' : 'default'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={22} color="#fff" />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Current Activity</h3>
          </div>
          <button style={{
            background: '#fff', color: '#0F4C5C', border: 'none',
            borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, pointerEvents: 'none'
          }}>View</button>
        </div>
        
        {currentActivity ? (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>{currentActivity.activity_name}</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              {format(new Date(currentActivity.created_at || new Date()), 'd MMM')} • {currentActivity.category}
            </p>
          </div>
        ) : (
          <div style={{ marginTop: 'auto' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Ready to start?</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>No active tasks at the moment.</p>
          </div>
        )}
        {/* Abstract ornament accent */}
        <div style={{ position: 'absolute', bottom: -10, right: 10, opacity: 0.2 }}>
           <TrendingUp size={100} color="#fff" strokeWidth={1} />
        </div>
      </motion.div>

      {/* Daily Progress Widget (Half Width) */}
      <motion.div 
        whileTap={{ scale: 0.96 }}
        onClick={() => onNavigateWithFilter('journey', 'Today')}
        style={{
          background: '#1E1E1E', borderRadius: 32, padding: '24px',
          color: '#fff', display: 'flex', flexDirection: 'column', cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: 6, borderRadius: '50%' }}>
            <CheckCircle2 size={16} color="#10B981" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Daily Goal</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 26, fontWeight: 800 }}>{progressPercent}%</span>
          <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{completedToday} of {totalToday} tasks</p>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ height: '100%', background: '#10B981', borderRadius: 3 }} />
        </div>
      </motion.div>

      {/* Persistence / Alert Widget (Half Width) */}
      <motion.div 
        whileTap={{ scale: 0.96 }}
        onClick={() => onNavigateWithFilter('journey', stats.highAlert > 0 ? 'Critical' : 'In Progress')}
        style={{
          background: stats.highAlert > 0 ? '#EF4444' : '#A100FF', borderRadius: 32, padding: '24px',
          color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: '50%' }}>
            {stats.highAlert > 0 ? <AlertCircle size={16} /> : <TrendingUp size={16} />}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{stats.highAlert > 0 ? 'Urgent' : 'Status'}</span>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <span style={{ fontSize: 26, fontWeight: 800 }}>{stats.highAlert > 0 ? stats.highAlert : stats.inProgress}</span>
          <p style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{stats.highAlert > 0 ? 'Critical items' : 'In progress'}</p>
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
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1E1E1E', letterSpacing: '-0.3px' }}>Recent Logs</h2>
        <button onClick={onViewAll} style={{
          fontSize: 13, fontWeight: 700, color: '#0F4C5C',
          background: 'none', border: 'none', cursor: 'pointer'
        }}>
          See All
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
        {activities.length > 0 ? (
          activities.slice(0, 4).map((a, i) => {
            const config = CATEGORY_MAP[a.category ?? 'Other'] || CATEGORY_MAP['Other'];
            // Create a pseudo-random vibrant bento color based on index
            const bgColors = ['#A3C4F3', '#FFD166', '#D4FF26', '#1E1E1E'];
            const textColor = bgColors[i % bgColors.length] === '#1E1E1E' ? '#fff' : '#1E1E1E';
            const bentoBg = bgColors[i % bgColors.length];
            return (
              <motion.div
                key={a.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewActivity(a)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: bentoBg, borderRadius: 28, padding: '24px',
                  color: textColor, display: 'flex', flexDirection: 'column', gap: 12,
                  position: 'relative', overflow: 'hidden', cursor: 'pointer'
                }}
              >
                {/* Large Background Icon */}
                <div style={{ position: 'absolute', bottom: -15, right: -10, opacity: 0.12, transform: 'rotate(-10deg)', pointerEvents: 'none' }}>
                  <config.icon size={110} color={textColor} strokeWidth={1.5} />
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
          <div style={{ background: '#F0F3F5', borderRadius: 28, padding: '30px', textAlign: 'center', color: '#94A3B8' }}>
            <ClipboardList size={28} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600 }}>No recent logs.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
export default function Dashboard({ user, stats, recentActivities, onViewAll, onAddNew, onViewActivity, onNavigateWithFilter }: DashboardProps) {
  const currentActivity = recentActivities.find(a => a.status === 'In Progress') ?? null;
  const completedRecent = recentActivities.filter(a => a.status === 'Completed');

  // Greeting and Date Logic
  const now = new Date();
  const hour = now.getHours();
  const dateStr = format(now, 'EEEE, d MMMM');
  
  let greeting = 'Good Evening';
  let TimeIcon = MoonStar;
  let iconColor = '#6366F1';

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
    iconColor = '#6366F1';
  } else {
    greeting = 'Good Night';
    TimeIcon = MoonStar;
    iconColor = '#4B5563';
  }

  return (
    <div style={{ paddingBottom: 100, background: '#FAFAFA', minHeight: '100dvh' }}>
      {/* ── STICKY HEADER ── */}
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        background: 'rgba(250, 250, 250, 0.85)', 
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)',
        padding: '12px 24px 20px',
        borderBottom: '1px solid rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <TimeIcon size={18} color={iconColor} strokeWidth={2.5} />
              <span style={{ fontSize: 13, fontWeight: 700, color: iconColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {greeting}
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1E1E1E', letterSpacing: '-0.7px', lineHeight: 1.1 }}>
              Hello, {user?.fullName ? user.fullName.split(' ')[0] : 'Rudi'} 
            </h1>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginTop: 4 }}>
              {dateStr}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#E2E8F0',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff', boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
              color: '#1E1E1E', fontSize: 20, fontWeight: 700
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
