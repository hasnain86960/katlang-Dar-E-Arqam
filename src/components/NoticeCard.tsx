import React from 'react';
import { Notice } from '../types';
import { Calendar, ChevronRight, FileText, Bookmark } from 'lucide-react';

interface NoticeCardProps {
  notice: Notice;
  onSelect: (notice: Notice) => void;
  featured?: boolean;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onSelect, featured = false }) => {
  return (
    <div
      className={`group relative bg-white border rounded-md p-4 sm:p-5 transition-all hover:border-emerald-700/60 hover:shadow-sm ${
        featured || notice.isImportant
          ? 'border-emerald-800/40 bg-emerald-50/20'
          : 'border-stone-200'
      }`}
    >
      {/* Top Metadata Strip: Zero-Pill format */}
      <div className="flex items-center justify-between gap-2 text-xs mb-2">
        <div className="flex items-center gap-2 text-stone-500 font-medium">
          <span className="font-semibold text-emerald-900 tracking-wide">
            {notice.category}
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>{notice.date}</span>
          </span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className="hidden sm:inline font-mono text-[11px] text-stone-400">
            {notice.refNo}
          </span>
        </div>

        {notice.isImportant && (
          <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
            <Bookmark className="w-3 h-3 fill-amber-700 text-amber-700" />
            Important Notice
          </span>
        )}
      </div>

      {/* Notice Title */}
      <h3 className="font-editorial text-base sm:text-lg font-bold text-stone-900 group-hover:text-emerald-950 transition-colors leading-snug">
        <button
          onClick={() => onSelect(notice)}
          className="text-left hover:underline underline-offset-2 focus:outline-hidden"
        >
          {notice.title}
        </button>
      </h3>

      {/* Summary */}
      <p className="mt-2 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
        {notice.summary}
      </p>

      {/* Card Action Row */}
      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
        <span className="text-stone-500 text-[11px] truncate max-w-[200px] sm:max-w-none">
          Issued by: {notice.issuedBy}
        </span>

        <button
          type="button"
          onClick={() => onSelect(notice)}
          className="font-semibold text-emerald-900 group-hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
