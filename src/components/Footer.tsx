import React from 'react';
import { PageId } from '../types';
import { Emblem } from './Emblem';
import { INSTITUTION_INFO } from '../data/mockData';
import { Phone, Mail, MapPin, Clock, ShieldCheck, FileText } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-16 text-sm">
      {/* Top Green Accent Bar */}
      <div className="h-1.5 bg-emerald-800 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Institution Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Emblem size="md" />
              <div>
                <div className="font-editorial text-xl font-bold tracking-tight text-white">
                  DARE ARQAM
                </div>
                <div className="text-xs text-emerald-400 font-medium tracking-wide">
                  Established 1998
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              DARE ARQAM is a recognized institutional school system dedicated to academic rigor, moral character development, and scientific excellence in Pakistan.
            </p>

            <div className="pt-2 text-xs text-stone-400 space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Affiliation: {INSTITUTION_INFO.affiliation}</span>
              </div>
              <div className="text-stone-500 font-mono text-[11px]">
                Registration: {INSTITUTION_INFO.registrationNo}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-editorial text-sm font-semibold text-white tracking-wider uppercase mb-4 pb-2 border-b border-stone-800">
              Institution Navigation
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  About DARE ARQAM
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('principal-message')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Principal's Message
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('vision-mission')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Vision, Mission & Core Values
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('administration')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Administration & Governance
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faculty')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Faculty & Academic Heads
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('academic-calendar')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Annual Academic Calendar
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Student & Parent Services */}
          <div>
            <h3 className="font-editorial text-sm font-semibold text-white tracking-wider uppercase mb-4 pb-2 border-b border-stone-800">
              Academic & Admissions
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('admission-info')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Admissions Guidelines (2026–27)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('fee-structure')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Official Fee Structure
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('results')}
                  className="hover:text-emerald-400 transition-colors text-left text-emerald-300 font-medium"
                >
                  Online Examination Results
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('notices')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Latest Notices & Circulars
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('downloads')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Download Forms & Documents
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('student-login')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Student Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Contact & Timings */}
          <div>
            <h3 className="font-editorial text-sm font-semibold text-white tracking-wider uppercase mb-4 pb-2 border-b border-stone-800">
              Official Contact
            </h3>
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{INSTITUTION_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{INSTITUTION_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{INSTITUTION_INFO.email}</span>
              </div>
              <div className="flex items-start gap-2.5 pt-1 text-stone-400">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <div className="font-medium text-stone-300">Office Timings:</div>
                  <div className="text-[11px] mt-0.5">{INSTITUTION_INFO.officeHours}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Institutional Disclaimer & Legal Links */}
        <div className="mt-12 pt-6 border-t border-stone-800 text-xs text-stone-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            © {new Date().getFullYear()} DARE ARQAM School System. All Official Rights Reserved.
            <div className="text-[11px] text-stone-400 mt-0.5">
              Approved educational institution portal. Content governed under institutional academic regulations.
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs text-stone-300">
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-white underline underline-offset-4"
            >
              Contact Support
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('downloads')}
              className="hover:text-white underline underline-offset-4"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('downloads')}
              className="hover:text-white underline underline-offset-4"
            >
              Terms of Website Usage
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
