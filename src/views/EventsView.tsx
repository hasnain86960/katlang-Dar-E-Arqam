import React, { useState } from 'react';
import { PageId, AcademicEvent } from '../types';
import { EVENTS_DATA } from '../data/mockData';
import { Calendar, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface EventsViewProps {
  initialTab?: 'upcoming' | 'previous';
  onNavigate: (page: PageId) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ initialTab = 'upcoming', onNavigate }) => {
  const [filter, setFilter] = useState<'upcoming' | 'previous' | 'all'>('all');

  const filteredEvents = EVENTS_DATA.filter((e) => {
    if (filter === 'upcoming') return e.isUpcoming;
    if (filter === 'previous') return !e.isUpcoming;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Banner */}
      <div className="pb-4 border-b border-stone-200">
        <div className="text-xs font-semibold text-emerald-900 tracking-wider uppercase mb-1">
          Calendar of Institutional Life
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
          Institutional Events & Ceremonies
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-prose-serif">
          Official schedule of academic assessments, science exhibitions, sports olympiads, and annual convocations.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-md max-w-xs border border-stone-200">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-emerald-900 text-white font-semibold shadow-xs'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
            filter === 'upcoming'
              ? 'bg-emerald-900 text-white font-semibold shadow-xs'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('previous')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
            filter === 'previous'
              ? 'bg-emerald-900 text-white font-semibold shadow-xs'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          Previous
        </button>
      </div>

      {/* Events Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 space-y-4 hover:border-emerald-800 transition-colors shadow-2xs"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-16 bg-emerald-900 text-white rounded-md flex flex-col items-center justify-center shrink-0 text-center shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                  {new Date(evt.date).toLocaleString('default', { month: 'short' })}
                </span>
                <span className="text-xl font-bold font-mono">
                  {new Date(evt.date).getDate()}
                </span>
                <span className="text-[9px] text-stone-300">
                  {new Date(evt.date).getFullYear()}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="font-semibold text-emerald-900">{evt.category}</span>
                  <span>·</span>
                  <span className={evt.isUpcoming ? 'text-amber-800 font-semibold' : 'text-stone-500'}>
                    {evt.isUpcoming ? 'Upcoming Official Event' : 'Concluded'}
                  </span>
                </div>
                <h3 className="font-editorial text-base sm:text-lg font-bold text-stone-900 leading-snug">
                  {evt.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 font-prose-serif leading-relaxed">
              {evt.description}
            </p>

            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{evt.time}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{evt.venue}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
