import React, { useState, useEffect } from 'react';
import { PageId } from '../types';
import { Emblem } from '../components/Emblem';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  RotateCw, 
  ArrowLeft, 
  ShieldCheck, 
  Clock,
  LogIn,
  UserPlus
} from 'lucide-react';
import { 
  loginStudentWithFirebase, 
  resetStudentPassword,
  sendStudentVerificationEmail,
  checkStudentEmailVerified 
} from '../services/firebaseService';
import { User as FirebaseUser } from 'firebase/auth';

interface LoginViewProps {
  onNavigate: (page: PageId, authMode?: 'choice' | 'login') => void;
  onLoginSuccess: () => void;
  initialMode?: 'choice' | 'login';
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  onNavigate, 
  onLoginSuccess,
  initialMode = 'choice'
}) => {
  const [mode, setMode] = useState<'choice' | 'login'>(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Keep mode in sync if initialMode changes externally
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Unverified user state
  const [unverifiedUser, setUnverifiedUser] = useState<FirebaseUser | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{ type: 'success' | 'warning' | 'error' | 'info'; text: string } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryId, setRecoveryId] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');

  // Resend cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setVerificationFeedback(null);

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Student ID or registered Email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your portal password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await loginStudentWithFirebase(identifier, password);
      setIsLoading(false);

      // MANDATORY CHECK: User must be verified
      if (!user.emailVerified) {
        // DO NOT allow access to the authenticated user area
        setUnverifiedUser(user);
        setVerificationFeedback({
          type: 'warning',
          text: 'Please verify your email address before continuing.',
        });
        return;
      }

      // User is verified: grant access
      onLoginSuccess();
      onNavigate('student-portal');
    } catch (error: any) {
      setIsLoading(false);
      const code = error?.code || '';
      if (
        code === 'auth/invalid-credential' || 
        code === 'auth/wrong-password' || 
        code === 'auth/user-not-found'
      ) {
        setErrorMsg('Invalid login credentials. Please verify your Student ID/Email and password.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid registered email address or student identifier.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg('Access temporarily disabled due to multiple failed login attempts. Please try again later.');
      } else {
        setErrorMsg(error?.message || 'Login failed. Please check your credentials and internet connection.');
      }
    }
  };

  // Handle Resend Verification Email for unverified user
  const handleResendVerification = async () => {
    if (!unverifiedUser || cooldownSeconds > 0 || isResending) return;
    setIsResending(true);
    setVerificationFeedback(null);

    try {
      await sendStudentVerificationEmail(unverifiedUser);
      setCooldownSeconds(60);
      setVerificationFeedback({
        type: 'info',
        text: `A fresh verification link has been sent to ${unverifiedUser.email || 'your email'}. Please check your inbox and spam folder.`,
      });
    } catch (err: any) {
      if (err?.code === 'auth/too-many-requests') {
        setCooldownSeconds(60);
        setVerificationFeedback({
          type: 'warning',
          text: 'A verification link was recently sent. Please wait a moment before requesting another.',
        });
      } else {
        setVerificationFeedback({
          type: 'error',
          text: err?.message || 'Could not dispatch verification email. Please try again.',
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  // Handle Check Verification Status for unverified user
  const handleCheckVerification = async () => {
    if (!unverifiedUser || isCheckingVerification) return;
    setIsCheckingVerification(true);
    setVerificationFeedback(null);

    try {
      const verified = await checkStudentEmailVerified(unverifiedUser);
      if (verified) {
        setVerificationFeedback({
          type: 'success',
          text: 'Email verified successfully! Access granted. Opening Student Portal...',
        });
        setTimeout(() => {
          onLoginSuccess();
          onNavigate('student-portal');
        }, 1200);
      } else {
        setVerificationFeedback({
          type: 'warning',
          text: 'Email is not verified yet. Please open the verification link in your email and try again.',
        });
      }
    } catch (err: any) {
      setVerificationFeedback({
        type: 'error',
        text: err?.message || 'Could not verify status. Please try again.',
      });
    } finally {
      setIsCheckingVerification(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryId.trim()) return;
    setRecoveryError('');
    try {
      await resetStudentPassword(recoveryId);
      setRecoverySuccess(true);
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        setRecoveryError('No student record found with this identifier.');
      } else {
        setRecoverySuccess(true); // Neutral message for security
      }
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* ============================================================== */}
        {/* 1. AUTHENTICATION ENTRY UI: CHOICE SCREEN (LOGIN or REGISTER)  */}
        {/* ============================================================== */}
        {mode === 'choice' && !unverifiedUser ? (
          <div className="bg-white border border-[#CBD5E1] rounded-xl p-6 sm:p-8 shadow-md">
            {/* Header */}
            <div className="text-center space-y-3 pb-6 border-b border-[#CBD5E1]">
              <Emblem size="lg" className="mx-auto" />
              <div>
                <div className="text-[11px] font-bold text-[#20216B] uppercase tracking-widest">
                  DAR - E - ARQAM SCHOOL SYSTEM
                </div>
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F1035] mt-1">
                  Student Portal
                </h1>
                <p className="text-xs sm:text-sm text-[#475569] mt-1 font-prose-serif">
                  Please choose an option to continue.
                </p>
              </div>
            </div>

            {/* TWO Clear Options: 1. LOGIN (Primary), 2. REGISTER (Second) */}
            <div className="mt-6 space-y-3.5">
              {/* Option 1: LOGIN (Primary) */}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-[#171852] to-[#20216B] hover:from-[#1A1C63] hover:to-[#292A86] text-white border-2 border-[#F5D900]/50 hover:border-[#FFF000] shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-[#FFF000]/15 text-[#FFF000] border border-[#FFF000]/40 flex items-center justify-center shrink-0 group-hover:bg-[#FFF000] group-hover:text-[#171852] transition-colors shadow-xs">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-editorial text-base sm:text-lg font-bold text-white group-hover:text-[#FFF000] transition-colors flex items-center gap-2">
                      <span>Login</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFF000]/20 text-[#FFF000] border border-[#FFF000]/40 uppercase tracking-wider font-bold">
                        Primary
                      </span>
                    </div>
                    <p className="text-xs text-[#EEF0FF]/85 mt-0.5 font-prose-serif">
                      For registered users who already have an account
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#FFF000] shrink-0 group-hover:translate-x-1 transition-transform ml-2" />
              </button>

              {/* Option 2: REGISTER (Second) */}
              <button
                type="button"
                onClick={() => onNavigate('student-register')}
                className="w-full p-4 rounded-xl bg-[#F8FAFC] hover:bg-[#EEF2F8] text-[#0F1035] border-2 border-[#CBD5E1] hover:border-[#20216B] shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-[#EEF0FF] text-[#20216B] border border-[#20216B]/20 flex items-center justify-center shrink-0 group-hover:bg-[#20216B] group-hover:text-[#FFF000] transition-colors shadow-xs">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-editorial text-base sm:text-lg font-bold text-[#0F1035] group-hover:text-[#20216B] transition-colors flex items-center gap-2">
                      <span>Register</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-[#334155] border border-slate-300 uppercase tracking-wider font-semibold">
                        New Account
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5 font-prose-serif">
                      For users who do not have an account yet
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#20216B] shrink-0 group-hover:translate-x-1 transition-transform ml-2" />
              </button>
            </div>

            {/* Quick Institutional Note */}
            <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-center gap-1.5 text-center text-[11px] text-[#64748B]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#20216B]" />
              <span>Authorized Institutional Portal · Official DARE ARQAM Access</span>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* 2. LOGIN VIEW (FOR USERS WHO ALREADY HAVE AN ACCOUNT)         */
          /* ============================================================== */
          <div className="bg-white border border-[#CBD5E1] rounded-xl p-6 sm:p-8 shadow-sm">
            {/* Header */}
            <div className="text-center space-y-2 pb-6 border-b border-[#CBD5E1]">
              <div className="flex items-center justify-between mb-1">
                <button
                  type="button"
                  onClick={() => setMode('choice')}
                  className="inline-flex items-center gap-1 text-xs text-[#20216B] hover:text-[#171852] font-semibold hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Options</span>
                </button>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#EEF0FF] text-[#20216B] rounded font-semibold">
                  Login Step
                </span>
              </div>
              <Emblem size="lg" className="mx-auto" />
              <div>
                <div className="text-[11px] font-bold text-[#20216B] uppercase tracking-widest">
                  DAR - E - ARQAM SCHOOL SYSTEM
                </div>
                <h1 className="font-editorial text-2xl font-bold text-[#0F1035] mt-0.5">
                  {unverifiedUser ? 'Verify Your Email' : 'Student Login'}
                </h1>
                <p className="text-xs text-[#475569] mt-1 font-prose-serif">
                  {unverifiedUser 
                    ? 'Official Verification Required Before Access' 
                    : 'Sign in to access your attendance, results, fees, and circulars'}
                </p>
              </div>
            </div>

            {/* Unverified User Screen / Banner */}
            {unverifiedUser ? (
              <div className="mt-6 space-y-5 text-center">
                {/* Mail Icon */}
                <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-7 h-7 text-amber-900" />
                </div>

                {/* Required Message */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#0F1035]">
                    Please verify your email address before continuing.
                  </div>
                  <p className="text-xs text-[#334155] font-prose-serif leading-relaxed">
                    We have sent a verification link to your email address. Please open your email and click the verification link to activate your account.
                  </p>
                  <div className="inline-block bg-[#F8FAFC] border border-[#CBD5E1] rounded-md px-3 py-1.5 text-xs font-mono text-[#20216B] font-semibold max-w-full break-all">
                    {unverifiedUser.email}
                  </div>
                </div>

                {/* Verification Feedback Banner */}
                {verificationFeedback && (
                  <div
                    className={`p-3 rounded-md text-xs text-left flex items-start gap-2 ${
                      verificationFeedback.type === 'success'
                        ? 'bg-[#EEF0FF] border border-[#292A86]/20 text-[#20216B]'
                        : verificationFeedback.type === 'warning'
                        ? 'bg-amber-50 border border-amber-200 text-amber-900'
                        : verificationFeedback.type === 'error'
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-[#EEF2F8] border border-[#94A3B8] text-[#0F1035]'
                    }`}
                  >
                    {verificationFeedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#292A86] shrink-0 mt-0.5" />}
                    {verificationFeedback.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />}
                    {verificationFeedback.type === 'error' && <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />}
                    {verificationFeedback.type === 'info' && <Clock className="w-4 h-4 text-[#1E293B] shrink-0 mt-0.5" />}
                    <span className="leading-snug">{verificationFeedback.text}</span>
                  </div>
                )}

                {/* Actions for Unverified User */}
                <div className="space-y-3 pt-1">
                  {/* 1. Check Verification Status */}
                  <button
                    type="button"
                    onClick={handleCheckVerification}
                    disabled={isCheckingVerification}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#20216B] hover:bg-[#292A86] disabled:opacity-60 rounded-md transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCw className={`w-4 h-4 ${isCheckingVerification ? 'animate-spin' : ''}`} />
                    <span>{isCheckingVerification ? 'Checking Status...' : 'Check Verification Status'}</span>
                  </button>

                  {/* 2. Resend Verification Email */}
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending || cooldownSeconds > 0}
                    className="w-full py-2.5 px-4 text-xs font-medium text-[#20216B] bg-[#EEF0FF] hover:bg-[#EEF0FF] border border-[#292A86]/30 disabled:opacity-60 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#20216B]" />
                    <span>
                      {cooldownSeconds > 0
                        ? `Resend available in ${cooldownSeconds}s`
                        : isResending
                        ? 'Sending Verification Link...'
                        : 'Resend Verification Email'}
                    </span>
                  </button>

                  {/* Return to Login Form */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUnverifiedUser(null);
                        setVerificationFeedback(null);
                      }}
                      className="text-xs text-[#334155] hover:text-[#0F1035] underline underline-offset-2 flex items-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Sign In with Another Account</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Error Banner */}
                {errorMsg && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Standard Login Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {/* Field 1: Email / Student ID */}
                  <div>
                    <label 
                      htmlFor="student-id" 
                      className="block text-xs font-semibold text-[#0F1035] uppercase tracking-wider mb-1.5"
                    >
                      Email / Student ID
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="student-id"
                        type="text"
                        placeholder="e.g. DA-2026-1001 or email@domain.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-[#94A3B8] rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-[#F8FAFC] text-[#0F1035]"
                        autoComplete="username"
                      />
                    </div>
                    <p className="text-[11px] text-[#475569] mt-1">
                      Enter your registered email address or assigned student identifier.
                    </p>
                  </div>

                  {/* Field 2: Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label 
                        htmlFor="password" 
                        className="block text-xs font-semibold text-[#0F1035] uppercase tracking-wider"
                      >
                        Password
                      </label>
                      {/* Forgot Password */}
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-[#20216B] hover:text-[#292A86] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your confidential password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm border border-[#94A3B8] rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-[#F8FAFC] text-[#0F1035]"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#334155] cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-[#20216B] hover:bg-[#292A86] focus:outline-hidden focus:ring-2 focus:ring-[#20216B] rounded-md transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {isLoading ? (
                        <span>Verifying Credentials...</span>
                      ) : (
                        <>
                          <span>Login</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Connected Link to Register: "Don't have an account? Register" */}
                <div className="mt-6 pt-4 border-t border-[#CBD5E1] text-center">
                  <div className="text-xs text-[#334155]">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('student-register')}
                      className="font-bold text-[#20216B] hover:text-[#171852] underline cursor-pointer"
                    >
                      Register
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Security Notice */}
        <div className="text-center text-[11px] text-[#475569] font-mono">
          Security Protocol: Authorized Institutional Access Only. Email verification mandatory.
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" 
            onClick={() => {
              setShowForgotModal(false);
              setRecoverySuccess(false);
              setRecoveryError('');
            }} 
          />
          <div className="relative z-10 w-full max-w-sm bg-white border border-[#94A3B8] rounded-lg p-6 shadow-xl space-y-4">
            <h3 className="font-editorial text-lg font-bold text-[#0F1035]">
              Password Recovery Procedure
            </h3>
            {recoverySuccess ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#EEF0FF] border border-[#292A86]/20 rounded-md text-xs text-[#20216B] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#292A86] shrink-0 mt-0.5" />
                  <span>
                    A secure password reset email has been dispatched to {recoveryId}. Please follow the link provided in the message.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setRecoverySuccess(false);
                    setRecoveryError('');
                  }}
                  className="w-full py-2 text-xs font-semibold bg-[#20216B] text-white rounded-md hover:bg-[#292A86]"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-[#334155] leading-relaxed">
                  Enter your registered institutional Email or Student ID. We will transmit a cryptographically signed password reset link.
                </p>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="student@domain.com or ID"
                    value={recoveryId}
                    onChange={(e) => setRecoveryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                  />
                  {recoveryError && (
                    <p className="text-[11px] text-red-600 mt-1">{recoveryError}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setRecoveryError('');
                    }}
                    className="px-3 py-1.5 text-xs text-[#334155] hover:bg-[#EEF2F8] rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-[#20216B] text-white rounded-md hover:bg-[#292A86]"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
