import React, { useState } from 'react';
import { PageId } from '../types';
import { Emblem } from '../components/Emblem';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  KeyRound, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import { verifyAdminLogin } from '../services/adminService';

interface AdminLoginViewProps {
  onNavigate: (page: PageId) => void;
  onLoginSuccess: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your Directorate Administrator Email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your Administrator password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyAdminLogin(email, password);
      setIsLoading(false);

      if (result.success) {
        onLoginSuccess();
        onNavigate('admin-dashboard');
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Authentication error. Please verify your connection.');
    }
  };

  const handleFillDemoCreds = () => {
    setEmail('Darearqam@mardan.com');
    setPassword('Hasnainqadir8696');
    setErrorMsg('');
    setAutoFilled(true);
    setTimeout(() => setAutoFilled(false), 2500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 bg-stone-900 text-stone-100">
      <div className="w-full max-w-md space-y-6">
        {/* Directorate Card Container */}
        <div className="bg-stone-950 border-2 border-emerald-700/60 rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Institutional Top Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-emerald-600 via-amber-500 to-emerald-700" />

          {/* Header */}
          <div className="text-center space-y-3 pb-6 border-b border-stone-800">
            <Emblem size="lg" className="mx-auto ring-4 ring-emerald-950/80 shadow-md" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>DIRECTORATE ADMINISTRATION</span>
              </div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Executive Admin Login
              </h1>
              <p className="text-xs text-stone-400 mt-1 font-prose-serif">
                Central Institutional Directorate Management Console
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-lg text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label 
                htmlFor="admin-email" 
                className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5"
              >
                Admin Email / Gmail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="Darearqam@mardan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-stone-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-stone-900 text-white placeholder-stone-600 font-mono"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="admin-password" 
                  className="block text-xs font-semibold text-stone-300 uppercase tracking-wider"
                >
                  Admin Password
                </label>
                <span className="text-[11px] font-mono text-emerald-400">Secure Access</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-stone-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-stone-900 text-white placeholder-stone-600"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Fill Credentials Shortcut for convenience */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleFillDemoCreds}
                className="text-[11px] text-amber-400/90 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer font-mono"
              >
                <Sparkles className="w-3 h-3" />
                <span>Fill Designated Admin Credentials</span>
              </button>
              {autoFilled && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> Filled
                </span>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 rounded-lg transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Authenticating Directorate...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Login to Admin Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick return back to school public site */}
          <div className="mt-6 pt-4 border-t border-stone-800 text-center">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-xs text-stone-400 hover:text-white flex items-center gap-1.5 mx-auto transition-colors cursor-pointer py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public School Website</span>
            </button>
          </div>
        </div>

        {/* Security watermark */}
        <div className="text-center text-[11px] text-stone-500 font-mono">
          DIRECTORATE CENTRAL REPOSITORY · RESTRICTED EXECUTIVE ACCESS ONLY
        </div>
      </div>
    </div>
  );
};
