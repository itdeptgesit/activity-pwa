import React, { useState, useEffect, useMemo, useRef } from "react";
import { Activity } from "@/src/types";
import {
  X, Save, ChevronDown, AlertCircle, Search,
  MapPin, Clock, Calendar, User, CheckCircle2,
  Building2, Tag, ShieldCheck, Zap, Plus, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

interface UserOption {
  name: string;
  department: string;
  avatarUrl?: string;
}

interface Props {
  isOpen: boolean;
  onSave: (a: Partial<Activity>) => void;
  onClose: () => void;
  initialData?: Activity | null;
  currentUserName?: string;
  users?: UserOption[];
  departments?: string[];
}

const CATEGORIES = [
  'Troubleshooting', 'Maintenance', 'Creative & Design',
  'Infrastructure & Network', 'Procurement & Assets',
  'Technical Support', 'Web Development', 'Other'
];
const PRIORITIES = ['Minor', 'Major', 'Critical'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

const STATUS_COLORS: Record<string, { active: string; bg: string; border: string }> = {
  'Completed': { active: '#16a34a', bg: '#e8faf2', border: '#bbf7d0' },
  'In Progress': { active: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  'Pending': { active: '#d97706', bg: '#fffbeb', border: '#fde68a' },
};

const inputBase: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 12px',
  background: 'var(--app-bg)', border: '1px solid var(--app-border)',
  borderRadius: 14, color: 'var(--app-text)', fontSize: 13, fontWeight: 600,
  outline: 'none', transition: 'all 0.2s',
  appearance: 'none',
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--app-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, marginLeft: 2 }}>
      {children}
    </p>
  );
}

