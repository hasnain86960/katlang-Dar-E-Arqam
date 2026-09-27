import React, { useState } from 'react';
import { PageId } from '../types';
import { 
  X, 
  ChevronRight, 
  ChevronDown, 
  Home, 
  Building2, 
  GraduationCap, 
  UserCheck, 
  Users, 
  Bell, 
  Calendar, 
  Image, 
  PhoneCall, 
  LogIn,
  ExternalLink,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { Emblem } from './Emblem';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
}) => {
  // Collapsible sub-sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    institution: false,
    academics: false,
    admissions: false,
    students: false,
    noticeBoard: false,
    events: false,
    media: false,
    contact: false,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleLinkClick = (page: PageId) => {
    onNavigate(page);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <div 
        className="relative z-10 w-full max-w-md bg-stone-50 border-l border-stone-200 h-full flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Official Website Navigation"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <Emblem size="sm" />
            <div>
              <div className="font-editorial text-base sm:text-lg font-bold tracking-wide text-white">
                DARE ARQAM
              </div>
              <div className="text-[11px] text-emerald-200 tracking-wider uppercase font-medium">
                Navigation Directory
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-900 rounded-md focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search / Fast Link Notice */}
        <div className="bg-emerald-900/10 px-4 py-2.5 border-b border-emerald-900/15 flex items-center justify-between text-xs text-emerald-950 font-medium">
          <span>Session 2026–2027 Portal</span>
          <button 
            onClick={() => handleLinkClick('apply-admission')}
            className="text-emerald-800 hover:text-emerald-950 font-semibold underline underline-offset-2 flex items-center gap-1"
          >
            Apply Online <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Drawer Navigation List */}
        <nav className="flex-1 overflow-y-auto divide-y divide-stone-200 p-2 sm:p-3 text-stone-800 text-sm">
          {/* 1. HOME */}
          <div className="py-1">
            <button
              onClick={() => handleLinkClick('home')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left font-semibold transition-colors ${
                currentPage === 'home'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-800 hover:bg-stone-200/70'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>HOME</span>
            </button>
          </div>

          {/* 2. INSTITUTION */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => toggleSection('institution')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold text-stone-900 hover:bg-stone-200/70"
            >
              <span className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>INSTITUTION</span>
              </span>
              {openSections.institution ? (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-500" />
              )}
            </button>
            {openSections.institution && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                <button
                  onClick={() => handleLinkClick('about')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  About DARE ARQAM
                </button>
                <button
                  onClick={() => handleLinkClick('principal-message')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Principal's Message
                </button>
                <button
                  onClick={() => handleLinkClick('vision-mission')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Vision & Mission
                </button>
                <button
                  onClick={() => handleLinkClick('administration')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Administration & Governance
                </button>
                <button
                  onClick={() => handleLinkClick('faculty')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Faculty & Staff
                </button>
                <button
                  onClick={() => handleLinkClick('departments')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Departments / Sections
                </button>
              </div>
            )}
          </div>

          {/* 3. ACADEMICS */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => toggleSection('academics')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold text-stone-900 hover:bg-stone-200/70"
            >
              <span className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>ACADEMICS</span>
              </span>
              {openSections.academics ? (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-500" />
              )}
            </button>
            {openSections.academics && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                <button
                  onClick={() => handleLinkClick('academic-programs')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Academic Programs
                </button>
                <button
                  onClick={() => handleLinkClick('classes')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Classes & Structure
                </button>
                <button
                  onClick={() => handleLinkClick('academic-calendar')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Academic Calendar
                </button>
                <button
                  onClick={() => handleLinkClick('examination')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Examination Schedule & Rules
                </button>
                <button
                  onClick={() => handleLinkClick('results')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 font-medium text-emerald-800"
                >
                  Online Results Verification
                </button>
                <button
                  onClick={() => handleLinkClick('syllabus')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Syllabus & Course Outlines
                </button>
              </div>
            )}
          </div>

          {/* 4. ADMISSIONS */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => toggleSection('admissions')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold text-stone-900 hover:bg-stone-200/70"
            >
              <span className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>ADMISSIONS</span>
              </span>
              {openSections.admissions ? (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-500" />
              )}
            </button>
            {openSections.admissions && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                <button
                  onClick={() => handleLinkClick('admission-info')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Admission Information
                </button>
                <button
                  onClick={() => handleLinkClick('eligibility')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Eligibility Criteria
                </button>
                <button
                  onClick={() => handleLinkClick('admission-process')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Admission Process (5 Steps)
                </button>
                <button
                  onClick={() => handleLinkClick('required-documents')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Required Documents Checklist
                </button>
                <button
                  onClick={() => handleLinkClick('fee-structure')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Fee Structure (All Classes)
                </button>
                <button
                  onClick={() => handleLinkClick('apply-admission')}
                  className="w-full text-left py-1.5 px-2 rounded-sm bg-emerald-100/70 text-emerald-900 font-semibold hover:bg-emerald-200"
                >
                  Apply for Admission
                </button>
              </div>
            )}
          </div>

          {/* 5. STUDENTS */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => toggleSection('students')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold text-stone-900 hover:bg-stone-200/70"
            >
              <span className="flex items-center gap-3">
                <Users className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>STUDENTS</span>
              </span>
              {openSections.students ? (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-500" />
              )}
            </button>
            {openSections.students && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                <button
                  onClick={() => handleLinkClick('student-login')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Student Login
                </button>
                <button
                  onClick={() => handleLinkClick('student-register')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Student Registration
                </button>
                <button
                  onClick={() => handleLinkClick('student-portal')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 font-medium"
                >
                  Student Profile & Portal
                </button>
                <button
                  onClick={() => handleLinkClick('notices')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Notices & Circulars
                </button>
                <button
                  onClick={() => handleLinkClick('student-portal')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Attendance Record
                </button>
                <button
                  onClick={() => handleLinkClick('student-portal')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Academic Information
                </button>
              </div>
            )}
          </div>

          {/* 6. NOTICE BOARD */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => toggleSection('noticeBoard')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold text-stone-900 hover:bg-stone-200/70"
            >
              <span className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>NOTICE BOARD</span>
              </span>
              {openSections.noticeBoard ? (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-500" />
              )}
            </button>
            {openSections.noticeBoard && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                <button
                  onClick={() => handleLinkClick('notices')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Latest Notices
                </button>
                <button
                  onClick={() => handleLinkClick('notices')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Important Announcements
                </button>
                <button
                  onClick={() => handleLinkClick('notices')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Administrative Circulars
                </button>
              </div>
            )}
          </div>

          {/* 7. EVENTS */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => toggleSection('events')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold text-stone-900 hover:bg-stone-200/70"
            >
              <span className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>EVENTS</span>
              </span>
              {openSections.events ? (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-500" />
              )}
            </button>
            {openSections.events && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                <button
                  onClick={() => handleLinkClick('events')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Upcoming Events
                </button>
                <button
                  onClick={() => handleLinkClick('events')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Previous Events Archive
                </button>
              </div>
            )}
          </div>

          {/* 8. MEDIA */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => toggleSection('media')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold text-stone-900 hover:bg-stone-200/70"
            >
              <span className="flex items-center gap-3">
                <Image className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>MEDIA</span>
              </span>
              {openSections.media ? (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-500" />
              )}
            </button>
            {openSections.media && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                <button
                  onClick={() => handleLinkClick('news')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Institutional News
                </button>
                <button
                  onClick={() => handleLinkClick('gallery')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Campus Gallery
                </button>
                <button
                  onClick={() => handleLinkClick('downloads')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Downloads & Circulars
                </button>
              </div>
            )}
          </div>

          {/* 9. CONTACT */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold text-stone-900 hover:bg-stone-200/70"
            >
              <span className="flex items-center gap-3">
                <PhoneCall className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>CONTACT</span>
              </span>
              {openSections.contact ? (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-500" />
              )}
            </button>
            {openSections.contact && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                <button
                  onClick={() => handleLinkClick('contact')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Contact Us
                </button>
                <button
                  onClick={() => handleLinkClick('contact')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Office Information & Hours
                </button>
                <button
                  onClick={() => handleLinkClick('contact')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Campus Location
                </button>
                <button
                  onClick={() => handleLinkClick('contact')}
                  className="w-full text-left py-1.5 px-2 rounded-sm hover:bg-emerald-50 text-stone-700 hover:text-emerald-900"
                >
                  Help / Student Support
                </button>
              </div>
            )}
          </div>

          {/* 10. DIRECTORATE ADMIN LOGIN */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => handleLinkClick('admin-login')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold transition-colors cursor-pointer ${
                currentPage === 'admin-login' || currentPage === 'admin-dashboard'
                  ? 'bg-stone-900 text-amber-300 shadow-xs'
                  : 'text-stone-900 hover:bg-emerald-950 hover:text-white group'
              }`}
            >
              <span className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-800 group-hover:text-amber-400 shrink-0" />
                <span>ADMIN LOGIN</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-800 font-bold">
                Directorate
              </span>
            </button>
          </div>
        </nav>

        {/* Drawer Bottom Actions: Login / Register / Admin */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 space-y-2">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
            <span>Portal Access</span>
            <span className="text-[10px] font-mono text-emerald-800 font-bold">DIRECTORATE</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleLinkClick('student-login')}
              className="w-full py-2 px-3 text-xs font-semibold text-emerald-900 bg-white border border-emerald-900/30 rounded-md hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Student Login
            </button>
            <button
              onClick={() => handleLinkClick('student-register')}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-900 rounded-md hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Register
            </button>
          </div>

          {/* Prominent Admin Login Action */}
          <button
            onClick={() => handleLinkClick('admin-login')}
            className="w-full py-2 px-3 text-xs font-semibold text-stone-900 bg-stone-200 hover:bg-stone-300 border border-stone-300 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer font-mono"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
            <span>Directorate Admin Login</span>
          </button>

          <div className="text-[11px] text-stone-500 text-center pt-1 font-mono">
            Registered Educational Institution · Est. 1998
          </div>
        </div>
      </div>
    </div>
  );
};
