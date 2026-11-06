import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Mail, 
  User as UserIcon, 
  KeyRound, 
  Sparkles, 
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

type AuthMode = 'login' | 'register' | 'otp' | 'forgot' | 'reset';

export const AuthPage: React.FC = () => {
  const { login, register, verifyOtp, resendOtp, forgotPassword, resetPassword, demoLogin, isLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check URL query parameters for reset password link (?token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setMode('reset');
      setStatusMessage({
        type: 'success',
        text: 'Reset token verified. Please enter your new password below.',
      });
    }
  }, []);

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setStatusMessage(null);
    try {
      await login({ email, password });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Invalid credentials. Please verify your email and password.';
      setStatusMessage({
        type: 'error',
        text: msg,
      });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return;
    setStatusMessage(null);
    try {
      await register({ username, email, password });
      setStatusMessage({
        type: 'success',
        text: 'Account created! Enter the 6-digit OTP code sent to your email.',
      });
      setResendCooldown(60);
      setMode('otp');
    } catch (err: any) {
      const msg = 
        err?.response?.data?.message || 
        err?.response?.data?.error || 
        (err?.message && !err?.response 
          ? 'Cannot connect to backend server. Make sure it is running on port 8080' 
          : 'Registration failed. User may already exist with this email.');
      
      setStatusMessage({
        type: 'error',
        text: msg,
      });
      // Do NOT setMode('otp') on failure!
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setStatusMessage(null);
    try {
      await verifyOtp({ email, otp });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid or expired OTP code. Please try again.';
      setStatusMessage({
        type: 'error',
        text: msg,
      });
    }
  };

  const handleResendOtp = async () => {
    if (!email || resendCooldown > 0) return;
    try {
      await resendOtp(email);
      setResendCooldown(60);
      setStatusMessage({
        type: 'success',
        text: 'A new 6-digit verification code has been dispatched to your email.',
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to resend code. Please try again.';
      setStatusMessage({
        type: 'error',
        text: msg,
      });
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatusMessage(null);
    try {
      await forgotPassword(email);
      setStatusMessage({
        type: 'success',
        text: `Password reset link sent to ${email}! Please check your email inbox.`,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to send reset link. User not found.';
      setStatusMessage({
        type: 'error',
        text: msg,
      });
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Passwords do not match.',
      });
      return;
    }
    if (newPassword.length < 8) {
      setStatusMessage({
        type: 'error',
        text: 'Password must be at least 8 characters long.',
      });
      return;
    }

    setStatusMessage(null);
    try {
      await resetPassword({
        token: resetToken,
        password: newPassword,
        confirmPassword,
      });
      setStatusMessage({
        type: 'success',
        text: 'Password updated successfully! You can now log in with your new password.',
      });
      // Clean query parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setMode('login');
      setPassword(newPassword);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Invalid or expired reset token. Please request a new link.';
      setStatusMessage({
        type: 'error',
        text: msg,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Column: Brand Hero Presentation */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-blue-600/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-indigo-600/30 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-xl shadow-blue-500/30 text-white">
            <HardDrive className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-200 via-white to-indigo-200 bg-clip-text text-transparent">
              FileVault Cloud
            </h1>
            <p className="text-xs text-blue-200/70">Next-Gen Enterprise File Management</p>
          </div>
        </div>

        {/* Center Presentation Message */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
            <Sparkles className="size-3.5 text-amber-300" />
            <span>Encrypted • Fast • Scalable Cloud Storage</span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Store, collaborate and access your files from anywhere with speed.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Engineered with modern shadcn/ui components, real-time collaboration, bank-grade encryption and responsive file preview capabilities.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
              <ShieldCheck className="size-5 text-blue-400" />
              <h4 className="font-semibold text-sm">256-bit Security</h4>
              <p className="text-xs text-slate-400">Zero-knowledge end-to-end data safety</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
              <Zap className="size-5 text-indigo-400" />
              <h4 className="font-semibold text-sm">Lightning Fast</h4>
              <p className="text-xs text-slate-400">Instant multi-part streaming uploads</p>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial / Footnote */}
        <div className="relative z-10 text-xs text-slate-400 border-t border-white/10 pt-6 flex items-center justify-between">
          <span>© 2026 FileVault System • Designed for scale</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Services operational
          </span>
        </div>
      </div>

      {/* Right Column: Auth Form Card */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
              <HardDrive className="size-5" />
            </div>
            <span className="font-bold text-lg">FileVault</span>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Create your account'}
              {mode === 'otp' && 'Verify your email'}
              {mode === 'forgot' && 'Reset your password'}
              {mode === 'reset' && 'Create new password'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {mode === 'login' && 'Enter your credentials to access your secure storage.'}
              {mode === 'register' && 'Get started with 100 GB free encrypted cloud storage.'}
              {mode === 'otp' && `We sent a 6-digit confirmation code to ${email || 'your email'}.`}
              {mode === 'forgot' && 'Enter your registered email address to receive password reset instructions.'}
              {mode === 'reset' && 'Please choose a strong password for your account (minimum 8 characters).'}
            </p>
          </div>

          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-in fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="size-4 shrink-0 text-rose-500" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Mode: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusMessage(null);
                      setMode('forgot');
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign in to FileVault'
                )}
              </Button>
            </form>
          )}

          {/* Mode: Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Full Name / Username
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Password (min 8 chars)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create Free Account'
                )}
              </Button>
            </form>
          )}

          {/* Mode: OTP Verification */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    6-Digit OTP Code
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Sent to: <span className="font-semibold text-foreground">{email}</span>
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    autoFocus
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="pl-9 h-12 rounded-xl text-center text-xl font-mono tracking-[0.5em] font-bold"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full h-11 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md shadow-blue-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={handleResendOtp}
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    resendCooldown > 0
                      ? 'text-muted-foreground cursor-not-allowed'
                      : 'text-blue-600 hover:underline'
                  }`}
                >
                  <RefreshCw className={`size-3 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend OTP Code'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusMessage(null);
                    setMode('login');
                  }}
                  className="text-muted-foreground hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Mode: Forgot Password */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-11 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStatusMessage(null);
                    setMode('login');
                  }}
                  className="text-xs text-muted-foreground hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="size-3" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* Mode: Reset Password (via URL Token) */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  New Password (minimum 8 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className="w-full h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  'Reset & Save Password'
                )}
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStatusMessage(null);
                    setMode('login');
                  }}
                  className="text-xs text-muted-foreground hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="size-3" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* Bottom Switcher */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setStatusMessage(null);
                    setMode('register');
                  }}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : mode === 'register' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setStatusMessage(null);
                    setMode('login');
                  }}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
