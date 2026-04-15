import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Shield, Key, Save,
  LogOut, Lock, Building2, Loader2, CheckCircle2,
  Briefcase, ShieldCheck, Globe, Camera, Edit3, X,
  Calendar, Trash2, Bell, Settings, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAccount, UserSession, Activity } from '../types';
import { supabase } from '../lib/supabase';
import { uploadToCloudinary } from '../lib/cloudinary';

interface ProfileViewProps {
  onLogout: () => void;
  user: UserAccount | null;
  onUpdateSuccess?: () => void;
  onUpdateUser?: (data: Partial<UserAccount>) => Promise<void>;
  activities: Activity[];
  theme: 'light' | 'dark';
  onThemeToggle: (e?: React.MouseEvent) => void;
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
      <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--app-text)', marginBottom: 6, letterSpacing: '-0.4px' }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--app-muted)', fontWeight: 500 }}>{sub}</p>
    </div>
  );
}

function Separator() {
  return <div style={{ height: 1, background: '#f0f0ea', margin: '24px 0' }} />;
}

// ── MAIN VIEW ────────────────────────────────────────────────────────

export default function ProfileView({ onLogout, user, onUpdateSuccess, onUpdateUser, activities, theme, onThemeToggle }: ProfileViewProps) {
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
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [profileTagline, setProfileTagline] = useState(() => localStorage.getItem('profile-tagline') || 'Always ready to solve your next issue.');
  const [profileStyle, setProfileStyle] = useState<'indigo' | 'emerald' | 'sunset'>(() => {
    const saved = localStorage.getItem('profile-style');
    return (saved as 'indigo' | 'emerald' | 'sunset') || 'indigo';
  });
  const [avatarShape, setAvatarShape] = useState<'rounded' | 'circle'>(() => {
    const saved = localStorage.getItem('profile-avatar-shape');
    return (saved as 'rounded' | 'circle') || 'rounded';
  });


  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styleTokens: Record<'indigo' | 'emerald' | 'sunset', { gradient: string; glow: string; buttonBorder: string }> = {
    indigo: {
      gradient: 'linear-gradient(165deg, #4F46E5, #1E1B4B)',
      glow: '0 20px 40px rgba(79, 70, 229, 0.18)',
      buttonBorder: '#1E1B4B'
    },
    emerald: {
      gradient: 'linear-gradient(165deg, #059669, #064E3B)',
      glow: '0 20px 40px rgba(5, 150, 105, 0.18)',
      buttonBorder: '#064E3B'
    },
    sunset: {
      gradient: 'linear-gradient(165deg, #EA580C, #9A3412)',
      glow: '0 20px 40px rgba(234, 88, 12, 0.2)',
      buttonBorder: '#9A3412'
    }
  };

  const activeStyle = styleTokens[profileStyle];
  const avatarRadius = avatarShape === 'circle' ? 999 : 32;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAvatarUploading(true);
      
      // Local preview immediately for better UX
      const localReader = new FileReader();
      localReader.onloadend = () => {
        setAvatarUrl(localReader.result as string);
      };
      localReader.readAsDataURL(file);

      try {
        const uploadedUrl = await uploadToCloudinary(file);
        setAvatarUrl(uploadedUrl);
        
        // Auto-save the new avatar URL to profile
        if (onUpdateUser) {
          await onUpdateUser({ avatarUrl: uploadedUrl });
          if (onUpdateSuccess) onUpdateSuccess();
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Gagal mengupload foto. Silakan coba lagi.');
        // Revert to original user avatar if upload failed
        setAvatarUrl(user?.avatarUrl || '');
      } finally {
        setIsAvatarUploading(false);
        setIsAvatarModalOpen(false);
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Detect Current Session Metadata
  useEffect(() => {
    const detectSession = async () => {
      const ua = navigator.userAgent;
      let device = ua.includes("Windows") ? "PC" : ua.includes("iPhone") ? "iPhone" : "Mobile";
      let browser = ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : "Safari";
      
      const currentSession: UserSession = {
        device, browser, ip: '10.10.2.45',
        lastUpdated: new Date().toLocaleString(),
        sessionToken: 'current-token',
        isCurrent: true,
        location: 'Jakarta, ID'
      };
      setActiveSessions([currentSession]);
    };
    detectSession();
  }, []);

  useEffect(() => {
    localStorage.setItem('profile-tagline', profileTagline);
  }, [profileTagline]);

  useEffect(() => {
    localStorage.setItem('profile-style', profileStyle);
  }, [profileStyle]);

  useEffect(() => {
    localStorage.setItem('profile-avatar-shape', avatarShape);
  }, [avatarShape]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onUpdateUser) {
        await onUpdateUser({
          ...formData,
          avatarUrl: avatarUrl
        });
      }
      
      setTimeout(() => {
        setIsSaving(false);
        setIsEditing(false);
        if (onUpdateSuccess) onUpdateSuccess();
      }, 500);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setIsSaving(false);
    }
  };

  const stats = [
    { label: 'Logs', value: activities.length, color: '#1a1a2e' },
    { label: 'Progress', value: `${Math.round((activities.filter(a => a.status === 'Completed').length / (activities.length || 1)) * 100)}%`, color: '#16a34a' },
    { label: 'Rank', value: 'Lead', color: '#f5c842' },
  ];

  return (
    <div style={{ padding: 'calc(110px + env(safe-area-inset-top, 0px)) 20px 100px', background: 'transparent' }}>
      
      {/* ── STICKY HEADER ── */}
      <div style={{ 
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 100,
        background: 'var(--app-header-bg)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        padding: 'calc(12px + env(safe-area-inset-top, 0px)) 24px 16px',
        borderBottom: '1px solid var(--app-border)'
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.5px' }}>Profile Settings</h1>
      </div>

      {/* 1. Header Identity Card (Bento Hero) */}
      <div style={{ 
        background: activeStyle.gradient, borderRadius: 32, 
        padding: '40px 24px', textAlign: 'center', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
        boxShadow: activeStyle.glow,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.15, color: '#fff' }}>
          <Shield size={160} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 24px' }}>
            <div style={{ 
              width: '100%', height: '100%', borderRadius: avatarRadius,
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 800, color: '#1E1B4B',
              border: '4px solid rgba(255,255,255,0.2)', boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}>
              {avatarUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={avatarUrl} 
                    style={{ 
                      width: '100%', height: '100%', objectFit: 'cover',
                      filter: isAvatarUploading ? 'blur(4px) grayscale(0.5)' : 'none',
                      transition: 'filter 0.3s ease'
                    }} 
                  />
                  {isAvatarUploading && (
                    <div style={{ 
                      position: 'absolute', inset: 0, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(255,255,255,0.2)'
                    }}>
                      <Loader2 size={32} className="animate-spin" color="var(--accent)" />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isAvatarUploading ? (
                    <Loader2 size={32} className="animate-spin" color="var(--accent)" />
                  ) : (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {formData.fullName ? formData.fullName[0].toUpperCase() : 'R'}
                    </motion.span>
                  )}
                </div>
              )}
            </div>
            
            <div style={{ position: 'absolute', bottom: -10, right: -10 }}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsAvatarModalOpen(true)}
                style={{
                  width: 38, height: 38, borderRadius: 14, background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)', cursor: 'pointer', border: `3.5px solid ${activeStyle.buttonBorder}`,
                  color: '#fff'
                }}
              >
                <Camera size={16} />
              </motion.button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }} 
            />
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: '-0.7px' }}>{formData.fullName}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
             <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{formData.jobTitle}</span>
             <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
             <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: 20, letterSpacing: '0.05em' }}>
               {user?.role ? user.role.toUpperCase() : 'LEAD IT'}
             </span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginTop: -14, marginBottom: 20, maxWidth: 280, marginInline: 'auto', lineHeight: 1.45 }}>
            "{profileTagline}"
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginTop: 3, letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Custom Tabs */}
      <div style={{ 
        background: 'var(--app-card)', padding: '8px', borderRadius: 24, marginBottom: 24,
        display: 'flex', gap: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        border: '1.5px solid var(--app-border)'
      }}>
        {['personal', 'account', 'security'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 16, border: 'none',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--app-muted)',
              transform: activeTab === tab ? 'scale(1.02)' : 'scale(1)',
              boxShadow: activeTab === tab ? '0 10px 20px rgba(99, 102, 241, 0.2)' : 'none'
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
                  <SectionTitle title="Personal Info" sub="Update identity" />
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ 
                      padding: '8px 16px', borderRadius: 12, border: '1.5px solid var(--app-border)',
                      background: isEditing ? 'rgba(239, 68, 68, 0.1)' : 'var(--app-bg)', color: isEditing ? '#ef4444' : 'var(--app-text)',
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
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--app-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>{field.label}</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          disabled={!isEditing}
                          value={(formData as any)[field.key]}
                          onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                          style={{
                            width: '100%', height: 48, padding: '0 40px 0 14px',
                            background: isEditing ? 'var(--app-bg)' : 'transparent',
                            border: isEditing ? '1.5px solid #f5c842' : '1.5px solid var(--app-border)',
                            borderRadius: 14, fontSize: 14, fontWeight: 600, color: 'var(--app-text)'
                          }}
                        />
                        <field.icon size={16} color="var(--app-muted)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      width: '100%', height: 50, borderRadius: 14, background: 'var(--app-text)', color: 'var(--app-bg)',
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
                <SectionTitle title="Appearance" sub="Personalize UI" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                   <div>
                     <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--app-text)' }}>Dark Mode</p>
                     <p style={{ fontSize: 11, color: 'var(--app-muted)', fontWeight: 600 }}>Currently {theme === 'dark' ? 'enabled' : 'disabled'}</p>
                   </div>
                   <div 
                    onClick={(e) => onThemeToggle(e)}
                    style={{ 
                      width: 48, height: 26, 
                      background: theme === 'dark' ? 'var(--accent)' : 'var(--app-border)', 
                      borderRadius: 20, position: 'relative', cursor: 'pointer',
                      transition: 'background 0.3s'
                    }}>
                      <motion.div 
                        animate={{ x: theme === 'dark' ? 24 : 2 }}
                        style={{ position: 'absolute', top: 3, width: 20, height: 20, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
                      />
                   </div>
                </div>

                <Separator />

                <SectionTitle title="Profile Style" sub="Customize profile look" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--app-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Card Theme</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {(['indigo', 'emerald', 'sunset'] as const).map((styleName) => (
                        <button
                          key={styleName}
                          onClick={() => setProfileStyle(styleName)}
                          style={{
                            flex: 1,
                            height: 40,
                            borderRadius: 12,
                            border: profileStyle === styleName ? '2px solid var(--accent)' : '1px solid var(--app-border)',
                            background: styleTokens[styleName].gradient,
                            cursor: 'pointer',
                            opacity: profileStyle === styleName ? 1 : 0.75
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--app-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Avatar Shape</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {(['rounded', 'circle'] as const).map((shape) => (
                        <button
                          key={shape}
                          onClick={() => setAvatarShape(shape)}
                          style={{
                            flex: 1,
                            height: 42,
                            borderRadius: 12,
                            border: avatarShape === shape ? '1.5px solid var(--accent)' : '1.5px solid var(--app-border)',
                            background: 'var(--app-bg)',
                            color: avatarShape === shape ? 'var(--app-text)' : 'var(--app-muted)',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {shape}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--app-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Profile Tagline</p>
                    <input
                      value={profileTagline}
                      onChange={(e) => setProfileTagline(e.target.value.slice(0, 72))}
                      placeholder="Write your personal profile tagline..."
                      style={{
                        width: '100%',
                        height: 46,
                        borderRadius: 12,
                        border: '1.5px solid var(--app-border)',
                        background: 'var(--app-bg)',
                        color: 'var(--app-text)',
                        fontSize: 13,
                        fontWeight: 600,
                        padding: '0 12px'
                      }}
                    />
                    <p style={{ fontSize: 10, color: 'var(--app-muted)', marginTop: 6, fontWeight: 600 }}>
                      {profileTagline.length}/72 characters
                    </p>
                  </div>
                </div>

                <Separator />

                <SectionTitle title="System Status" sub="Account and connectivity" />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                   <div>
                     <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--app-text)' }}>Account</p>
                     <p style={{ fontSize: 11, color: 'var(--app-muted)', fontWeight: 600 }}>Operational & Verified</p>
                   </div>
                   <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '4px 12px', borderRadius: 8, fontSize: 10, fontWeight: 900 }}>ACTIVE</span>
                </div>
                
                <div style={{ marginTop: 24 }}>
                   <button style={{
                     width: '100%', height: 50, borderRadius: 14, background: 'transparent', border: '1.5px solid var(--app-border)',
                     color: 'var(--app-text)', fontSize: 13, fontWeight: 800, cursor: 'pointer'
                   }}>Export Identity Data</button>
                </div>
              </div>
            </Card>

            <Card className="mt-6" style={{ border: '1.5px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ padding: 24 }}>
                 <p style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', marginBottom: 4 }}>Danger Zone</p>
                 <p style={{ fontSize: 12, color: 'var(--app-muted)', marginBottom: 20, fontWeight: 600 }}>Permanent account termination.</p>
                 <button style={{
                   width: '100%', height: 50, borderRadius: 14, background: 'rgba(239, 68, 68, 0.05)', border: '1.5px solid rgba(239, 68, 68, 0.1)',
                   color: '#ef4444', fontSize: 13, fontWeight: 800, cursor: 'pointer'
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
                <SectionTitle title="Authentication" sub="Manage security keys" />
                <button style={{
                   width: '100%', height: 50, borderRadius: 14, background: 'var(--app-bg)', border: '1.5px solid var(--app-border)',
                   color: 'var(--app-text)', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                 }}>
                   <Lock size={16} /> Update Passcode
                 </button>
                 
                 <Separator />

                 <SectionTitle title="Active Sessions" sub="Current system access" />
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {activeSessions.map((session, i) => (
                     <div key={i} style={{ 
                       padding: 16, borderRadius: 18, border: '1.5px solid var(--app-border)',
                       background: session.isCurrent ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                     }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                         <div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                             <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--app-text)' }}>{session.device}</p>
                             {session.isCurrent && <span style={{ fontSize: 9, fontWeight: 900, background: '#10B981', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>CURRENT</span>}
                           </div>
                           <p style={{ fontSize: 11, color: 'var(--app-muted)', fontWeight: 700 }}>{session.browser} • {session.ip}</p>
                         </div>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                         <Globe size={12} color="var(--app-muted)" />
                         <span style={{ fontSize: 11, color: 'var(--app-muted)', fontWeight: 700 }}>{session.location}</span>
                         <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--app-border)', margin: '0 4px' }} />
                         <span style={{ fontSize: 10, color: 'var(--app-muted)', fontWeight: 600 }}>{session.lastUpdated}</span>
                       </div>
                     </div>
                   ))}
                 </div>

                 <button 
                  onClick={onLogout}
                  style={{
                   width: '100%', marginTop: 24, height: 50, borderRadius: 14, background: 'rgba(239, 68, 68, 0.05)', border: 'none',
                   color: '#ef4444', fontSize: 13, fontWeight: 900, cursor: 'pointer',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                 }}>
                   <LogOut size={16} /> Terminate All Sessions
                 </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ textAlign: 'center', marginTop: 40, opacity: 0.5 }}>
        <p style={{ fontSize: 10, color: 'var(--app-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>IT Log v1.2.0 • TCT Group</p>
      </div>

      {/* ── AVATAR EDIT MODAL ── */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAvatarModalOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)'
              }}
            />
            <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, pointerEvents: 'none', padding: 20 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{
                  width: '100%', maxWidth: 360, background: 'var(--app-card)', 
                  borderRadius: 32, padding: '32px 24px', pointerEvents: 'auto',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.4)', border: '1px solid var(--app-border)',
                  textAlign: 'center'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -10 }}>
                  <button onClick={() => setIsAvatarModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ 
                  width: 140, height: 140, borderRadius: 48, 
                  background: '#fff', margin: '0 auto 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 48, fontWeight: 900, color: '#1E1B4B',
                  border: '6px solid rgba(255,255,255,0.1)', boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                  overflow: 'hidden', position: 'relative'
                }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} style={{ 
                      width: '100%', height: '100%', objectFit: 'cover',
                      filter: isAvatarUploading ? 'blur(10px)' : 'none'
                    }} />
                  ) : (
                    <span>{formData.fullName ? formData.fullName[0].toUpperCase() : 'R'}</span>
                  )}
                  
                  {isAvatarUploading && (
                    <div style={{ 
                      position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                       <div style={{ 
                         width: 60, height: 60, borderRadius: '50%', 
                         border: '4px solid var(--accent)', borderTopColor: 'transparent',
                         animation: 'spin 1s linear infinite'
                       }} />
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--app-text)', marginBottom: 8, letterSpacing: '-0.3px' }}>Profile Photo</h3>
                <p style={{ fontSize: 13, color: 'var(--app-muted)', marginBottom: 32, fontWeight: 600 }}>Update or remove your identification photo.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    disabled={isAvatarUploading}
                    onClick={() => { fileInputRef.current?.click(); }}
                    style={{
                      height: 54, borderRadius: 16, background: 'var(--accent)', color: '#fff',
                      border: 'none', fontSize: 14, fontWeight: 800, cursor: isAvatarUploading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      boxShadow: '0 8px 20px rgba(99, 102, 241, 0.2)',
                      opacity: isAvatarUploading ? 0.7 : 1
                    }}
                  >
                    {isAvatarUploading ? <Loader2 size={18} className="animate-spin" /> : <Edit3 size={18} />}
                    {isAvatarUploading ? 'Uploading...' : 'Upload New Photo'}
                  </motion.button>

                  {avatarUrl && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { handleRemoveAvatar(); setIsAvatarModalOpen(false); }}
                      style={{
                        height: 54, borderRadius: 16, background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444',
                        border: '1.5px solid rgba(239, 68, 68, 0.1)', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                      }}
                    >
                      <Trash2 size={18} /> Remove Current Photo
                    </motion.button>
                  )}

                  <button 
                    onClick={() => setIsAvatarModalOpen(false)}
                    style={{
                      marginTop: 8, padding: '12px', background: 'transparent', border: 'none',
                      color: 'var(--app-muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
