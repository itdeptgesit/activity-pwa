import React, { useState, useEffect } from 'react';
import { Home, BarChart2, ClipboardList, User, Plus, Loader2, AlertCircle, TrendingUp, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, DashboardStats, UserAccount } from './types';
import Dashboard from './components/Dashboard';
import ActivityList from './components/ActivityList';
import ActivityForm from './components/ActivityForm';
import { supabase } from './lib/supabase';
import ProfileView from './components/ProfileView';
import LoginView from './components/LoginView';
import SummaryView from './components/SummaryView';
import ActivityDetailView from './components/ActivityDetailView';
import { LogFilter } from './components/ActivityList';

const TABS = [
  { id: 'home' as const,    icon: Home,          label: 'Home' },
  { id: 'summary' as const, icon: BarChart2,     label: 'Summary' },
  { id: 'plus' as const,    icon: Plus,          label: '' }, // Centered FAB
  { id: 'journey' as const, icon: ClipboardList, label: 'Log' },
  { id: 'profile' as const, icon: User,          label: 'Profile' },
];

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dbUsers, setDbUsers] = useState<{name: string, department: string}[]>([]);
  const [dbDepartments, setDbDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'summary' | 'journey' | 'profile'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [viewingActivityDetail, setViewingActivityDetail] = useState<Activity | null>(null);
  const [activeLogFilter, setActiveLogFilter] = useState<LogFilter>('All');
  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
 
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  
  // Offline & Sync States (Moved to top to fix Hooks violation)
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<any[]>(() => JSON.parse(localStorage.getItem('sync-queue') || '[]'));

  useEffect(() => {
    if (session?.user?.email) {
      fetchCurrentUser(session.user.email);
    } else {
      setCurrentUser(null);
    }
  }, [session]);

  // Network & Sync Persistence Hooks
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (navigator.onLine) processSyncQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sync-queue', JSON.stringify(syncQueue));
  }, [syncQueue]);

  const fetchCurrentUser = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (data) {
        setCurrentUser({
          id: data.id.toString(),
          email: data.email,
          fullName: data.full_name || email,
          phone: data.phone || '',
          address: data.address || '',
          company: data.company || '',
          department: data.department || '',
          jobTitle: data.job_title || '',
          avatarUrl: data.avatar_url || '',
          role: data.role || 'User',
          createdAt: data.created_at || new Date().toISOString()
        });
      } else {
        // Fallback if not found in table but logged in via auth
        setCurrentUser({
          id: 'user-unknown',
          email: email,
          fullName: email.split('@')[0],
          role: 'User',
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('Error fetching current user:', e);
    }
  };

  const currentUserName = currentUser?.fullName || '';
  const userRole = currentUser?.role?.toLowerCase() || 'user';
  
  const canDelete = userRole === 'admin';
  const canEdit = userRole === 'admin' || userRole === 'user';

  useEffect(() => {
    // 1. Initial Auth Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // 2. Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchActivities();
    fetchPhoneExtensions();

    // 3. Activity Changes
    const sub = supabase
      .channel('activity_logs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, payload => {
        if (payload.eventType === 'INSERT')
          setActivities(p => [payload.new as Activity, ...p]);
        else if (payload.eventType === 'UPDATE')
          setActivities(p => p.map(a => a.id === payload.new.id ? payload.new as Activity : a));
        else if (payload.eventType === 'DELETE')
          setActivities(p => p.filter(a => a.id !== payload.old.id));
      })
      .subscribe();

    return () => { 
      subscription.unsubscribe();
      supabase.removeChannel(sub); 
    };
  }, []);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: '#fcfcf8' }}>
        <Loader2 size={32} className="animate-spin" color="#f5c842" />
      </div>
    );
  }

  if (!session) {
    return <LoginView onLoginSuccess={() => {}} />;
  }

  async function fetchActivities() {
    if (!navigator.onLine) {
      const cached = localStorage.getItem('cached-activities');
      if (cached) setActivities(JSON.parse(cached));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('activity_logs').select('*').order('id', { ascending: false });
      if (error) throw error;
      setActivities(data || []);
      localStorage.setItem('cached-activities', JSON.stringify(data || []));
    } catch (e) {
      console.error(e);
      const cached = localStorage.getItem('cached-activities');
      if (cached) setActivities(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  }

  async function fetchPhoneExtensions() {
    try {
      const { data, error } = await supabase.from('phone_extensions').select('name, dept');
      if (error) throw error;
      if (data) {
        const mappedUsers = data.map(u => ({ name: u.name, department: u.dept }));
        const uniqueDepts = Array.from(new Set(data.map(u => u.dept))).sort();
        setDbUsers(mappedUsers);
        setDbDepartments(uniqueDepts);
      }
    } catch (e) {
      console.error('Error fetching phone extensions:', e);
    }
  }

  const stats: DashboardStats = {
    total: activities.length,
    completed: activities.filter(a => a.status === 'Completed').length,
    inProgress: activities.filter(a => a.status === 'In Progress').length,
    highAlert: activities.filter(a => a.status === 'High Alert' || a.type === 'Critical').length,
  };

  const handleSave = async (data: Partial<Activity>) => {
    const now = new Date().toISOString();
    
    // Optimistic Update
    if (editingActivity) {
      const updated = { ...editingActivity, ...data, updated_at: now };
      setActivities(prev => prev.map(a => a.id === editingActivity.id ? updated : a));
      
      if (!isOnline) {
        setSyncQueue(prev => [...prev, { type: 'UPDATE', id: editingActivity.id, data: { ...data, updated_at: now } }]);
        setIsFormOpen(false);
        setEditingActivity(null);
        return;
      }
    } else {
      const tempId = Math.floor(Math.random() * -1000000); // Temporary ID for UI
      const newActivity = { ...data, id: tempId, created_at: now, updated_at: now } as Activity;
      setActivities(prev => [newActivity, ...prev]);

      if (!isOnline) {
        setSyncQueue(prev => [...prev, { type: 'INSERT', data: { ...data, created_at: now, updated_at: now } }]);
        setIsFormOpen(false);
        return;
      }
    }

    try {
      if (editingActivity) {
        await supabase.from('activity_logs').update({ 
          ...data, 
          updated_at: now, 
          completed_at: data.status === 'Completed' ? now : null 
        }).eq('id', editingActivity.id);
      } else {
        await supabase.from('activity_logs').insert([{ 
          ...data, 
          created_at: now, 
          updated_at: now,
          completed_at: data.status === 'Completed' ? now : null 
        }]);
      }
      await fetchActivities();
      setIsFormOpen(false);
      setEditingActivity(null);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setIsFormOpen(true);
  };

  const requestDelete = (id: number) => setDeleteConfirmId(id);

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    // Optimistic Delete
    setActivities(prev => prev.filter(a => a.id !== deleteConfirmId));

    if (!isOnline) {
      setSyncQueue(prev => [...prev, { type: 'DELETE', id: deleteConfirmId }]);
      setDeleteConfirmId(null);
      return;
    }

    try {
      await supabase.from('activity_logs').delete().eq('id', deleteConfirmId);
      await fetchActivities();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // ── SYNC QUEUE PROCESSING ──
  async function processSyncQueue() {
    if (syncQueue.length === 0) return;
    
    const queue = [...syncQueue];
    setSyncQueue([]); // Optimistically clear

    for (const item of queue) {
      try {
        if (item.type === 'INSERT') {
          await supabase.from('activity_logs').insert([item.data]);
        } else if (item.type === 'UPDATE') {
          await supabase.from('activity_logs').update(item.data).eq('id', item.id);
        } else if (item.type === 'DELETE') {
          await supabase.from('activity_logs').delete().eq('id', item.id);
        }
      } catch (e) {
        console.error('Failed to sync item:', item, e);
        // Put back in queue if it's a network error
        setSyncQueue(prev => [...prev, item]);
      }
    }
    fetchActivities();
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateUser = async (data: Partial<UserAccount>) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('user_accounts')
        .update({
          full_name: data.fullName,
          phone: data.phone,
          address: data.address,
          company: data.company,
          department: data.department,
          job_title: data.jobTitle,
          avatar_url: data.avatarUrl,
        })
        .eq('email', currentUser.email);

      if (error) throw error;
      
      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    } catch (e) {
      console.error('Error updating user:', e);
      throw e;
    }
  };

  const handleNavigateWithFilter = (tab: 'journey', filter: LogFilter) => {
    setActiveLogFilter(filter);
    setActiveTab(tab);
  };

  const handleThemeToggle = (e?: React.MouseEvent) => {
    if (!document.startViewTransition || !e) {
      setTheme(t => t === 'light' ? 'dark' : 'light');
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    
    document.documentElement.style.setProperty('--reveal-x', `${x}px`);
    document.documentElement.style.setProperty('--reveal-y', `${y}px`);

    document.startViewTransition(() => {
      setTheme(t => t === 'light' ? 'dark' : 'light');
    });
  };

  const filtered = activities.filter(a =>
    a.activity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const HomeSkeleton = () => (
    <div style={{ padding: '24px 24px 100px' }}>
      <div className="skeleton-shimmer" style={{ height: 88, borderRadius: 24, marginBottom: 16, border: '1px solid var(--app-border)' }} />
      <div className="skeleton-shimmer" style={{ height: 170, borderRadius: 24, marginBottom: 14, border: '1px solid var(--app-border)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <div className="skeleton-shimmer" style={{ height: 150, borderRadius: 24, border: '1px solid var(--app-border)' }} />
        <div className="skeleton-shimmer" style={{ height: 150, borderRadius: 24, border: '1px solid var(--app-border)' }} />
      </div>
      <div className="skeleton-shimmer" style={{ height: 130, borderRadius: 24, marginBottom: 12, border: '1px solid var(--app-border)' }} />
      <div className="skeleton-shimmer" style={{ height: 130, borderRadius: 24, marginBottom: 12, border: '1px solid var(--app-border)' }} />
    </div>
  );

  return (
    <div style={{ 
      background: 'var(--app-bg)', color: 'var(--app-text)',
      minHeight: '100dvh', maxWidth: 480, margin: '0 auto', position: 'relative',
      width: '100%',
      transition: 'background 0.3s, color 0.3s'
    }}>

      {/* ── MAIN ── */}
      <main style={{ paddingBottom: 'calc(118px + env(safe-area-inset-bottom, 0px))' }}>
        {loading && activities.length === 0 ? (
          activeTab === 'home' ? (
            <HomeSkeleton />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(245,200,66,0.3)', borderTopColor: '#f5c842', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 13, color: '#a0a0b0', fontWeight: 600 }}>Loading...</p>
            </div>
          )
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Dashboard 
                  user={currentUser} 
                  stats={stats} 
                  recentActivities={activities} 
                  onViewAll={() => setActiveTab('journey')} 
                  onAddNew={() => setIsFormOpen(true)}
                  onViewActivity={(a) => setViewingActivityDetail(a)}
                  onNavigateWithFilter={handleNavigateWithFilter}
                  theme={theme}
                  onThemeToggle={handleThemeToggle}
                />
              </motion.div>
            )}
            {activeTab === 'summary' && (
              <motion.div key="summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <SummaryView activities={activities} stats={stats} />
              </motion.div>
            )}
            {activeTab === 'journey' && (
              <motion.div key="journey" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <ActivityList 
                  activities={filtered} 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onEdit={handleEdit}
                  onDelete={requestDelete}
                  onViewDetail={(a) => setViewingActivityDetail(a)}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  activeFilter={activeLogFilter}
                  onFilterChange={setActiveLogFilter}
                  theme={theme}
                />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {currentUser ? (
                  <ProfileView 
                    user={currentUser} 
                    onLogout={handleLogout} 
                    onUpdateUser={handleUpdateUser}
                    activities={activities} 
                    theme={theme}
                    onThemeToggle={handleThemeToggle}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                    <Loader2 size={32} className="animate-spin" color="#f5c842" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* ── NAVIGATION (High-End Pro) ── */}
      <nav style={{
        position: 'fixed', bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)', maxWidth: 456, height: 74,
        background: theme === 'dark'
          ? 'linear-gradient(180deg, rgba(30, 30, 36, 0.78), rgba(10, 10, 14, 0.7))'
          : 'linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.68))',
        backdropFilter: 'blur(30px) saturate(150%)',
        WebkitBackdropFilter: 'blur(30px) saturate(150%)',
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.68)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 10px', zIndex: 100,
        borderRadius: 22,
        boxShadow: theme === 'dark'
          ? '0 12px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)'
          : '0 10px 26px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.9)'
      }}>
        {/* Connection Status Indicator */}
        {!isOnline && (
          <div style={{ 
            position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)',
            background: '#F87171', color: '#fff', fontSize: 9, fontWeight: 900,
            padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 12px rgba(248, 113, 113, 0.3)'
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
            OFFLINE MODE
          </div>
        )}

        {TABS.map((tab) => {
          if (tab.id === 'plus') {
            if (!canEdit) return null;
            return (
              <motion.button 
                key={tab.id} 
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsFormOpen(true)} 
                style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: theme === 'dark' ? '#4F46E5' : '#0F172A',
                  color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: theme === 'dark' ? '0 8px 18px rgba(79, 70, 229, 0.35)' : '0 8px 18px rgba(15,23,42,0.25)',
                  cursor: 'pointer', position: 'relative'
                }}
              >
                <tab.icon size={22} strokeWidth={2.6} />
              </motion.button>
            );
          }
          const isActive = activeTab === tab.id;
          return (
            <motion.button 
              key={tab.id} 
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)} 
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: 16, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6, cursor: 'pointer', flex: 1, height: '100%', justifyContent: 'center',
                position: 'relative', paddingBottom: 2, margin: '0 4px',
                transition: 'all 0.2s ease',
                minWidth: 44,
                minHeight: 44
              }}
            >
              <motion.div
                animate={{ 
                  y: isActive ? -4 : 0,
                  opacity: isActive ? 1 : 0.35
                }}
              >
                <tab.icon size={23} strokeWidth={isActive ? 2.5 : 2} color={isActive ? (theme === 'dark' ? '#6366F1' : '#1a1a1a') : (theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#94a3b8')} />
              </motion.div>
              
            </motion.button>
          );
        })}
      </nav>


      {/* ── MODALS ── */}
      <ActivityForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingActivity(null); }}
        onSave={handleSave}
        initialData={editingActivity}
        currentUserName={currentUserName}
        users={dbUsers}
        departments={dbDepartments}
      />

      <ActivityDetailView
        activity={viewingActivityDetail}
        onClose={() => setViewingActivityDetail(null)}
        onEdit={handleEdit}
        onDelete={requestDelete}
      />

      {/* Shadcn-inspired Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              onClick={() => setDeleteConfirmId(null)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)'
              }}
            />
            {/* Dialog Wrapper */}
            <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2001, pointerEvents: 'none' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                  width: '90%', maxWidth: 360, background: '#fff', pointerEvents: 'auto',
                  borderRadius: 24, padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}
              >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', color: '#ef4444', marginBottom: 16 }}>
                <AlertCircle size={24} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>Hapus Aktivitas?</h2>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 24 }}>
                Apakah kamu yakin ingin menghapus data log ini? Aksi ini tidak dapat dibatalkan.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >Batal</button>
                <button
                  onClick={confirmDelete}
                  style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >Ya, Hapus</button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
