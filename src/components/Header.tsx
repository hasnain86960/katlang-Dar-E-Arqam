import React from 'react';
import { PageId } from '../types';
import { Menu, Phone, User, Award, Bell } from 'lucide-react';
import { Emblem } from './Emblem';
import { INSTITUTION_INFO } from '../data/mockData';
import { useBranding } from '../context/BrandingContext';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenMenu,
}) => {
  const { institutionName, tagline } = useBranding();

  return (
    <header className="sticky top-0 z-40 bg-[#171852] border-b border-[#292A86] shadow-lg">
      {/* Top Institutional Trust Bar (Desktop & Tablet) */}
      <div className="bg-[#10113D] text-[#EEF0FF] text-xs py-1.5 px-4 sm:px-6 hidden sm:block border-b border-[#292A86]/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-medium text-white/90">
              Government Recognized Secondary & Higher Secondary Institution
            </span>
            <span className="text-[#F5D900]/60">|</span>
            <span className="text-[#FFF000] font-mono text-[11px] font-bold">
              Affiliation: BISE Verified
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-white/90">
              <Phone className="w-3 h-3 text-[#FFF000]" />
              <span>Helpline: {INSTITUTION_INFO.phone}</span>
            </span>
            <span className="text-[#292A86]">|</span>
            <button
              onClick={() => onNavigate('results')}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                currentPage === 'results' ? 'text-[#FFF000] font-bold' : 'text-white/80 hover:text-[#FFF000]'
              }`}
            >
              <Award className="w-3 h-3 text-[#FFF000]" />
              Verify Results
            </button>
            <span className="text-[#292A86]">|</span>
            <button
              onClick={() => onNavigate('student-login')}
              className={`font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                currentPage === 'student-login' || currentPage === 'student-portal'
                  ? 'text-[#FFF000]'
                  : 'text-white/90 hover:text-[#FFF000]'
              }`}
            >
              <User className="w-3 h-3 text-[#FFF000]" />
              Student Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row - Sleek Smart Header with Enlarged Logo & No Harsh Yellow Border */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Emblem + Institution Name + Subtitle */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 sm:gap-4 text-left group focus:outline-hidden focus:ring-2 focus:ring-[#FFF000] rounded-xl p-1 min-w-0 cursor-pointer"
          aria-label="Go to DAR - E - ARQAM Home"
        >
          <Emblem 
            size="md" 
            className="!w-12 !h-12 sm:!w-13 sm:!h-13 md:!w-14 md:!h-14 group-hover:scale-105 transition-all drop-shadow-md shrink-0" 
          />
          
          <div className="flex flex-col min-w-0 justify-center">
            <div className="flex items-baseline gap-2 leading-tight">
              <span className="font-editorial text-[18px] sm:text-2xl md:text-[26px] font-extrabold tracking-tight text-white group-hover:text-[#FFF9B8] transition-colors truncate">
                {institutionName}
              </span>
              <span className="hidden md:inline-block text-[11px] font-mono text-[#F5D900] font-bold">
                (EST. 1998)
              </span>
            </div>
            <span className="text-[12px] sm:text-[13.5px] md:text-[15px] font-bold text-[#FFF000] tracking-[0.05em] sm:tracking-[0.08em] [word-spacing:0.12em] sm:[word-spacing:0.18em] leading-tight mt-0.5 select-none truncate">
              {tagline}
            </span>
          </div>
        </button>

        {/* Right: Clean Official Controls & Hamburger Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick actions for desktop: Results check & Admissions */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('apply-admission')}
              className="px-4 py-2 text-xs font-extrabold text-[#171852] bg-[#FFF000] hover:bg-[#F5D900] rounded-lg transition-all shadow-md cursor-pointer active:scale-95 border border-[#F5D900]"
            >
              Admissions 2026–27
            </button>
            <button
              onClick={() => onNavigate('notices')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'notices'
                  ? 'bg-[#292A86] text-[#FFF000] border border-[#F5D900]/40 shadow-xs'
                  : 'text-white/90 hover:text-[#FFF000] hover:bg-[#292A86]/60'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-[#FFF000]" />
              Notices
            </button>
          </div>

          {/* Primary Hamburger Trigger (Slim & Smart) */}
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-[#20216B] hover:bg-[#292A86] border border-white/20 hover:border-[#FFF000] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#FFF000] transition-all cursor-pointer shadow-md active:scale-95"
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFF000]" />
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>
      </div>

      {/* Subtle Blue -> Yellow decorative line */}
      <div className="brand-gradient-line" />
    </header>
  );
};
