import React from 'react';
import { 
  BarChart2, PieChart, TrendingUp, Calendar, 
  CheckCircle2, Clock, AlertTriangle, ArrowUpRight,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Activity, DashboardStats } from '../types';
import { format, subDays, isSameDay } from 'date-fns';

import ContributionHeatmap from './ContributionHeatmap';

interface SummaryViewProps {
  activities: Activity[];
  stats: DashboardStats;
}

export default function SummaryView({ activities, stats }: SummaryViewProps) {
  // 1. Category Distribution
  const categoryData = activities.reduce((acc: Record<string, number>, curr) => {
    const cat = curr.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const maxCatCount = Math.max(...Object.values(categoryData), 1);
  const sortedCategories = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);

  // 2. Weekly Volume Trend (Last 7 Days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i)).reverse();
  const trendData = last7Days.map(date => {
    const count = activities.filter(a => a.created_at && isSameDay(new Date(a.created_at), date)).length;
    return { date, count };
  });
  const maxTrendCount = Math.max(...trendData.map(d => d.count), 1);

  // 3. Status Ratio
  const total = activities.length || 1;
  const completedPercent = Math.round((stats.completed / total) * 100);
  const inProgressPercent = Math.round((stats.inProgress / total) * 100);
  const highAlertPercent = Math.round((stats.highAlert / total) * 100);

  // 4. Insights
  const topCategory = sortedCategories[0]?.[0] || 'None';
  const busyDay = trendData.reduce((prev, current) => (prev.count > current.count) ? prev : current);

  return (
    <div style={{ padding: '24px 20px 100px', background: 'transparent', minHeight: '100dvh' }}>
      {/* Fixed Title Header */}
      <div style={{ 
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 100,
        background: 'var(--app-header-bg)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        padding: '24px 24px 16px',
        borderBottom: '1px solid var(--app-border)'
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--app-text)', letterSpacing: '-0.5px' }}>Activity Summary</h1>
        <p style={{ fontSize: 13, color: 'var(--app-muted)', marginTop: 4 }}>Analyzing your work patterns and performance</p>
      </div>

      {/* ── HEATMAP ── */}
      <ContributionHeatmap activities={activities} />

      {/* ── INSIGHTS BENTO ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 32 }}>
        <div style={{ background: '#0F4C5C', borderRadius: 28, padding: '24px', color: '#fff', gridColumn: '1 / -1', boxShadow: '0 10px 20px rgba(15, 76, 92, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Target size={20} color="#10B981" />
            <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.8 }}>Key Insight</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>
            {topCategory !== 'None' 
              ? `You've focused heavily on ${topCategory} this week.` 
              : "Start logging tasks to see personalized insights here."}
          </h2>
          <p style={{ fontSize: 12, marginTop: 12, opacity: 0.7 }}>
            Based on your last {activities.length} activity logs.
          </p>
        </div>

        <div style={{ background: 'var(--app-card)', borderRadius: 28, padding: '20px', border: '1px solid var(--app-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ color: '#F59E0B', marginBottom: 12 }}><TrendingUp size={24} /></div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--app-muted)', textTransform: 'uppercase' }}>Busy Day</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--app-text)', marginTop: 4 }}>{format(busyDay.date, 'EEEE')}</p>
        </div>

        <div style={{ background: 'var(--app-card)', borderRadius: 28, padding: '20px', border: '1px solid var(--app-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ color: '#10B981', marginBottom: 12 }}><CheckCircle2 size={24} /></div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--app-muted)', textTransform: 'uppercase' }}>Success Rate</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--app-text)', marginTop: 4 }}>{completedPercent}% Done</p>
        </div>
      </div>

      {/* ── CATEGORY DISTRIBUTION ── */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--app-text)' }}>Department Focus</h2>
          <BarChart2 size={18} color="var(--app-muted)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedCategories.slice(0, 5).map(([cat, count], i) => (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                <span style={{ color: 'var(--app-muted)' }}>{cat}</span>
                <span style={{ color: 'var(--app-text)' }}>{count} logs</span>
              </div>
              <div style={{ height: 8, background: 'var(--app-border)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCatCount) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  style={{ height: '100%', background: i === 0 ? 'var(--app-text)' : '#A3C4F3', borderRadius: 4 }} 
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WEEKLY TREND ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--app-text)' }}>Weekly Volume</h2>
          <Calendar size={18} color="var(--app-muted)" />
        </div>
        <div style={{ 
          background: 'var(--app-card)', borderRadius: 28, padding: '24px', 
          height: 180, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8,
          border: '1px solid var(--app-border)'
        }}>
          {trendData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(d.count / maxTrendCount) * 120}px` }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                style={{ 
                  width: '100%', maxWidth: 24, background: isSameDay(d.date, new Date()) ? '#D4FF26' : 'rgba(255,255,255,0.15)', 
                  borderRadius: 6, minHeight: 4
                }} 
              />
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--app-muted)' }}>
                {format(d.date, 'eee')}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
