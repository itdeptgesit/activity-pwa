import React from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, addDays, isSameDay, eachDayOfInterval } from 'date-fns';
import { Activity } from '../types';

interface ContributionHeatmapProps {
  activities: Activity[];
}

export default function ContributionHeatmap({ activities }: ContributionHeatmapProps) {
  // We want to show the last 6 months to fit mobile screens better
  const daysToShow = 140; // ~20 weeks
  const today = new Date();
  const startDate = startOfWeek(subDays(today, daysToShow));
  
  const allDays = eachDayOfInterval({
    start: startDate,
    end: today,
  });

  // Group by week for columns
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  allDays.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const getIntensity = (date: Date) => {
    const count = activities.filter(a => a.created_at && isSameDay(new Date(a.created_at), date)).length;
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  };

  const colors = [
    'rgba(148, 163, 184, 0.1)', // 0: Muted Gray
    'rgba(16, 185, 129, 0.3)',  // 1: Emerald Light
    'rgba(16, 185, 129, 0.6)',  // 2: Emerald Medium
    'rgba(16, 185, 129, 0.8)',  // 3: Emerald Strong
    '#10B981',                  // 4: Emerald Full Glow
  ];

  return (
    <div style={{ 
      background: 'var(--app-card)',
      borderRadius: 28,
      padding: '20px',
      border: '1px solid var(--app-border)',
      marginBottom: 32,
      overflowX: 'auto',
      scrollbarWidth: 'none'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--app-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Activity Intensity
        </h3>
        <span style={{ fontSize: 11, color: 'var(--app-muted)', fontWeight: 600 }}>Last 20 Weeks</span>
      </div>

      <div style={{ display: 'flex', gap: 4, minWidth: 'max-content' }}>
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {week.map((day, dayIdx) => {
              const intensity = getIntensity(day);
              return (
                <motion.div
                  key={dayIdx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (weekIdx * 7 + dayIdx) * 0.002 }}
                  title={`${format(day, 'MMM d, yyyy')}: ${activities.filter(a => a.created_at && isSameDay(new Date(a.created_at), day)).length} activities`}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: colors[intensity],
                    boxShadow: intensity >= 3 ? `0 0 10px ${colors[intensity]}44` : 'none'
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 9, color: 'var(--app-muted)', fontWeight: 700 }}>
        <span>Older</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span>Less</span>
          {colors.map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
          ))}
          <span>More</span>
        </div>
        <span>Today</span>
      </div>
    </div>
  );
}
