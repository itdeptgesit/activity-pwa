import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Shield, Key, Save,
  LogOut, Lock, Building2, Loader2, CheckCircle2,
  Briefcase, ShieldCheck, Globe, Camera, Edit3, X,
  Calendar, Trash2, Bell, Settings, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAccount, UserSession, Activity } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileViewProps {
  onLogout: () => void;
  user: UserAccount | null;
  onUpdateSuccess?: () => void;
  activities: Activity[];
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

// ── CUSTOM COMPONENTS (SHADCN ALTERNATIVES) ──────────────────────────

function Card({ children, className = "", style = {} }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--app-card)', borderRadius: 28, 
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      border: '1px solid var(--app-border)',
      overflow: 'hidden',
      color: 'var(--app-text)',
      ...style
    }} className={className}>
      {children}
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string, sub: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--app-text)', marginBottom: 6, letterSpacing: '-0.4px' }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--app-muted)', fontWeight: 600 }}>{sub}</p>
    </div>
  );
}

function Separator() {
  return <div style={{ height: 1, background: '#f0f0ea', margin: '24px 0' }} />;
}

// ── MAIN VIEW ────────────────────────────────────────────────────────

export default function ProfileView({ onLogout, user, onUpdateSuccess, activities, theme, onThemeToggle }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'account' | 'security' | 'notifications'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Rudi Siarudin',
    phone: user?.phone || '+62 812 3456 789',
    address: user?.address || 'Jakarta, Indonesia',
    company: user?.company || 'TCT Group',
    department: user?.department || 'IT Department',
    jobTitle: user?.jobTitle || 'Senior IT Support'
  });

  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);

  // Detect Current Session Metadata (Mocking logic from user snippet)
  useEffect(() => {
    const detectSession = async () => {
      const ua = navigator.userAgent;
      let device = ua.includes("Windows") ? "Windows PC" : ua.includes("iPhone") ? "iPhone" : "Mobile Device";
      let browser = ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : "Safari";
      
      const currentSession: UserSession = {
        device, browser, ip: '192.168.1.45',
        lastUpdated: new Date().toLocaleString(),
        sessionToken: 'current-token',
        isCurrent: true,
        location: 'Jakarta, Indonesia'
      };
      
      const otherSession: UserSession = {
        device: 'MacBook Pro', browser: 'Safari', ip: '10.20.30.40',
        lastUpdated: '10 Apr 2026, 09:15 AM',
        sessionToken: 'other-token',
        isCurrent: false,
        location: 'Surabaya, Indonesia'
      };

      setActiveSessions([currentSession, otherSession]);
    };
    detectSession();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      if (onUpdateSuccess) onUpdateSuccess();
    }, 1000);
  };

  const stats = [
    { label: 'Total Logs', value: activities.length, color: '#1a1a2e' },
    { label: 'Completion', value: `${Math.round((activities.filter(a => a.status === 'Completed').length / (activities.length || 1)) * 100)}%`, color: '#16a34a' },
    { label: 'Rank', value: 'Lead', color: '#f5c842' },
  ];

  return (
    <div style={{ padding: '24px 20px 100px', background: 'transparent' }}>
      
      {/* ── STICKY HEADER ── */}
      <div style={{ 
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 100,
        background: 'var(--app-header-bg)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        padding: '24px 24px 16px',
        borderBottom: '1px solid var(--app-border)'
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--app-text)', letterSpacing: '-0.5px' }}>Profile Settings</h1>
      </div>

      {/* 1. Header Identity Card (Bento Hero) */}
      <div style={{ 
        background: 'linear-gradient(165deg, #0F172A, #1E293B)', borderRadius: 32, 
        padding: '40px 24px', textAlign: 'center', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)'
      }}>
        {/* Subtle Background Pattern */}
        <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, color: '#fff' }}>
          <Shield size={160} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto 20px' }}>
            <div style={{ 
              width: '100%', height: '100%', borderRadius: 40, 
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 900, color: '#0F172A',
              border: '4px solid rgba(255,255,255,0.2)', boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
            }}>
              {avatarUrl ? <img src={avatarUrl} style={{ width: '100%', height: '100%', borderRadius: 36, objectFit: 'cover' }} /> : <span>{formData.fullName ? formData.fullName[0].toUpperCase() : 'U'}</span>}
            </div>
            <label style={{
              position: 'absolute', bottom: -5, right: -5,
              width: 36, height: 36, borderRadius: 14, background: '#10B981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', cursor: 'pointer', border: '3px solid #0F172A'
            }}>
              <Camera size={16} color="#fff" />
              <input type="file" style={{ display: 'none' }} />
            </label>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.5px' }}>{formData.fullName}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
             <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{formData.jobTitle}</span>
             <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
             <span style={{ fontSize: 10, fontWeight: 900, color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 10px', borderRadius: 20 }}>
               {user?.role ? user.role.toUpperCase() : 'CORE TEAM'}
             </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: 2, letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Custom Tabs */}
      <div style={{ 
        background: '#fff', padding: '8px', borderRadius: 24, marginBottom: 24,
        display: 'flex', gap: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        border: '1.5px solid rgba(0,0,0,0.01)'
      }}>
        {['personal', 'account', 'security'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 16, border: 'none',
              fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTab === tab ? '#0F172A' : 'transparent',
              color: activeTab === tab ? '#fff' : '#94A3B8',
              transform: activeTab === tab ? 'scale(1.02)' : 'scale(1)',
              boxShadow: activeTab === tab ? '0 8px 20px rgba(15, 23, 42, 0.2)' : 'none'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* 3. Tab Content: Personal */}
        {activeTab === 'personal' && (
          <motion.div key="personal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <SectionTitle title="Personal Info" sub="Update your identity details" />
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ 
                      padding: '8px 16px', borderRadius: 12, border: '1.5px solid #ebebeb',
                      background: isEditing ? '#fff1f1' : '#fff', color: isEditing ? '#ef4444' : '#1a1a2e',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer' 
                    }}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Full Name', key: 'fullName', icon: User },
                    { label: 'Job Title', key: 'jobTitle', icon: Briefcase },
                    { label: 'Department', key: 'department', icon: Building2 },
                    { label: 'Phone', key: 'phone', icon: Phone },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#b0b0c0', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>{field.label}</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          disabled={!isEditing}
                          value={(formData as any)[field.key]}
                          onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                          style={{
                            width: '100%', height: 48, padding: '0 40px 0 14px',
                            background: isEditing ? '#fff' : '#fcfcfc',
                            border: isEditing ? '1.5px solid #f5c842' : '1.5px solid #f0f0f0',
                            borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#1a1a2e'
                          }}
                        />
                        <field.icon size={16} color="#d0d0d8" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      width: '100%', height: 50, borderRadius: 14, background: '#1a1a2e', color: '#fff',
                      fontSize: 14, fontWeight: 800, cursor: 'pointer', border: 'none', marginTop: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                  </button>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* 4. Tab Content: Account */}
        {activeTab === 'account' && (
          <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card>
              <div style={{ padding: 24 }}>
                <SectionTitle title="Appearance" sub="Personalize your UI theme" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                   <div>
                     <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--app-text)' }}>Dark Mode</p>
                     <p style={{ fontSize: 11, color: 'var(--app-muted)' }}>Currently {theme === 'dark' ? 'enabled' : 'disabled'}</p>
                   </div>
                   <div 
                    onClick={onThemeToggle}
                    style={{ 
                      width: 44, height: 24, 
                      background: theme === 'dark' ? '#10B981' : '#E2E8F0', 
                      borderRadius: 20, position: 'relative', cursor: 'pointer',
                      transition: 'background 0.3s'
                    }}>
                      <motion.div 
                        animate={{ x: theme === 'dark' ? 22 : 2 }}
                        style={{ position: 'absolute', top: 3, width: 18, height: 18, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
                      />
                   </div>
                </div>

                <Separator />

                <SectionTitle title="Account Status" sub="Manage your visibility and data" />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                   <div>
                     <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Status</p>
                     <p style={{ fontSize: 11, color: '#9090a0' }}>Account is active and verified</p>
                   </div>
                   <span style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>ACTIVE</span>
                </div>
                
                <Separator />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                   <div>
                     <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Visibility</p>
                     <p style={{ fontSize: 11, color: '#9090a0' }}>Visible to IT Department</p>
                   </div>
                   <div style={{ width: 44, height: 24, background: '#1a1a2e', borderRadius: 20, position: 'relative', cursor: 'pointer' }}>
                      <div style={{ position: 'absolute', right: 3, top: 3, width: 18, height: 18, background: '#fff', borderRadius: '50%' }} />
                   </div>
                </div>

                <div style={{ marginTop: 24 }}>
                   <button style={{
                     width: '100%', height: 50, borderRadius: 14, background: '#fff', border: '1.5px solid #ebebeb',
                     color: '#1a1a2e', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                   }}>Export Activity History (PDF)</button>
                </div>
              </div>
            </Card>

            <Card className="mt-6" style={{ border: '1.5px solid #fee2e2' }}>
              <div style={{ padding: 24 }}>
                 <p style={{ fontSize: 14, fontWeight: 800, color: '#dc2626', marginBottom: 4 }}>Danger Zone</p>
                 <p style={{ fontSize: 12, color: '#994444', marginBottom: 20 }}>This action is permanent and cannot be undone.</p>
                 <button style={{
                   width: '100%', height: 50, borderRadius: 14, background: '#fef2f2', border: '1.5px solid #fecaca',
                   color: '#dc2626', fontSize: 13, fontWeight: 800, cursor: 'pointer'
                 }}>Delete Account</button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 5. Tab Content: Security */}
        {activeTab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card>
              <div style={{ padding: 24 }}>
                <SectionTitle title="Passcode" sub="Secure your system access" />
                <button style={{
                   width: '100%', height: 50, borderRadius: 14, background: '#fff', border: '1.5px solid #ebebeb',
                   color: '#1a1a2e', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                 }}>
                   <Lock size={16} /> Update Security Key
                 </button>
                 
                 <Separator />

                 <SectionTitle title="Active Sessions" sub="Terminals logged into your account" />
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {activeSessions.map((session, i) => (
                     <div key={i} style={{ 
                       padding: 16, borderRadius: 16, border: '1.5px solid #f8f8f8',
                       background: session.isCurrent ? '#f5f7ff' : '#fff'
                     }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                         <div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                             <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e' }}>{session.device}</p>
                             {session.isCurrent && <span style={{ fontSize: 9, fontWeight: 900, background: '#16a34a', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>CURRENT</span>}
                           </div>
                           <p style={{ fontSize: 11, color: '#9090a0', fontWeight: 600 }}>{session.browser} • {session.ip}</p>
                         </div>
                         {!session.isCurrent && (
                           <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Revoke</button>
                         )}
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                         <Globe size={12} color="#b0b0c0" />
                         <span style={{ fontSize: 11, color: '#7070a0', fontWeight: 600 }}>{session.location}</span>
                         <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#d0d0d8', margin: '0 4px' }} />
                         <span style={{ fontSize: 11, color: '#b0b0c0' }}>{session.lastUpdated}</span>
                       </div>
                     </div>
                   ))}
                 </div>

                 <button 
                  onClick={onLogout}
                  style={{
                   width: '100%', marginTop: 24, height: 50, borderRadius: 14, background: '#fff1f2', border: 'none',
                   color: '#e11d48', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                 }}>
                   <LogOut size={16} /> Terminate All Sessions
                 </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <p style={{ fontSize: 11, color: '#c0c0d8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>IT Activity Log System v1.2.0</p>
      </div>
    </div>
  );
}
