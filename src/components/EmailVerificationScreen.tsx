import React, { useState, useEffect } from 'react';
import { Emblem } from './Emblem';
import { 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageId } from '../types';

interface EmailVerificationScreenProps {
  email: string;
  studentId?: string;
  onVerified: () => void;
  onReturnToRegister?: () => void;
  onNavigate?: (page: PageId) => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email,
  studentId,
  onVerified,
  onReturnToRegister,
  onNavigate,
}) => {
  const { reloadUser, sendVerificationEmail, checkVerificationStatus, logout, currentUser } = useAuth();

  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'warning' | 'error'; text: string } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Active user's displayed email
  const displayEmail = email || currentUser?.email || 'your registered email';

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Periodic automatic check in background every 5 seconds
  useEffect(() => {
    if (isVerified) return;

    const checkInterval = setInterval(async () => {
      try {
        const verified = await checkVerificationStatus();
        if (verified) {
          setIsVerified(true);
          setStatusMessage({
            type: 'success',
            text: 'Your email has been verified successfully! Access granted.',
          });
          setTimeout(() => {
            onVerified();
          }, 1500);
        }
      } catch (err) {
        // Silently ignore background check errors
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [checkVerificationStatus, isVerified, onVerified]);

  // Handle "Check Verification Status"
  const handleCheckStatus = async () => {
    setIsChecking(true);
    setStatusMessage(null);
    try {
      const verified = await checkVerificationStatus();
      if (verified) {
        setIsVerified(true);
        setStatusMessage({
          type: 'success',
          text: 'Email verified successfully! Activating your student portal access...',
        });
        setTimeout(() => {
          onVerified();
        }, 1200);
      } else {
        setStatusMessage({
          type: 'warning',
          text: 'Email is not verified yet. Please check your inbox and spam folder, click the verification link, then click this button again.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Could not verify status. Please check your internet connection and try again.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Handle "Resend Verification Email"
  const handleResend = async () => {
    if (cooldownSeconds > 0 || isResending) return;
    setIsResending(true);
    setStatusMessage(null);

    try {
      await sendVerificationEmail();
      setCooldownSeconds(60);
      setStatusMessage({
        type: 'info',
        text: `A fresh verification link has been sent to ${displayEmail}. Please check your inbox and spam folder.`,
      });
    } catch (err: any) {
      if (err?.code === 'auth/too-many-requests') {
        setCooldownSeconds(60);
        setStatusMessage({
          type: 'warning',
          text: 'A verification link was recently sent. Please check your inbox and spam folder or wait before requesting another.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'Failed to resend verification email. Please try again in a few moments.',
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  // Handle "Change Email / Return to Registration"
  const handleReturnToRegister = async () => {
    try {
      await logout();
    } catch (e) {
      // Continue anyway
    }
    if (onReturnToRegister) {
      onReturnToRegister();
    } else if (onNavigate) {
      onNavigate('student-register');
    }
  };

  if (isVerified) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white border-2 border-emerald-600 rounded-lg p-6 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <span className="text-xs font-mono text-emerald-800 uppercase tracking-widest block font-bold">
              VERIFICATION COMPLETE
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Email Verified Successfully
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 font-prose-serif max-w-md mx-auto">
              Your institutional credentials have been verified by Firebase Authentication. Your student portal and academic dossier are now fully unlocked.
            </p>
          </div>

          {studentId && (
            <div className="bg-stone-50 border border-stone-200 rounded-md p-4 max-w-sm mx-auto">
              <div className="text-xs text-stone-500 font-medium">Assigned Student ID:</div>
              <div className="font-mono text-xl font-bold text-emerald-950 mt-1 tracking-wider">
                {studentId}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onVerified}
              className="w-full sm:w-auto px-8 py-3 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-md transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <span>Continue to Student Portal</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 sm:py-16">
      <div className="bg-white border border-stone-300 rounded-lg p-6 sm:p-10 shadow-sm text-center space-y-6">
        {/* Emblem & Institutional Header */}
        <div className="space-y-3">
          <Emblem size="lg" className="mx-auto" />
          <div>
            <span className="text-[11px] font-mono text-emerald-800 uppercase tracking-widest block font-bold">
              OFFICIAL VERIFICATION REQUIRED
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Verify Your Email
            </h1>
          </div>
        </div>

        {/* Mail Icon with animated ring */}
        <div className="relative w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-2xs">
          <Mail className="w-8 h-8 text-emerald-900" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 text-white text-[9px] font-bold items-center justify-center">1</span>
          </span>
        </div>

        {/* Official Required Instructions */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-stone-700 font-prose-serif leading-relaxed max-w-md mx-auto">
            We have sent a verification link to your email address. Please open your email and click the verification link to activate your account.
          </p>

          <div className="inline-block bg-stone-50 border border-stone-200 rounded-md px-4 py-2 text-xs font-mono text-emerald-950 font-semibold max-w-full break-all">
            {displayEmail}
          </div>

          {studentId && (
            <div className="text-[11px] text-stone-500 font-mono">
              Institutional Student ID: <span className="font-bold text-stone-800">{studentId}</span>
            </div>
          )}
        </div>

        {/* Status Message Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-md text-xs text-left flex items-start gap-2.5 transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : statusMessage.type === 'warning'
                ? 'bg-amber-50 border border-amber-200 text-amber-900'
                : statusMessage.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-stone-100 border border-stone-300 text-stone-800'
            }`}
          >
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />}
            {statusMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />}
            {statusMessage.type === 'info' && <Clock className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />}
            <span className="leading-snug">{statusMessage.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          {/* 1. Check Verification Status (Primary Action) */}
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full py-3 px-6 text-xs sm:text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-900/60 rounded-md transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking Status with Firebase...' : 'Check Verification Status'}</span>
          </button>

          {/* 2. Resend Verification Email (Secondary Action with cooldown) */}
          <button
            onClick={handleResend}
            disabled={isResending || cooldownSeconds > 0}
            className="w-full py-2.5 px-6 text-xs font-medium text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
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

          {/* 3. Change Email / Return to Registration */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReturnToRegister}
              className="text-xs text-stone-600 hover:text-stone-900 underline underline-offset-2 flex items-center gap-1.5 cursor-pointer py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Email / Return to Registration</span>
            </button>

            {onNavigate && (
              <>
                <span className="hidden sm:inline text-stone-300">•</span>
                <button
                  onClick={() => onNavigate('student-login')}
                  className="text-xs text-emerald-900 hover:text-emerald-700 underline underline-offset-2 cursor-pointer py-1"
                >
                  Return to Student Login
                </button>
              </>
            )}
          </div>
        </div>

        {/* Security & Support Note */}
        <div className="border-t border-stone-200 pt-4 mt-6 text-[11px] text-stone-500 font-prose-serif space-y-1 text-left">
          <div className="flex items-center gap-1.5 font-sans font-semibold text-stone-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span>Institutional Security Policy:</span>
          </div>
          <p>
            • Unverified accounts are strictly restricted from viewing student academic dossiers, attendance sheets, and report cards.
          </p>
          <p>
            • If you do not see the email within 2 minutes, check your <strong>Spam / Junk folder</strong> or click <strong>Resend Verification Email</strong> above.
          </p>
        </div>
      </div>
    </div>
  );
};
