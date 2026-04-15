import React, { useState } from 'react';
import { 
  BarChart2, PieChart, TrendingUp, Calendar, 
  CheckCircle2, Clock, AlertTriangle, ArrowUpRight,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Activity, DashboardStats } from '../types';
import { format, subDays, isSameDay } from 'date-fns';



interface SummaryViewProps {
  activities: Activity[];
  stats: DashboardStats;
}

export default function SummaryView({ activities, stats }: SummaryViewProps) {
  const [trendAnchorDate, setTrendAnchorDate] = useState<Date>(new Date());

  // 1. Category Distribution
  const categoryData = activities.reduce((acc: Record<string, number>, curr) => {
    const cat = curr.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const maxCatCount = Math.max(...Object.values(categoryData), 1);
  const sortedCategories = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);

  // 2. Weekly Volume Trend (Last 7 Days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(trendAnchorDate, i)).reverse();
  const trendData = last7Days.map(date => {
    const count = activities.filter(a => a.created_at && isSameDay(new Date(a.created_at), date)).length;
    return { date, count };
  });
  const maxTrendCount = Math.max(...trendData.map(d => d.count), 1);

  // 3. Status Ratio
  const total = activities.length || 1;
  const completedPercent = Math.round((stats.completed / total) * 100);
  const statusPills = [
    { label: `Completed ${stats.completed}`, tone: 'Completed' as const },
    { label: `In Progress ${stats.inProgress}`, tone: 'In Progress' as const },
    { label: `High Alert ${stats.highAlert}`, tone: 'High Alert' as const },
  ];

  // 4. Insights
  const topCategory = sortedCategories[0]?.[0] || 'None';
  const busyDay = trendData.reduce((prev, current) => (prev.count > current.count) ? prev : current);

  return (
    <div style={{ padding: 'calc(140px + env(safe-area-inset-top, 0px)) 20px 100px', background: 'transparent', minHeight: '100dvh' }}>
      {/* Fixed Title Header */}
      <div style={{ 
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 100,
        background: 'var(--app-header-bg)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        padding: 'calc(12px + env(safe-area-inset-top, 0px)) 24px 14px',
        borderBottom: '1px solid var(--app-border)'
      }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, color: 'var(--app-text)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>Activity Summary</h1>
        <p style={{ fontSize: 13, color: 'var(--app-muted)', marginTop: 6, fontWeight: 600 }}>Analyzing performance patterns</p>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 14, paddingBottom: 4 }} className="no-scrollbar">
          {statusPills.map((pill) => (
            <SummaryBadge key={pill.label} label={pill.label} tone={pill.tone} />
          ))}
        </div>
      </div>

      {/* ── INSIGHTS BENTO ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 28 }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #4F46E5, #312E81)', 
          borderRadius: 24, padding: '22px', color: '#fff',
          gridColumn: '1 / -1', boxShadow: '0 10px 40px rgba(79, 70, 229, 0.15)',
          position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: '50%' }}>
              <Target size={18} color="#fff" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Key Insight</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, position: 'relative', zIndex: 1, letterSpacing: '-0.5px' }}>
            {topCategory !== 'None' 
              ? `Heavily focused on ${topCategory} logs.` 
              : "Logging tasks will reveal focus areas here."}
          </h2>
          <p style={{ fontSize: 12, marginTop: 12, opacity: 0.8, position: 'relative', zIndex: 1, fontWeight: 600 }}>
            Analysis of your last {activities.length} entries.
          </p>
          <div style={{ position: 'absolute', bottom: -20, right: -20, opacity: 0.15 }}>
            <Target size={140} color="#fff" strokeWidth={1} />
          </div>
        </div>

        <div style={{ background: 'var(--app-card)', borderRadius: 24, padding: '22px', border: '1px solid var(--app-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', minHeight: 158 }}>
          <div style={{ color: 'var(--soft-amber)', marginBottom: 12, background: 'color-mix(in srgb, var(--soft-amber) 18%, transparent)', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} />
          </div>
          <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--app-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Peak activity</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--app-text)', marginTop: 4 }}>{format(busyDay.date, 'EEEE')}</p>
        </div>

        <div style={{ background: 'var(--app-card)', borderRadius: 24, padding: '22px', border: '1px solid var(--app-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', minHeight: 158 }}>
          <div style={{ color: 'var(--accent)', marginBottom: 12, background: 'rgba(99, 102, 241, 0.1)', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--app-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Success Rate</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--app-text)', marginTop: 4 }}>{completedPercent}% Goal</p>
        </div>
      </div>

      {/* ── CATEGORY DISTRIBUTION ── */}
      <section style={{ marginBottom: 44 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '0 4px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--app-text)', letterSpacing: '-0.3px' }}>Performance</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--app-muted)' }}>
             <Target size={16} />
             <span style={{ fontSize: 12, fontWeight: 700 }}>Metrics</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sortedCategories.slice(0, 5).map(([cat, count], i) => (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800 }}>
                <span style={{ color: 'var(--app-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{cat}</span>
                <span style={{ color: 'var(--app-text)' }}>{count} logs</span>
              </div>
              <div style={{ height: 10, background: 'var(--app-border)', borderRadius: 6, overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCatCount) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 1, ease: 'easeOut' }}
                  style={{ 
                    height: '100%', 
                    background: i === 0 ? 'var(--accent)' : 'linear-gradient(90deg, var(--accent) 0%, #A3C4F3 100%)', 
                    borderRadius: 6,
                    opacity: i === 0 ? 1 : 0.6 + (0.4 / (i+1))
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WEEKLY TREND ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '0 4px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--app-text)', letterSpacing: '-0.3px' }}>Volume Trend</h2>
          <div
            style={{
              position: 'relative',
              width: 30,
              height: 30,
              borderRadius: 10,
              border: '1px solid var(--app-border)',
              background: 'var(--app-card)',
              color: 'var(--app-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
          >
            <Calendar size={16} />
            <input
              type="date"
              aria-label="Choose trend date"
              title={`Anchor date: ${format(trendAnchorDate, 'd MMM yyyy')}`}
              value={format(trendAnchorDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                if (!e.target.value) return;
                setTrendAnchorDate(new Date(`${e.target.value}T00:00:00`));
              }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
        <div style={{ 
          background: 'var(--app-card)', borderRadius: 32, padding: '28px', 
          height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10,
          border: '1px solid var(--app-border)'
        }}>
          {trendData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(d.count / maxTrendCount) * 120}px` }}
                transition={{ delay: i * 0.05, type: 'spring', damping: 15 }}
                style={{ 
                  width: '100%', maxWidth: 28, 
                  background: isSameDay(d.date, new Date()) ? 'var(--accent)' : 'var(--app-border)', 
                  borderRadius: 8, minHeight: 6,
                  boxShadow: isSameDay(d.date, new Date()) ? '0 10px 20px rgba(99, 102, 241, 0.4)' : 'none'
                }} 
              />
              <span style={{ fontSize: 10, fontWeight: 800, color: isSameDay(d.date, new Date()) ? 'var(--app-text)' : 'var(--app-muted)', textTransform: 'uppercase' }}>
                {format(d.date, 'eee')}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryBadge({ label, tone }: { label: string; tone: 'Completed' | 'In Progress' | 'High Alert' }) {
  const styleMap: Record<string, { bg: string; color: string }> = {
    'Completed': { bg: '#10B981', color: '#ffffff' },
    'In Progress': { bg: '#6366F1', color: '#ffffff' },
    'High Alert': { bg: '#EF4444', color: '#ffffff' },
  };
  const style = styleMap[tone];

  return (
    <div style={{
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      borderRadius: 8,
      padding: '6px 11px',
      whiteSpace: 'nowrap',
      color: style.color,
      background: style.bg
    }}>
      {label}
    </div>
  );
}
