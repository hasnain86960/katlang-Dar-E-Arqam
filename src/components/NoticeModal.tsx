import React from 'react';
import { Notice, PageId } from '../types';
import { X, AlertCircle, FileText, Calendar, Building } from 'lucide-react';
import { Emblem } from './Emblem';

interface NoticeModalProps {
  notice: Notice | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: (notice: Notice) => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({
  notice,
  isOpen,
  onClose,
  onViewDetails,
}) => {
  if (!isOpen || !notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal Card */}
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-2xl border border-emerald-900/20 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-notice-title"
      >
        {/* Official Header Strip */}
        <div className="bg-emerald-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2.5">
            <Emblem size="sm" />
            <div>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-emerald-300 block">
                OFFICIAL INSTITUTIONAL NOTICE
              </span>
              <span className="text-xs font-mono text-emerald-200">
                Ref No: {notice.refNo}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-300 hover:text-white p-1 rounded-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            aria-label="Close Notice Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Metadata Row (Zero-Pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span className="text-emerald-900 font-semibold">{notice.category}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{notice.date}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-stone-600">
              <Building className="w-3.5 h-3.5" />
              <span>{notice.issuedBy}</span>
            </span>
          </div>

          {/* Notice Title */}
          <h3
            id="modal-notice-title"
            className="font-editorial text-lg sm:text-xl font-bold text-stone-900 leading-snug"
          >
            {notice.title}
          </h3>

          {/* Short Message / Excerpt */}
          <div className="p-3.5 bg-stone-50 border-l-3 border-emerald-800 rounded-r-md text-xs sm:text-sm text-stone-700 leading-relaxed font-prose-serif">
            {notice.summary}
          </div>

          <div className="text-[11px] text-stone-500 italic">
            This notice is officially issued by the administrative directorate of DARE ARQAM School System.
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-stone-100 px-5 py-3.5 border-t border-stone-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200 rounded-md transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onViewDetails(notice);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
