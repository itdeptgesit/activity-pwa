import React from 'react';
import { 
  X, Pencil, Trash2, Calendar, User, Building, MapPin, 
  Clock, FileText, Activity as ActivityIcon, ChevronRight,
  Info, Briefcase, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from '../types';
import { format } from 'date-fns';

interface ActivityDetailViewProps {
  activity: Activity | null;
  onClose: () => void;
  onEdit: (a: Activity) => void;
  onDelete: (id: number) => void;
}

const CATEGORY_STYLES: Record<string, { color: string, gradient: string }> = {
  'Troubleshooting':           { color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #991B1B)' },
  'Maintenance':               { color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #1E40AF)' },
  'Infrastructure & Network':  { color: '#6366F1', gradient: 'linear-gradient(135deg, #6366F1, #3730A3)' },
  'Technical Support':         { color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #065F46)' },
  'Web Development':           { color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #5B21B6)' },
  'Creative & Design':         { color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899, #9D174D)' },
  'Procurement & Assets':      { color: '#64748B', gradient: 'linear-gradient(135deg, #64748B, #334155)' },
  'Other':                     { color: '#94A3B8', gradient: 'linear-gradient(135deg, #94A3B8, #475569)' },
};

export default function ActivityDetailView({ activity, onClose, onEdit, onDelete }: ActivityDetailViewProps) {
  if (!activity) return null;

  const style = CATEGORY_STYLES[activity.category ?? 'Other'] || CATEGORY_STYLES['Other'];

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}>
        {/* Backdrop for closing */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            width: '100%', maxWidth: 440, maxHeight: '85vh',
            background: 'rgba(255, 255, 255, 0.9)', 
            borderRadius: 32, position: 'relative', overflow: 'hidden', 
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.5)'
          }}
        >
          {/* Header */}
          <div style={{ padding: '32px 28px 24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ 
                padding: '6px 14px', borderRadius: 20, 
                background: `${style.color}15`, color: style.color,
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em'
              }}>
                {activity.category}
              </div>
              <button 
                onClick={onClose}
                style={{ 
                   width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9',
                   border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
                }}
              >
                <X size={16} color="#64748B" />
              </button>
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.15, marginBottom: 12 }}>
              {activity.activity_name}
            </h2>
            
            <div style={{ display: 'flex', gap: 16 }}>
               <StatusBadge label={activity.status} color={activity.status === 'Completed' ? '#10B981' : '#F59E0B'} />
               <StatusBadge label={activity.duration || 'Flexible'} color="#64748B" icon={<Clock size={10} />} />
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px 32px' }} className="no-scrollbar">
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 32 }}>
              <MinimalDetailItem icon={<User size={14} />} label="IT Personnel" value={activity.it_personnel} />
              <MinimalDetailItem icon={<Briefcase size={14} />} label="Requester" value={activity.requester} />
              <MinimalDetailItem icon={<Building size={14} />} label="Department" value={activity.department} />
              <MinimalDetailItem icon={<MapPin size={14} />} label="Location" value={activity.location} />
              <div style={{ gridColumn: 'span 2' }}>
                 <MinimalDetailItem icon={<Calendar size={14} />} label="Logged Date" value={activity.created_at ? format(new Date(activity.created_at), 'EEEE, d MMMM yyyy') : '-'} />
              </div>
            </div>

            {/* Content Area */}
            <div style={{ position: 'relative' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h3>
               </div>
               <div style={{ 
                 background: '#F8FAFC', padding: '24px', borderRadius: 24, 
                 border: '1px solid #F1F5F9', color: '#475569', fontSize: 14, 
                 lineHeight: 1.6, fontWeight: 500, whiteSpace: 'pre-wrap'
               }}>
                 {activity.remarks || 'No detailed description provided.'}
               </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ padding: '20px 28px 32px', background: 'rgba(255,255,255,0.7)', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 12 }}>
             <motion.button 
               whileTap={{ scale: 0.97 }}
               onClick={() => { onEdit(activity); onClose(); }}
               style={{ 
                 flex: 1, height: 52, borderRadius: 16, background: '#1a1a2e', color: '#fff',
                 border: 'none', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer',
                 boxShadow: '0 10px 25px rgba(26,26,46,0.15)'
               }}
             >
               <Pencil size={16} />
               Edit Activity
             </motion.button>
             <motion.button 
               whileTap={{ scale: 0.97 }}
               onClick={() => { if (activity.id) { onDelete(activity.id); onClose(); } }}
               style={{ 
                 width: 52, height: 52, borderRadius: 16, background: '#FEE2E2', color: '#EF4444',
                 border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
               }}
             >
               <Trash2 size={18} />
             </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function StatusBadge({ label, color, icon }: { label: string, color: string, icon?: React.ReactNode }) {
  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: 6, 
      color: color, fontSize: 11, fontWeight: 600
    }}>
      {icon}
      <span style={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</span>
    </div>
  );
}

function MinimalDetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8' }}>
        {icon}
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', paddingLeft: 2 }}>
        {value || '—'}
      </div>
    </div>
  );
}
