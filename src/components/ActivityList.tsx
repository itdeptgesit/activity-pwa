import React, { useState, useMemo } from "react";
import { Activity } from "../types";
import { format, isToday, isAfter, subDays, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Pencil, Trash2, User,
  ClipboardList, ChevronLeft, ChevronRight, Calendar
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
  const statusDotMap: Record<string, string> = {
    'Completed': isDark ? '#6FCF97' : '#43A86B',
    'In Progress': isDark ? '#8B7CFF' : '#6C4CF1',
    'High Alert': isDark ? '#E0685F' : '#D64545',
    'Pending': isDark ? '#F5B26B' : '#F59E4C',
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
            return (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                style={{
                  padding: '10px 18px', borderRadius: 999, minHeight: 40,
                  background: isActive ? 'var(--app-text)' : 'var(--app-card)',
                  color: isActive ? 'var(--app-bg)' : 'var(--app-muted)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  border: '1px solid var(--app-border)',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: 'none'
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
              background: 'var(--app-card)', border: '1px solid var(--app-border)',
              borderRadius: 16, color: 'var(--app-text)',
              fontSize: 16, fontWeight: 600, outline: 'none'
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
              background: 'var(--pastel-lav)', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', color: 'var(--pastel-lav-ink)'
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
                    background: 'var(--app-card)', borderRadius: 22, padding: '16px 18px 18px',
                    display: 'flex', flexDirection: 'column',
                    position: 'relative', overflow: 'hidden', cursor: 'pointer',
                    border: '1px solid var(--app-border)',
                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 6px 16px rgba(23,23,43,0.04)'
                  }}
                >
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Date chip & actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        background: 'var(--secondary)', borderRadius: 999, padding: '7px 12px',
                        fontSize: 12, fontWeight: 600, color: 'var(--app-text)', whiteSpace: 'nowrap'
                      }}>
                        <Calendar size={14} color={isDark ? '#8B7CFF' : '#6C4CF1'} />
                        {activity.created_at ? format(new Date(activity.created_at), 'd MMM yyyy') : '—'}
                      </span>

                      <div style={{ display: 'flex', gap: 8 }}>
                        {canEdit && (
                          <button onClick={(e) => { e.stopPropagation(); onEdit(activity); }} aria-label="Edit" style={{
                            width: 40, height: 40, borderRadius: 12, background: 'var(--secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--app-border)', cursor: 'pointer',
                            color: 'var(--app-muted)'
                          }}>
                            <Pencil size={15} strokeWidth={2.5} />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }} aria-label="Delete" style={{
                          width: 40, height: 40, borderRadius: 12, background: isDark ? 'rgba(224, 104, 95, 0.12)' : 'rgba(214, 69, 69, 0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid transparent', cursor: 'pointer',
                          color: isDark ? '#E0685F' : '#D64545'
                        }}>
                          <Trash2 size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--app-text)', lineHeight: 1.35, margin: '10px 0 9px', letterSpacing: '-0.2px' }}>
                      {activity.activity_name}
                    </h3>

                    {/* Meta: kategori, status, prioritas */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12.5, fontWeight: 600, color: 'var(--app-muted)', flexWrap: 'wrap', marginBottom: 14 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: config.accent }} />
                        {config.label}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusDotMap[activity.status || ''] || '#94A3B8' }} />
                        <span style={{ color: statusDotMap[activity.status || ''] || 'var(--app-muted)' }}>{activity.status}</span>
                      </span>
                      {activity.type === 'Critical' && (
                        <span style={{ color: isDark ? '#E0685F' : '#D64545', fontWeight: 700 }}>Critical</span>
                      )}
                      {activity.type === 'Major' && (
                        <span style={{ color: isDark ? '#D1A249' : '#D97706', fontWeight: 700 }}>Major</span>
                      )}
                    </div>

                    {/* Personnel */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', background: 'var(--pastel-lav)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--pastel-lav-ink)', fontSize: 11, fontWeight: 800
                      }}>
                        {activity.it_personnel ? activity.it_personnel[0].toUpperCase() : 'A'}
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--app-text)' }}>
                        {activity.it_personnel || 'IT Admin'}
                      </span>
                      {activity.duration ? (
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--app-muted)', marginLeft: 'auto' }}>{activity.duration}</span>
                      ) : null}
                    </div>
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



