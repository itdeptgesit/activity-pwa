import React from 'react';
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
    <div style={{ padding: '60px 24px 120px', background: '#FAFAFA' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1E1E1E', letterSpacing: '-0.5px' }}>Activity Summary</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Analyzing your work patterns and performance</p>
      </header>

      {/* ── INSIGHTS BENTO ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 32 }}>
        <div style={{ background: '#0F4C5C', borderRadius: 28, padding: '24px', color: '#fff', gridColumn: '1 / -1' }}>
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

        <div style={{ background: '#fff', borderRadius: 28, padding: '20px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ color: '#F59E0B', marginBottom: 12 }}><TrendingUp size={24} /></div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Busy Day</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#1E1E1E', marginTop: 4 }}>{format(busyDay.date, 'EEEE')}</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 28, padding: '20px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ color: '#10B981', marginBottom: 12 }}><CheckCircle2 size={24} /></div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Success Rate</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#1E1E1E', marginTop: 4 }}>{completedPercent}% Done</p>
        </div>
      </div>

      {/* ── CATEGORY DISTRIBUTION ── */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1E1E1E' }}>Department Focus</h2>
          <BarChart2 size={18} color="#94A3B8" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedCategories.slice(0, 5).map(([cat, count], i) => (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                <span style={{ color: '#475569' }}>{cat}</span>
                <span style={{ color: '#1E1E1E' }}>{count} logs</span>
              </div>
              <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCatCount) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  style={{ height: '100%', background: i === 0 ? '#1E1E1E' : '#A3C4F3', borderRadius: 4 }} 
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WEEKLY TREND ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1E1E1E' }}>Weekly Volume</h2>
          <Calendar size={18} color="#94A3B8" />
        </div>
        <div style={{ 
          background: '#1E1E1E', borderRadius: 28, padding: '24px', 
          height: 180, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 
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
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                {format(d.date, 'eee')}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
