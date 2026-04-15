import React, { useState, useMemo } from "react";
import { Activity } from "../types";
import { format, isToday, isAfter, subDays, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Pencil, Trash2, User,
  ClipboardList, ChevronLeft, ChevronRight
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Wrench, Settings, Network, LifeBuoy, Code,
  PenTool, ShoppingCart
} from "lucide-react";

export type LogFilter = 'All' | 'Today' | 'Week' | 'Month' | 'In Progress' | 'Critical';

interface Props {
  activities: Activity[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onEdit: (a: Activity) => void;
  onDelete: (id: number) => void;
  onViewDetail: (a: Activity) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  activeFilter: LogFilter;
  onFilterChange: (f: LogFilter) => void;
  theme?: string;
}

const CATEGORY_MAP: Record<string, { icon: LucideIcon; accent: string; label: string; token: string }> = {
  'Troubleshooting':           { icon: Wrench,       accent: '#F87171', label: 'Troubleshoot', token: 'var(--cat-troubleshoot)' },
  'Maintenance':               { icon: Settings,     accent: '#6366F1', label: 'Maintenance',  token: 'var(--cat-maintenance)' },
  'Infrastructure & Network':  { icon: Network,      accent: '#4F46E5', label: 'Infra & Net',  token: 'var(--cat-network)' },
  'Technical Support':         { icon: LifeBuoy,     accent: '#10B981', label: 'Support',      token: 'var(--cat-support)' },
  'Web Development':           { icon: Code,         accent: '#8B5C08', label: 'Development',  token: 'var(--cat-dev)' },
  'Creative & Design':         { icon: PenTool,      accent: '#EC4899', label: 'Design',       token: 'var(--cat-design)' },
  'Procurement & Assets':      { icon: ShoppingCart, accent: '#64748B', label: 'Assets',       token: 'var(--cat-asset)' },
  'Other':                     { icon: ClipboardList,accent: '#94A3B8', label: 'Other',        token: 'var(--cat-other)' },
};

export default function ActivityList({
  activities, searchQuery, onSearchChange, onEdit, onDelete, onViewDetail,
  canEdit = true, canDelete = true, activeFilter, onFilterChange, theme
}: Props) {
  const isDark = theme === 'dark';
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const statusBadgeMap: Record<string, { bg: string; color: string }> = {
    'Completed': { bg: '#10B981', color: '#ffffff' },
    'In Progress': { bg: '#6366F1', color: '#ffffff' },
    'High Alert': { bg: '#EF4444', color: '#ffffff' },
  };
  const typeBadgeMap: Record<string, { bg: string; color: string }> = {
    'Critical': { bg: 'rgba(239, 68, 68, 0.14)', color: '#EF4444' },
    'Major': { bg: 'rgba(245, 158, 11, 0.18)', color: '#D97706' },
    'Minor': { bg: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', color: isDark ? 'rgba(255,255,255,0.75)' : '#64748b' },
  };

  // 1. Filtering logic
  const filteredActivities = useMemo(() => {
    const today = startOfDay(new Date());
    const weekAgo = subDays(today, 7);
    const monthAgo = subDays(today, 30);

    return activities.filter(a => {
      // Time Filtering
      let passTime = true;
      if (activeFilter === 'Today') passTime = a.created_at ? isToday(new Date(a.created_at)) : false;
      else if (activeFilter === 'Week') passTime = a.created_at ? isAfter(new Date(a.created_at), weekAgo) : false;
      else if (activeFilter === 'Month') passTime = a.created_at ? isAfter(new Date(a.created_at), monthAgo) : false;

      // Status/Priority Filtering
      if (activeFilter === 'In Progress') return a.status === 'In Progress';
      if (activeFilter === 'Critical') return a.type === 'Critical';

      return passTime;
    });
  }, [activities, activeFilter]);

  // 2. Pagination calculation
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedItems = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = (filter: LogFilter) => {
    onFilterChange(filter);
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: 'calc(270px + env(safe-area-inset-top, 0px)) 20px 120px' }}>

      {/* Fixed Header Section (Modernized) */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 100,
        background: 'var(--app-header-bg)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        padding: 'calc(20px + env(safe-area-inset-top, 0px)) 24px 20px',
        borderBottom: '1px solid var(--app-border)'
      }}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--app-text)', letterSpacing: '-0.8px' }}>Activity Logs</h2>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-muted)', marginTop: 4 }}>
            Showing {filteredActivities.length} entries
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: 24,
          overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none', msOverflowStyle: 'none'
        }}>
          {(['All', 'Today', 'Week', 'Month', 'In Progress'] as LogFilter[]).map(f => {
            const isActive = activeFilter === f;
            const activeColor = isDark ? '#6366F1' : '#F59E0B';
            return (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                style={{
                  padding: '10px 22px', borderRadius: 16,
                  background: isActive ? activeColor : 'var(--app-card)',
                  color: isActive ? '#fff' : 'var(--app-muted)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  border: isActive ? `1.5px solid ${activeColor}` : '1.5px solid var(--app-border)',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? `0 8px 20px ${activeColor}30` : 'none'
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Search Bar (Theme Aware) */}
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--app-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search documents or personnel..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            style={{
              width: '100%', height: 50,
              paddingLeft: 48, paddingRight: 16,
              background: 'var(--app-card)', border: '1.5px solid var(--app-border)',
              borderRadius: 14, color: 'var(--app-text)',
              fontSize: 14, fontWeight: 600, outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Empty State */}
      <AnimatePresence mode="wait">
        {paginatedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '100px 24px' }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'var(--secondary)', margin: '0 auto 20px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--app-border)', color: 'var(--app-muted)'
            }}>
              <ClipboardList size={28} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--app-text)', marginBottom: 6 }}>No records found</h3>
            <p style={{ fontSize: 13, color: 'var(--app-muted)', fontWeight: 500 }}>Refine your search or filter</p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paginatedItems.map((activity, index) => {
              const config = CATEGORY_MAP[activity.category ?? 'Other'] || CATEGORY_MAP['Other'];

              return (

                <motion.div
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onViewDetail(activity)}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  style={{
                    background: 'var(--app-card)', borderRadius: 24, padding: '22px 24px',
                    display: 'flex', flexDirection: 'column',
                    position: 'relative', overflow: 'hidden', cursor: 'pointer',
                    border: '1.5px solid var(--app-border)',
                    boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Status & Priority Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                       <div style={{ display: 'flex', gap: 6 }}>
                          {(() => {
                            const statusStyle = statusBadgeMap[activity.status || ''] || { bg: 'rgba(99, 102, 241, 0.15)', color: '#4F46E5' };
                            return (
                              <span style={{
                                fontSize: 9, fontWeight: 800, padding: '4px 12px', borderRadius: 8,
                                textTransform: 'uppercase', letterSpacing: '0.08em',
                                background: statusStyle.bg,
                                color: statusStyle.color
                              }}>
                                {activity.status}
                              </span>
                            );
                          })()}
                          {(() => {
                            const rawType = activity.type || 'Minor';
                            const typeKey = ['Critical', 'Major', 'Minor'].includes(rawType) ? rawType : 'Minor';
                            const typeStyle = typeBadgeMap[typeKey];
                            return (
                              <span style={{
                                fontSize: 9, fontWeight: 800, padding: '4px 12px', borderRadius: 8,
                                textTransform: 'uppercase', letterSpacing: '0.08em',
                                background: typeStyle.bg,
                                color: typeStyle.color
                              }}>
                                {rawType.toUpperCase()}
                              </span>
                            );
                          })()}
                       </div>
                       
                       <div style={{ display: 'flex', gap: 8 }}>
                         {canEdit && (
                            <button onClick={(e) => { e.stopPropagation(); onEdit(activity); }} style={{
                              width: 38, height: 38, borderRadius: 12, background: 'var(--secondary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--app-border)', cursor: 'pointer',
                              color: 'var(--app-muted)'
                            }}>
                              <Pencil size={15} strokeWidth={2.5} />
                            </button>
                         )}
                         <button onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }} style={{
                            width: 38, height: 38, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(239, 68, 68, 0.05)', cursor: 'pointer',
                            color: '#ef4444'
                          }}>
                            <Trash2 size={15} strokeWidth={2.5} />
                          </button>
                       </div>
                    </div>

                    {/* Title & Info */}
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--app-text)', lineHeight: 1.2, marginBottom: 8, letterSpacing: '-0.4px' }}>
                      {activity.activity_name}
                    </h3>
                    
                    <div style={{ 
                      fontSize: 11, fontWeight: 600, color: 'var(--app-muted)', 
                      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 
                    }}>
                      {config.label} • {activity.created_at ? format(new Date(activity.created_at), 'd MMM') : '—'}
                    </div>

                    {/* Personnel Badge */}
                    <div style={{
                      alignSelf: 'flex-start', padding: '8px 14px', background: 'var(--app-card)',
                      borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10,
                      border: '1.5px solid var(--app-border)'
                    }}>
                      <div style={{ 
                        width: 22, height: 22, borderRadius: '50%', background: isDark ? '#fff' : '#000', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: isDark ? '#000' : '#fff', fontSize: 10, fontWeight: 800 
                      }}>
                        {activity.it_personnel ? activity.it_personnel[0].toUpperCase() : 'A'}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--app-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {activity.it_personnel || 'IT ADMIN'}
                      </span>
                    </div>
                  </div>

                  {/* Decorative Background Icon */}
                  <div style={{ position: 'absolute', bottom: -10, right: -10, opacity: isDark ? 0.1 : 0.05, color: 'var(--app-text)' }}>
                     <config.icon size={130} strokeWidth={1.5} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{
          marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: '10px 0'
        }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--secondary)', color: 'var(--app-text)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1,
              border: '1px solid var(--app-border)'
            }}
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
             <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text)' }}>{currentPage}</span>
             <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-muted)' }}>/ {totalPages}</span>
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--secondary)', color: 'var(--app-text)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.3 : 1,
              border: '1px solid var(--app-border)'
            }}
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}



