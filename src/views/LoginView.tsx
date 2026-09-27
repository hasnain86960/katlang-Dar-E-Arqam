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
  Clock 
} from 'lucide-react';
import { 
  loginStudentWithFirebase, 
  resetStudentPassword,
  sendStudentVerificationEmail,
  checkStudentEmailVerified 
} from '../services/firebaseService';
import { User as FirebaseUser } from 'firebase/auth';

interface LoginViewProps {
  onNavigate: (page: PageId) => void;
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
        {/* Institutional Card Container */}
        <div className="bg-white border border-stone-300 rounded-lg p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="text-center space-y-3 pb-6 border-b border-stone-200">
            <Emblem size="lg" className="mx-auto" />
            <div>
              <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-widest">
                DARE ARQAM SCHOOL SYSTEM
              </div>
              <h1 className="font-editorial text-2xl font-bold text-stone-900 mt-0.5">
                {unverifiedUser ? 'Verify Your Email' : 'Student Login'}
              </h1>
              <p className="text-xs text-stone-500 mt-1 font-prose-serif">
                {unverifiedUser 
                  ? 'Official Verification Required Before Access' 
                  : 'Official Access Portal for Enrolled Students & Guardians'}
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
                <div className="text-sm font-semibold text-stone-900">
                  Please verify your email address before continuing.
                </div>
                <p className="text-xs text-stone-600 font-prose-serif leading-relaxed">
                  We have sent a verification link to your email address. Please open your email and click the verification link to activate your account.
                </p>
                <div className="inline-block bg-stone-50 border border-stone-200 rounded-md px-3 py-1.5 text-xs font-mono text-emerald-950 font-semibold max-w-full break-all">
                  {unverifiedUser.email}
                </div>
              </div>

              {/* Verification Feedback Banner */}
              {verificationFeedback && (
                <div
                  className={`p-3 rounded-md text-xs text-left flex items-start gap-2 ${
                    verificationFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : verificationFeedback.type === 'warning'
                      ? 'bg-amber-50 border border-amber-200 text-amber-900'
                      : verificationFeedback.type === 'error'
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-stone-100 border border-stone-300 text-stone-800'
                  }`}
                >
                  {verificationFeedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />}
                  {verificationFeedback.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />}
                  {verificationFeedback.type === 'error' && <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />}
                  {verificationFeedback.type === 'info' && <Clock className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />}
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
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 disabled:opacity-60 rounded-md transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCw className={`w-4 h-4 ${isCheckingVerification ? 'animate-spin' : ''}`} />
                  <span>{isCheckingVerification ? 'Checking Status...' : 'Check Verification Status'}</span>
                </button>

                {/* 2. Resend Verification Email */}
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending || cooldownSeconds > 0}
                  className="w-full py-2.5 px-4 text-xs font-medium text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-800" />
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
                    className="text-xs text-stone-600 hover:text-stone-900 underline underline-offset-2 flex items-center gap-1.5 mx-auto cursor-pointer"
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
                <div>
                  <label 
                    htmlFor="student-id" 
                    className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5"
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
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-emerald-700 bg-stone-50 text-stone-900"
                      autoComplete="username"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Enter your registered email address or assigned student identifier.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label 
                      htmlFor="password" 
                      className="block text-xs font-semibold text-stone-800 uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-emerald-900 hover:text-emerald-700 hover:underline cursor-pointer"
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
                      className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm border border-stone-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-emerald-700 bg-stone-50 text-stone-900"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 rounded-md transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
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

              {/* Secondary Action: Create Account */}
              <div className="mt-6 pt-4 border-t border-stone-200 text-center">
                <div className="text-xs text-stone-600 mb-2">
                  New student seeking enrollment or fresh portal account?
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('student-register')}
                  className="w-full py-2 px-4 text-xs font-semibold text-emerald-950 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-md transition-colors cursor-pointer"
                >
                  Create Account / Register Student
                </button>
              </div>
            </>
          )}
        </div>

        {/* Security Notice */}
        <div className="text-center text-[11px] text-stone-500 font-mono">
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
          <div className="relative z-10 w-full max-w-sm bg-white border border-stone-300 rounded-lg p-6 shadow-xl space-y-4">
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              Password Recovery Procedure
            </h3>
            {recoverySuccess ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
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
                  className="w-full py-2 text-xs font-semibold bg-emerald-900 text-white rounded-md hover:bg-emerald-800"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed font-prose-serif">
                  Enter your registered Email or assigned Student ID. A secure Firebase password reset email will be generated.
                </p>
                {recoveryError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {recoveryError}
                  </div>
                )}
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Enter Email or Student ID"
                    value={recoveryId}
                    onChange={(e) => setRecoveryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-stone-50"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setRecoveryError('');
                    }}
                    className="px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-emerald-900 text-white rounded-md hover:bg-emerald-800"
                  >
                    Send Reset Link
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

