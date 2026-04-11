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
}

const CATEGORY_ICON: Record<string, LucideIcon> = {
  'Troubleshooting': Wrench,
  'Maintenance': Settings,
  'Infrastructure & Network': Network,
  'Technical Support': LifeBuoy,
  'Web Development': Code,
  'Creative & Design': PenTool,
  'Procurement & Assets': ShoppingCart,
  'Other': ClipboardList,
};

export default function ActivityList({
  activities, searchQuery, onSearchChange, onEdit, onDelete, onViewDetail,
  canEdit = true, canDelete = true, activeFilter, onFilterChange
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
    <div style={{ padding: '270px 20px 120px', fontFamily: "'Poppins', sans-serif" }}>

      {/* Fixed Header Section */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 100,
        background: 'var(--app-header-bg)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        padding: '24px 20px 24px',
        borderBottom: '1px solid var(--app-border)'
      }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.5px' }}>Activity Logs</h2>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--app-muted)', marginTop: 4 }}>
            Showing {filteredActivities.length} entries {activeFilter !== 'All' && `for ${activeFilter}`}
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 20,
          overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          {(['All', 'Today', 'Week', 'Month', 'In Progress', 'Critical'] as LogFilter[]).map(f => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              style={{
                padding: '10px 18px', borderRadius: 14,
                background: activeFilter === f ? 'var(--app-text)' : 'var(--app-card)',
                color: activeFilter === f ? 'var(--app-bg)' : 'var(--app-muted)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: activeFilter === f ? '0 8px 16px rgba(26,26,46,0.15)' : '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                border: activeFilter === f ? 'none' : '1px solid var(--app-border)'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--app-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search documents or personnel..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            style={{
              width: '100%', height: 48,
              paddingLeft: 44, paddingRight: 16,
              background: 'var(--app-card)', border: '1.5px solid var(--app-border)',
              borderRadius: 16, color: 'var(--app-text)',
              fontSize: 14, fontWeight: 500, outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#10B981'}
            onBlur={e => e.target.style.borderColor = 'var(--app-border)'}
          />
        </div>
      </div>

      {/* Empty State */}
      <AnimatePresence mode="wait">
        {paginatedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '80px 24px' }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: 24,
              background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
              margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ClipboardList size={28} color="#CBD5E1" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>No logs found</h3>
            <p style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>Try adjusting your filters or search keywords</p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paginatedItems.map((activity, index) => {
              const IconComp = CATEGORY_ICON[activity.category ?? 'Other'] || CATEGORY_ICON['Other'];
              const bgColors = ['#FEE2E2', '#E0E7FF', '#ECFDF5', '#FFF7ED', '#F5F3FF'];
              const textColors = ['#991B1B', '#3730A3', '#065F46', '#9A3412', '#5B21B6'];
              const bentoBg = bgColors[index % bgColors.length];
              const textColor = textColors[index % textColors.length];

              return (

                <motion.div
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onViewDetail(activity)}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'var(--app-card)', borderRadius: 28, padding: '20px',
                    display: 'flex', flexDirection: 'column', gap: 14,
                    position: 'relative', overflow: 'hidden', cursor: 'pointer',
                    border: '1px solid var(--app-border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.08, pointerEvents: 'none', color: 'var(--app-text)' }}>
                    <IconComp size={88} strokeWidth={1.5} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, color: '#fff', background: activity.status === 'Completed' ? '#10B981' : '#F59E0B',
                          padding: '2px 8px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                          {activity.status}
                        </span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, color: 'var(--app-muted)', background: 'var(--app-bg)',
                          padding: '2px 8px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.05em',
                          border: '1px solid var(--app-border)'
                        }}>
                          {activity.type}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--app-text)', lineHeight: 1.3, marginBottom: 4 }}>
                        {activity.activity_name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.7, fontSize: 11, fontWeight: 500, color: 'var(--app-muted)' }}>
                        <span>{activity.category}</span>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor' }} />
                        <span>{activity.created_at ? format(new Date(activity.created_at), 'd MMM') : '—'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                      {canEdit && (
                        <button onClick={(e) => { e.stopPropagation(); onEdit(activity); }} style={{
                          width: 32, height: 32, borderRadius: 10, background: 'var(--app-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--app-border)', cursor: 'pointer',
                          color: 'var(--app-muted)'
                        }}>
                          <Pencil size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={(e) => { e.stopPropagation(); activity.id && onDelete(activity.id); }} style={{
                          width: 32, height: 32, borderRadius: 10, background: '#fef2f2',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fee2e2', cursor: 'pointer',
                          color: '#dc2626'
                        }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{
                    alignSelf: 'flex-start', padding: '5px 10px', background: 'var(--app-bg)',
                    borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 1,
                    border: '1px solid var(--app-border)'
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--app-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--app-bg)', fontSize: 10, fontWeight: 800 }}>
                      {activity.it_personnel ? activity.it_personnel[0].toUpperCase() : 'U'}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--app-text)' }}>{activity.it_personnel || 'IT Admin'}</span>
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
          marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
          padding: '10px 0'
        }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            style={{
              width: 40, height: 40, borderRadius: 14, border: 'none',
              background: '#fff', color: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {(() => {
              const pages = [];
              const showMax = 3; // Show current, one before, one after

              let startPage = Math.max(1, currentPage - 1);
              let endPage = Math.min(totalPages, startPage + showMax - 1);

              if (endPage - startPage < showMax - 1) {
                startPage = Math.max(1, endPage - showMax + 1);
              }

              if (startPage > 1) {
                pages.push(
                  <button key={1} onClick={() => setCurrentPage(1)} style={pageBtnStyle(false)}>1</button>
                );
                if (startPage > 2) pages.push(<span key="d1" style={ellipsisStyle}>...</span>);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    style={pageBtnStyle(currentPage === i)}
                  >
                    {i}
                  </button>
                );
              }

              if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push(<span key="d2" style={ellipsisStyle}>...</span>);
                pages.push(
                  <button key={totalPages} onClick={() => setCurrentPage(totalPages)} style={pageBtnStyle(false)}>
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            style={{
              width: 40, height: 40, borderRadius: 14, border: 'none',
              background: '#fff', color: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

const pageBtnStyle = (isActive: boolean): React.CSSProperties => ({
  width: 38, height: 38, borderRadius: 12, border: 'none',
  background: isActive ? '#1a1a2e' : '#fff',
  color: isActive ? '#fff' : '#64748b',
  fontSize: 13, fontWeight: 700, cursor: 'pointer',
  boxShadow: isActive ? '0 8px 20px rgba(26,26,46,0.2)' : '0 4px 10px rgba(0,0,0,0.02)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: isActive ? 'scale(1.05)' : 'scale(1)',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
});

const ellipsisStyle: React.CSSProperties = {
  fontSize: 13, color: '#CBD5E1', fontWeight: 700, padding: '0 4px'
};


