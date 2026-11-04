import React, { useState } from 'react';
import {
  Eye, EyeOff, Mail, Lock, CheckCircle2,
  Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

// Arah editorial yang sama dengan Beranda: latar kertas datar, satu aksen,
// tanpa gradasi, glow, orbs, atau lencana pil. Logika masuk tidak berubah.
const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: 'var(--app-muted)',
  textTransform: 'uppercase', letterSpacing: '0.07em'
};

const inputStyle: React.CSSProperties = {
  width: '100%', height: 50, padding: '0 16px 0 42px',
  background: 'var(--app-bg)', border: '1px solid var(--app-border)',
  borderRadius: 10, fontSize: 16, fontWeight: 500, color: 'var(--app-text)',
  outline: 'none', transition: 'border-color 0.2s'
};

const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = 'var(--accent)'; };
const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = 'var(--app-border)'; };

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

  const cardStyle: React.CSSProperties = {
    background: 'var(--app-card)',
    borderRadius: 16, padding: '34px 26px',
    border: '1px solid var(--app-border)'
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'var(--app-bg)',
      padding: 'calc(20px + env(safe-area-inset-top, 0px)) 24px calc(20px + env(safe-area-inset-bottom, 0px))',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <AnimatePresence mode="wait">
            {resetSent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ ...cardStyle, textAlign: 'center' }}
              >
                <div style={{
                  color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <CheckCircle2 size={40} />
                </div>
                <h2 style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 600, color: 'var(--app-text)', marginBottom: 10 }}>Check your Inbox</h2>
                <p style={{ fontSize: 13.5, color: 'var(--app-muted)', lineHeight: 1.6, marginBottom: 26 }}>
                  We've sent a secure recovery link to your registered email address.
                </p>
                <button
                  onClick={() => { setResetSent(false); setIsResetMode(false); }}
                  style={{
                    width: '100%', height: 50, borderRadius: 10, border: 'none',
                    background: 'var(--app-text)', color: 'var(--app-bg)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Return to Login
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={isResetMode ? 'reset' : 'login'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={cardStyle}
              >
                <div style={{ marginBottom: 30 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
                    <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src="https://it.gesit.co.id/image/logo.png"
                        alt="Logo"
                        style={{ width: 'auto', height: 46, objectFit: 'contain' }}
                      />
                    </div>
                    <div>
                      <h1 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: 'var(--app-text)', letterSpacing: '-0.4px' }}>
                        {isResetMode ? 'Account Recovery' : 'Activity Log IT'}
                      </h1>
                      <p style={{ fontSize: 13, color: 'var(--app-muted)', fontWeight: 500, marginTop: 5 }}>
                        {isResetMode ? 'Enter your email to reset password' : 'Sign in to access your activity log'}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{
                      border: '1px solid color-mix(in srgb, var(--destructive) 45%, transparent)', borderRadius: 10,
                      padding: '12px 14px', display: 'flex', gap: 10, marginBottom: 22
                    }}
                  >
                    <AlertCircle size={16} color="var(--destructive)" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 12.5, color: 'var(--destructive)', fontWeight: 600, lineHeight: 1.4 }}>{error}</p>
                  </motion.div>
                )}

                <form onSubmit={isResetMode ? handleResetPassword : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label htmlFor="login-identifier" style={labelStyle}>
                      Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="var(--app-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        id="login-identifier"
                        type="text"
                        placeholder="email or username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        onFocus={focusBorder}
                        onBlur={blurBorder}
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {!isResetMode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label htmlFor="login-password" style={labelStyle}>
                        Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={16} color="var(--app-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={focusBorder}
                          onBlur={blurBorder}
                          required
                          style={{ ...inputStyle, padding: '0 42px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          style={{
                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', padding: 4
                          }}
                        >
                          {showPassword ? <EyeOff size={18} color="var(--app-muted)" /> : <Eye size={18} color="var(--app-muted)" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={isLoading}
                    style={{
                      width: '100%', height: 52, borderRadius: 10, border: 'none',
                      background: 'var(--accent)', color: 'var(--accent-foreground)',
                      fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 10, marginTop: 8
                    }}
                  >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : (isResetMode ? 'Send Reset Link' : 'Sign In')}
                  </button>
                </form>

                {!isResetMode && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '22px 0' }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--app-border)' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--app-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Or continue with</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--app-border)' }} />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      style={{
                        width: '100%', height: 52, borderRadius: 10,
                        background: 'var(--app-card)', border: '1px solid var(--app-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 12, cursor: 'pointer', transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--app-border)'; }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--app-text)' }}>Google</span>
                    </motion.button>
                  </>
                )}

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <button
                    onClick={() => setIsResetMode(!isResetMode)}
                    style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: 'var(--accent)', cursor: 'pointer' }}
                  >
                    {isResetMode ? 'Back to sign in' : 'Forgot password?'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <p style={{ fontSize: 10, color: 'var(--app-muted)', fontWeight: 500, lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
              © 2026 The Gesit Companies. GESIT PORTAL™.<br />All rights reserved.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