function FieldWrap({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <Label>{label}</Label>
      {children}
      {error && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#EF4444', marginTop: 6, fontWeight: 700, paddingLeft: 4 }}>
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, var(--app-card), color-mix(in srgb, var(--app-card) 92%, var(--app-bg) 8%))',
      borderRadius: 22,
      padding: '14px',
      border: '1px solid var(--app-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--app-text)', marginBottom: 2 }}>{title}</h3>
        <p style={{ fontSize: 11, color: 'var(--app-muted)', fontWeight: 600 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export default function ActivityForm({
  isOpen, onSave, onClose, initialData, currentUserName,
  users = [], departments = []
}: Props) {
  const [form, setForm] = useState<Partial<Activity>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Date States (Sync with snippet)
  const [createdAt, setCreatedAt] = useState('');
  const [completedAt, setCompletedAt] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  // User Search State
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setCreatedAt(initialData.created_at ? initialData.created_at.split('T')[0] : '');
      setCompletedAt(initialData.completed_at ? initialData.completed_at.split('T')[0] : '');
      setUpdatedAt(initialData.updated_at ? initialData.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]);

      setForm({
        ...initialData,
        it_personnel: initialData.it_personnel || currentUserName || 'IT Admin',
      });
      setUserSearch(initialData.requester || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setCreatedAt(today);
      setCompletedAt(today);
      setUpdatedAt(today);

      setForm({
        status: 'Completed',
        type: 'Minor',
        it_personnel: currentUserName || 'IT Admin',
        requester: '',
        location: 'Head Office TCT 27',
        department: '',
        category: 'Troubleshooting',
        remarks: '',
        duration: '',
      });
      setUserSearch('');
    }
  }, [initialData, currentUserName]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()));
  }, [users, userSearch]);

  const set = (k: string, v: any) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => { const e = { ...p }; delete e[k]; return e; });
  };

  const handleUserSelect = (user: UserOption) => {
    const matchedDept = departments.find(d => d.toLowerCase() === user.department.toLowerCase()) || user.department;
    setForm(prev => ({ ...prev, requester: user.name, department: matchedDept || prev.department }));
    setUserSearch(user.name);
    setShowUserDropdown(false);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.activity_name?.trim()) e.activity_name = 'Activity name is required';
    if (!userSearch.trim()) e.requester = 'Requester is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const dataToSubmit = {
      ...form,
      requester: userSearch,
      created_at: `${createdAt}T00:00:00`,
      completed_at: form.status === 'Completed' ? `${completedAt}T00:00:00` : null,
      updated_at: `${updatedAt}T00:00:00`,
    };
    try { await onSave(dataToSubmit); } finally { setSaving(false); }
  };

  const focusStyle = (e: React.FocusEvent<any>) => {
    e.target.style.borderColor = '#f5c842';
    e.target.style.background = 'var(--app-card)';
  };
  const blurStyle = (e: React.FocusEvent<any>, hasError?: boolean) => {
    e.target.style.borderColor = hasError ? '#fca5a5' : 'var(--app-border)';
    e.target.style.background = 'var(--app-bg)';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0,
              left: 0, right: 0, margin: '0 auto',
              width: '100%', maxWidth: 480, zIndex: 1000,
              background: 'color-mix(in srgb, var(--app-bg) 92%, var(--app-card) 8%)',
              borderRadius: '26px 26px 0 0',
              maxHeight: '94dvh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 -12px 45px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              color: 'var(--app-text)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 6px' }}>
              <div style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--app-border)' }} />
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 20px 16px', borderBottom: '1px solid var(--app-border)',
            }}>
              <button onClick={onClose} style={{
                width: 38, height: 38, borderRadius: 12, border: '1px solid var(--app-border)',
                background: 'var(--app-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--app-muted)',
              }}><X size={18} /></button>

              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Activity Form
                </p>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--app-text)', margin: 0 }}>
                  {initialData ? 'Edit Activity' : 'New Activity'}
                </h2>
                <p style={{ fontSize: 11, color: 'var(--app-muted)', marginTop: 2 }}>
                  {initialData ? 'Update the details' : 'Fill in the details below'}
                </p>
              </div>

              <div style={{ width: 38 }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }} className="no-scrollbar">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 16 }}>

                {/* Main Bento Card: Primary Info */}
                <SectionCard title="Primary Information" subtitle="Main identity of activity">
                  <FieldWrap label="Activity Essence" error={errors.activity_name}>
                    <input
                      type="text" placeholder="What was done?"
                      value={form.activity_name || ''}
                      onChange={e => setForm(p => ({ ...p, activity_name: e.target.value }))}
                      style={{ ...inputBase, fontSize: 14, fontWeight: 600, color: 'var(--app-text)' }}
                      onFocus={focusStyle} onBlur={e => blurStyle(e, !!errors.activity_name)}
                    />
                  </FieldWrap>

                  <FieldWrap label="Requester" error={errors.requester}>
                    <div style={{ position: 'relative' }} ref={userDropdownRef}>
                      <input
                        type="text" placeholder="Personnel name..."
                        value={userSearch}
                        onChange={e => { setUserSearch(e.target.value); setShowUserDropdown(true); }}
                        onFocus={() => setShowUserDropdown(true)}
                        style={{ ...inputBase, borderColor: errors.requester ? '#EF4444' : '#F1F5F9' }}
                        onBlur={e => blurStyle(e, !!errors.requester)}
                      />

                      <AnimatePresence>
                        {showUserDropdown && (userSearch.trim().length > 0) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            style={{
                              position: 'absolute', top: '110%', left: 0, right: 0,
                              background: 'var(--app-card)', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                              maxHeight: 200, overflowY: 'auto', zIndex: 110, border: '1px solid var(--app-border)',
                            }}
                          >
                            {filteredUsers.map((user, idx) => (
                              <button key={idx} type="button" onClick={() => handleUserSelect(user)}
                                style={{
                                  width: '100%', textAlign: 'left', padding: '10px 14px',
                                  borderBottom: '1px solid var(--app-border)', display: 'flex', gap: 10, alignItems: 'center',
                                  background: 'none', border: 'none', cursor: 'pointer',
                                }}
                              >
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--app-text)', color: 'var(--app-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-text)' }}>{user.name}</p>
                                  <p style={{ fontSize: 9, color: 'var(--app-muted)' }}>{user.department}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </FieldWrap>
                </SectionCard>

                {/* Secondary Bento Grid: Logistics */}
                <SectionCard title="Timeline & Classification" subtitle="Dates, priority and routing">
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <FieldWrap label="Start Date">
                        <input type="date" value={createdAt} onChange={e => setCreatedAt(e.target.value)}
                          style={inputBase} onFocus={focusStyle} onBlur={e => blurStyle(e)} />
                      </FieldWrap>
                      <FieldWrap label="Success Date">
                        <input type="date" value={completedAt} onChange={e => setCompletedAt(e.target.value)}
                          style={inputBase} onFocus={focusStyle} onBlur={e => blurStyle(e)} />
                      </FieldWrap>
                   </div>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <FieldWrap label="Duration">
                        <input type="text" placeholder="30m" value={form.duration || ''}
                          onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} style={inputBase} onFocus={focusStyle} onBlur={e => blurStyle(e)} />
                      </FieldWrap>
                      <FieldWrap label="Area">
                        <input type="text" value={form.location || ''}
                          onChange={e => setForm(p => ({ ...p, location: e.target.value }))} style={inputBase} onFocus={focusStyle} onBlur={e => blurStyle(e)} />
                      </FieldWrap>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <FieldWrap label="Category">
                        <div style={{ position: 'relative' }}>
                          <select value={form.category || 'Troubleshooting'} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                            style={{ ...inputBase, paddingRight: 24 }}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown size={12} color="#94A3B8" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                      </FieldWrap>
                      <FieldWrap label="Status">
                        <div style={{ position: 'relative' }}>
                          <select value={form.status || 'Completed'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                            style={{ ...inputBase, paddingRight: 24 }}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown size={12} color="#94A3B8" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                      </FieldWrap>
                   </div>

                   <FieldWrap label="Department">
                      <div style={{ position: 'relative' }}>
                        <select value={form.department || ''} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                          style={{ ...inputBase, paddingRight: 24 }}>
                          <option value="" disabled>Select Department</option>
                          {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronDown size={12} color="#94A3B8" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                   </FieldWrap>
                </SectionCard>

                <SectionCard title="Notes" subtitle="Additional context and details">
                  <FieldWrap label="Insights">
                    <textarea placeholder="Write additional context..." rows={3} value={form.remarks || ''}
                      onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))}
                      style={{ ...inputBase, height: 'auto', padding: '10px 12px', borderRadius: 16, resize: 'none' }}
                      onFocus={focusStyle} onBlur={e => blurStyle(e)}
                    />
                  </FieldWrap>
                </SectionCard>
              </div>
            </div>

            <div style={{ padding: '12px 16px 24px', borderTop: '1px solid var(--app-border)', background: 'color-mix(in srgb, var(--app-bg) 92%, var(--app-card) 8%)' }}>
              <button onClick={handleSubmit} disabled={saving}
                style={{
                  width: '100%', height: 48, borderRadius: 16, border: 'none',
                  background: 'linear-gradient(135deg, var(--app-text), color-mix(in srgb, var(--app-text) 84%, #4F46E5 16%))',
                  color: 'var(--app-bg)', fontSize: 14, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
                  opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {saving ? 'Processing...' : (initialData ? 'Update Record' : 'Submit Entry')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

