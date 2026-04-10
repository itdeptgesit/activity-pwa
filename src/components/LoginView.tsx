import React, { useState } from 'react';
import {
  Eye, EyeOff, Mail, Lock, CheckCircle2,
  Loader2, Globe, AlertCircle, ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let finalEmail = identifier.trim();

      // Username detection logic from user snippet
      if (!finalEmail.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('user_accounts')
          .select('email')
          .eq('username', finalEmail.toLowerCase())
          .maybeSingle();

        if (userError) throw new Error(`Directory error: ${userError.message}`);
        if (!userData) throw new Error("Identity not recognized.");
        finalEmail = userData.email;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password: password,
      });

      if (authError) throw authError;
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(identifier, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || "Could not send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Could not initiate Google login.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: '#F8FAFC', padding: '24px', position: 'relative',
      overflow: 'hidden', fontFamily: "'Poppins', sans-serif"
    }}>
      {/* ── SOFT AMBIENT ORBS ── */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-10%', right: '-5%', width: '60%', height: '60%',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none'
        }}
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          y: [0, -30, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: '-15%', left: '-5%', width: '50%', height: '50%',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none'
        }}
      />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <AnimatePresence mode="wait">
            {resetSent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(24px)',
                  borderRadius: 32, padding: '40px 28px',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: 24, background: '#ECFDF5',
                  color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <CheckCircle2 size={36} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>Check your Inbox</h2>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 28 }}>
                  We've sent a secure recovery link to your registered email address.
                </p>
                <button
                  onClick={() => { setResetSent(false); setIsResetMode(false); }}
                  style={{
                    width: '100%', height: 52, borderRadius: 16, border: 'none',
                    background: '#1a1a2e', color: '#fff', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', boxShadow: '0 10px 25px rgba(26,26,46,0.15)'
                  }}
                >
                  Return to Login
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={isResetMode ? 'reset' : 'login'}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(32px)',
                  WebkitBackdropFilter: 'blur(32px)',
                  borderRadius: 32, padding: '40px 28px',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 30px 60px -12px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
                    <img
                      src="https://it.gesit.co.id/image/logo.png"
                      alt="Logo"
                      style={{ width: 'auto', height: 48, objectFit: 'contain' }}
                      onError={(e) => { e.currentTarget.src = ''; /* Fallback logic if needed */ }}
                    />
                    <div>
                      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
                        {isResetMode ? 'Account Recovery' : 'Activity Log IT'}
                      </h1>
                      <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 4 }}>
                        {isResetMode ? 'Enter your email to reset password' : 'Sign in to access your activity log'}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 14,
                      padding: '12px 14px', display: 'flex', gap: 10, marginBottom: 24
                    }}
                  >
                    <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: '#991B1B', fontWeight: 500, lineHeight: 1.4 }}>{error}</p>
                  </motion.div>
                )}

                <form onSubmit={isResetMode ? handleResetPassword : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: 4 }}>
                      Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="#CBD5E1" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        placeholder="email or username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        style={{
                          width: '100%', height: 48, padding: '0 16px 0 42px',
                          background: '#fff', border: '1.5px solid #F1F5F9',
                          borderRadius: 14, fontSize: 14, fontWeight: 500, color: '#1a1a2e', outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.05)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#F1F5F9'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  {!isResetMode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: 4 }}>
                        Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={16} color="#CBD5E1" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          style={{
                            width: '100%', height: 48, padding: '0 42px',
                            background: '#fff', border: '1.5px solid #F1F5F9',
                            borderRadius: 14, fontSize: 14, fontWeight: 500, color: '#1a1a2e', outline: 'none',
                            transition: 'all 0.2s'
                          }}
                          onFocus={(e) => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.05)'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#F1F5F9'; e.target.style.boxShadow = 'none'; }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', padding: 4
                          }}
                        >
                          {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={isLoading}
                    style={{
                      width: '100%', height: 52, borderRadius: 16, border: 'none',
                      background: '#1a1a2e', color: '#fff', fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 10, marginTop: 8, boxShadow: '0 12px 25px -4px rgba(26,26,46,0.2)'
                    }}
                  >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : (isResetMode ? 'Send Reset Link' : 'Sign In')}
                    {!isLoading && <ChevronRight size={18} />}
                  </button>
                </form>

                {!isResetMode && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0' }}>
                      <div style={{ flex: 1, height: 1.5, background: '#F1F5F9' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Or continue with</span>
                      <div style={{ flex: 1, height: 1.5, background: '#F1F5F9' }} />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      style={{
                        width: '100%', height: 52, borderRadius: 16, 
                        background: '#fff', border: '1.5px solid #F1F5F9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 12, cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#F1F5F9'; }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>Google</span>
                    </motion.button>
                  </>
                )}

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <button
                    onClick={() => setIsResetMode(!isResetMode)}
                    style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#6366F1', cursor: 'pointer' }}
                  >
                    {isResetMode ? 'Back to sign in' : 'Forgot password?'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ textAlign: 'center', marginTop: 32 }}
          >
            <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500, lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
              © 2026 The Gesit Companies. GESIT PORTAL™.<br />All rights reserved.
            </p>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
