import React, { useState, useEffect } from 'react';
import { Notice, PageId } from '../types';
import { NOTICES_DATA, INSTITUTION_INFO } from '../data/mockData';
import { NoticeCard } from '../components/NoticeCard';
import { Emblem } from '../components/Emblem';
import { Search, Filter, Calendar, Building, Printer, ArrowLeft, Download, Bookmark } from 'lucide-react';
import { fetchNotices } from '../services/firebaseService';

interface NoticeBoardViewProps {
  selectedNotice: Notice | null;
  onSelectNotice: (notice: Notice | null) => void;
  onNavigate: (page: PageId) => void;
}

export const NoticeBoardView: React.FC<NoticeBoardViewProps> = ({
  selectedNotice,
  onSelectNotice,
  onNavigate,
}) => {
  const [notices, setNotices] = useState<Notice[]>(NOTICES_DATA);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchNotices()
      .then((data) => {
        if (data && data.length > 0) {
          setNotices(data);
        }
      })
      .catch(() => {
        // Fallback already set to NOTICES_DATA
      });
  }, []);

  const categories = ['All', 'Admissions', 'Examination', 'Academic', 'Administrative', 'General'];

  const filteredNotices = notices.filter((notice) => {
    const matchesCat = filterCategory === 'All' || notice.category === filterCategory;
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // If a notice is selected, render the official full circular view
  if (selectedNotice) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Navigation Breadcrumb / Back Action */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectNotice(null)}
            className="text-xs font-semibold text-emerald-900 hover:text-emerald-700 flex items-center gap-1.5 py-1.5 px-3 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Circulars</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="text-xs font-medium text-stone-700 hover:text-emerald-900 py-1.5 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Circular</span>
            </button>
          </div>
        </div>

        {/* Official Document Sheet */}
        <div className="bg-white border border-stone-300 rounded-lg p-6 sm:p-10 shadow-sm space-y-6 print-area">
          {/* Official Letterhead */}
          <div className="text-center pb-6 border-b-2 border-stone-800 space-y-2">
            <div className="flex items-center justify-center gap-3">
              <Emblem size="lg" />
              <div className="text-left">
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950">
                  DARE ARQAM
                </h1>
                <div className="text-xs text-stone-600 font-medium">
                  {INSTITUTION_INFO.fullName}
                </div>
                <div className="text-[11px] text-stone-500">
                  Office of the Registrar & Controller of Examinations · Islamabad Campus
                </div>
              </div>
            </div>
          </div>

          {/* Reference & Date Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono border-b border-stone-200 pb-3 gap-1">
            <span className="font-bold text-stone-800">
              REFERENCE NO: {selectedNotice.refNo}
            </span>
            <span className="text-stone-600">
              NOTIFICATION DATE: {selectedNotice.date}
            </span>
          </div>

          {/* Circular Title */}
          <div>
            <div className="text-xs font-semibold text-emerald-900 uppercase tracking-widest mb-1">
              CATEGORY: {selectedNotice.category}
            </div>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
              {selectedNotice.title}
            </h2>
          </div>

          {/* Notice Text Content */}
          <div className="font-prose-serif text-sm sm:text-base text-stone-800 leading-relaxed whitespace-pre-line py-2 border-y border-stone-100">
            {selectedNotice.fullText}
          </div>

          {/* Institutional Signature & Stamp Block */}
          <div className="pt-8 flex flex-col sm:flex-row items-end justify-between gap-6 border-t border-stone-200">
            <div className="text-xs text-stone-500 space-y-1">
              <div>Copy forwarded for information to:</div>
              <ul className="list-disc list-inside text-[11px] text-stone-600 pl-1 space-y-0.5">
                <li>Office of the Principal, DARE ARQAM</li>
                <li>All Wing Heads & Section Coordinators</li>
                <li>Accounts & Finance Directorate</li>
                <li>Notice Board (Campus & Official Portal)</li>
              </ul>
            </div>

            <div className="text-right text-xs">
              <div className="w-36 h-12 border-b border-dashed border-stone-400 mx-auto sm:ml-auto mb-1 flex items-end justify-center text-[10px] text-stone-400 italic">
                (Verified Digital Signature)
              </div>
              <div className="font-bold text-stone-900">{selectedNotice.issuedBy}</div>
              <div className="text-[11px] text-stone-600">DARE ARQAM School System</div>
              <div className="text-[10px] text-stone-400 font-mono mt-1">
                DISPATCH ID: {selectedNotice.id.toUpperCase()}-VERIFIED
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Notice Board Listing View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="pb-4 border-b border-stone-200">
        <div className="text-xs font-semibold text-emerald-900 tracking-wider uppercase mb-1">
          Official Institutional Repository
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
          Official Notice Board & Circulars
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-prose-serif">
          All administrative directives, examination notifications, admission schedules, and official notices issued under the authority of DARE ARQAM.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Category Filter Tabs (Zero-Pill compliant button group) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-md">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-emerald-900 text-white shadow-xs font-semibold'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars, reference #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-emerald-700 bg-stone-50"
          />
        </div>
      </div>

      {/* Notice List */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="text-center py-12 bg-white border border-stone-200 rounded-md p-6">
            <Bookmark className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="font-editorial text-base font-semibold text-stone-800">
              No Notices Match Your Criteria
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Please adjust your search keyword or selected category tab.
            </p>
            <button
              onClick={() => {
                setFilterCategory('All');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-semibold text-emerald-900 underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onSelect={onSelectNotice}
              featured={notice.isImportant}
            />
          ))
        )}
      </div>

      {/* Institutional Legal Disclaimer */}
      <div className="p-4 bg-stone-100 border border-stone-200 rounded-md text-[11px] text-stone-600 leading-relaxed">
        <strong>Notice Dissemination Rule:</strong> Official circulars published on this electronic portal carry equal regulatory weight as hardcopy physical dispatches displayed upon institutional notice boards. For verification of document authenticity, contact the Registrar’s Secretariat.
      </div>
    </div>
  );
};
