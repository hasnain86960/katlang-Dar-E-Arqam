import React from 'react';
import { PageId } from '../types';
import { Menu, Phone, Calendar, User, Search } from 'lucide-react';
import { Emblem } from './Emblem';
import { INSTITUTION_INFO } from '../data/mockData';
import { useBranding } from '../context/BrandingContext';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onOpenMenu,
}) => {
  const { institutionName, tagline } = useBranding();
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      {/* Top Institutional Trust Bar (Desktop & Tablet) */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 sm:px-6 hidden sm:block border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-medium text-emerald-200">
              Government Recognized Secondary & Higher Secondary Institution
            </span>
            <span className="text-emerald-500">|</span>
            <span className="text-emerald-300 font-mono text-[11px]">
              Affiliation: BISE Verified
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-200">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Helpline: {INSTITUTION_INFO.phone}</span>
            </span>
            <span className="text-emerald-600">|</span>
            <button
              onClick={() => onNavigate('results')}
              className="text-emerald-200 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              Verify Results
            </button>
            <span className="text-emerald-600">|</span>
            <button
              onClick={() => onNavigate('student-login')}
              className="font-medium text-emerald-100 hover:text-white flex items-center gap-1"
            >
              <User className="w-3 h-3 text-emerald-400" />
              Student Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Left: Emblem + Institution Name + Subtitle */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 sm:gap-4 text-left group focus:outline-hidden focus:ring-2 focus:ring-emerald-700 rounded-md p-0.5"
          aria-label="Go to DARE ARQAM Home"
        >
          <Emblem size="md" className="group-hover:scale-[1.02] transition-transform" />
          
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 group-hover:text-emerald-800 transition-colors">
                {institutionName}
              </span>
              <span className="hidden md:inline-block text-[11px] font-mono text-stone-500">
                (EST. 1998)
              </span>
            </div>
            <span className="text-xs sm:text-[13px] text-stone-600 font-medium tracking-normal">
              {tagline}
            </span>
          </div>
        </button>

        {/* Right: Clean Official Controls & Hamburger Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick action for desktop: Results check & Admissions */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => onNavigate('apply-admission')}
              className="px-3.5 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors"
            >
              Admissions 2026–27
            </button>
            <button
              onClick={() => onNavigate('notices')}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-emerald-900 hover:bg-stone-100 rounded-md transition-colors"
            >
              Notices
            </button>
          </div>

          {/* Primary Hamburger Trigger (Required for all major navigation) */}
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-950 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-emerald-700 transition-colors cursor-pointer"
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
          >
            <Menu className="w-5 h-5 text-emerald-900" />
            <span className="hidden sm:inline font-medium">Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
