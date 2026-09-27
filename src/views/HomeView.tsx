import React, { useState, useEffect } from 'react';
import { PageId, Notice, AcademicEvent } from '../types';
import { 
  INSTITUTION_INFO, 
  NOTICES_DATA, 
  EVENTS_DATA, 
  NEWS_DATA 
} from '../data/mockData';
import { NoticeCard } from '../components/NoticeCard';
import { Emblem } from '../components/Emblem';
import { 
  GraduationCap, 
  UserCheck, 
  Award, 
  FileText, 
  Calendar, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { fetchNotices, fetchEvents } from '../services/firebaseService';

interface HomeViewProps {
  onNavigate: (page: PageId) => void;
  onSelectNotice: (notice: Notice) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectNotice }) => {
  const [notices, setNotices] = useState<Notice[]>(NOTICES_DATA);
  const [events, setEvents] = useState<AcademicEvent[]>(EVENTS_DATA);

  useEffect(() => {
    fetchNotices().then(d => { if (d && d.length > 0) setNotices(d); }).catch(() => {});
    fetchEvents().then(d => { if (d && d.length > 0) setEvents(d); }).catch(() => {});
  }, []);

  const importantNotices = notices.slice(0, 3);
  const upcomingEvents = events.filter(e => e.isUpcoming).slice(0, 3);
  const latestNews = NEWS_DATA.slice(0, 2);

  return (
    <div className="space-y-12 sm:space-y-16 pb-8">
      {/* 1. HERO / WELCOME SECTION */}
      <section className="relative bg-emerald-950 text-white border-b border-emerald-900 overflow-hidden">
        {/* Subtle background campus image with institutional scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/campus_main_building_1790434904126.jpg"
            alt="DARE ARQAM Institutional Campus"
            className="w-full h-full object-cover object-center opacity-25 filter saturate-75"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/90 to-emerald-950/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl space-y-5">
            {/* Institutional Seal Lockup */}
            <div className="flex items-center gap-3 text-emerald-300 text-xs tracking-wider uppercase font-semibold">
              <span className="w-8 h-0.5 bg-amber-500 inline-block" />
              <span>Registered Educational Institution · Est. 1998</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              DARE ARQAM
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/90 font-prose-serif leading-relaxed max-w-2xl">
              A premier Pakistani educational institution committed to rigorous academic discipline, scientific inquiry, and the moral foundation of students from primary grades through matriculation and higher secondary levels.
            </p>

            {/* Primary & Secondary Actions (Required by prompt) */}
            <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => onNavigate('admission-info')}
                className="px-6 py-3 text-sm font-semibold text-emerald-950 bg-white hover:bg-emerald-50 rounded-md transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Admission Information</span>
                <ArrowRight className="w-4 h-4 text-emerald-900" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('student-login')}
                className="px-6 py-3 text-sm font-semibold text-white bg-emerald-800/90 hover:bg-emerald-800 border border-emerald-700/60 rounded-md transition-colors cursor-pointer"
              >
                Student Login
              </button>
            </div>

            {/* Trust credentials bar */}
            <div className="pt-4 border-t border-emerald-900/60 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-emerald-200/80">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                BISE Curriculum Standard
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Accredited Science & IT Labs
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Character & Ethics Formation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IMPORTANT NOTICE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-3 border-b border-stone-200">
          <div>
            <div className="text-xs font-semibold text-emerald-900 tracking-wider uppercase mb-1">
              Official Directorate
            </div>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Important Notices & Circulars
            </h2>
          </div>
          <button
            onClick={() => onNavigate('notices')}
            className="text-xs font-semibold text-emerald-900 hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>View All Official Circulars</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {importantNotices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onSelect={onSelectNotice}
              featured={notice.isImportant}
            />
          ))}
        </div>
      </section>

      {/* 3. QUICK ACCESS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-stone-100 border border-stone-200 rounded-lg p-5 sm:p-7">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900">
              Quick Institutional Access
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Direct access to essential student services, academic schedules, and institutional documentation.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Admissions */}
            <button
              onClick={() => onNavigate('admission-info')}
              className="p-4 bg-white border border-stone-200 rounded-md hover:border-emerald-800 hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-colors">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-stone-800 group-hover:text-emerald-950">
                Admissions
              </span>
            </button>

            {/* Student Login */}
            <button
              onClick={() => onNavigate('student-login')}
              className="p-4 bg-white border border-stone-200 rounded-md hover:border-emerald-800 hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-stone-800 group-hover:text-emerald-950">
                Student Login
              </span>
            </button>

            {/* Results */}
            <button
              onClick={() => onNavigate('results')}
              className="p-4 bg-white border border-stone-200 rounded-md hover:border-emerald-800 hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-colors">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-stone-800 group-hover:text-emerald-950">
                Results
              </span>
            </button>

            {/* Notices */}
            <button
              onClick={() => onNavigate('notices')}
              className="p-4 bg-white border border-stone-200 rounded-md hover:border-emerald-800 hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-stone-800 group-hover:text-emerald-950">
                Notices
              </span>
            </button>

            {/* Academic Calendar */}
            <button
              onClick={() => onNavigate('academic-calendar')}
              className="p-4 bg-white border border-stone-200 rounded-md hover:border-emerald-800 hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-stone-800 group-hover:text-emerald-950">
                Calendar
              </span>
            </button>

            {/* Downloads */}
            <button
              onClick={() => onNavigate('downloads')}
              className="p-4 bg-white border border-stone-200 rounded-md hover:border-emerald-800 hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-colors">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-stone-800 group-hover:text-emerald-950">
                Downloads
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. ABOUT THE INSTITUTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-semibold text-emerald-900 tracking-wider uppercase">
              Institutional Heritage & Mission
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
              About DARE ARQAM School System
            </h2>
            <div className="space-y-3 text-stone-700 text-sm leading-relaxed font-prose-serif">
              <p>
                DARE ARQAM was founded with a singular conviction: that modern scientific learning and profound ethical grounding are complementary forces in building the leadership of Pakistan. Since its establishment in 1998, the institution has expanded into a reputable nationwide educational network recognized for scholastic excellence.
              </p>
              <p>
                Our curriculum aligns fully with the authorized national curriculum frameworks and provincial examination board standards, while incorporating a structured Hifz-ul-Quran and Character Formation wing. We maintain dedicated science laboratories, computerized learning libraries, and structured sports arenas to foster well-rounded young citizens.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-emerald-950">
              <button
                onClick={() => onNavigate('about')}
                className="px-4 py-2 border border-emerald-900/30 rounded-md hover:bg-emerald-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Read Institutional Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('vision-mission')}
                className="px-4 py-2 text-stone-700 hover:text-emerald-900 transition-colors cursor-pointer"
              >
                Vision & Core Values
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-lg overflow-hidden border border-stone-200 shadow-sm bg-stone-100">
              <img
                src="/src/assets/images/campus_library_hall_1790434944628.jpg"
                alt="DARE ARQAM Scholarly Library Hall"
                className="w-full h-72 object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="p-3 bg-stone-900 text-stone-200 text-xs border-t border-stone-800">
                <span className="font-semibold text-white">Central Academic Library & Study Hall:</span> Serving over 1,200 junior and senior scholars.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRINCIPAL'S MESSAGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
            {/* Principal Photo */}
            <div className="md:col-span-4 flex flex-col items-center text-center">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-emerald-900/20 shadow-md mb-3 bg-stone-100">
                <img
                  src="/src/assets/images/principal_portrait_1790434918701.jpg"
                  alt="Principal Prof. Dr. Abdul Rahman Qureshi"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="font-editorial text-base sm:text-lg font-bold text-stone-900">
                {INSTITUTION_INFO.principalName}
              </div>
              <div className="text-xs text-emerald-900 font-medium mt-0.5">
                Principal & Head of Institution
              </div>
              <div className="text-[11px] text-stone-500 mt-1 max-w-xs">
                {INSTITUTION_INFO.principalQualification}
              </div>
            </div>

            {/* Message Body */}
            <div className="md:col-span-8 space-y-4">
              <div className="text-xs font-semibold text-emerald-900 tracking-wider uppercase">
                Executive Leadership
              </div>
              <h2 className="font-editorial text-2xl font-bold text-stone-900">
                Message from the Principal
              </h2>

              <blockquote className="border-l-3 border-emerald-800 pl-4 text-stone-700 text-sm sm:text-base font-prose-serif italic leading-relaxed">
                “In an age of rapid technological transition, true education is not merely the accumulation of facts, but the disciplined training of the intellect and the nurturing of a conscience anchored in timeless moral virtues. At DARE ARQAM, our educators strive tirelessly to ensure every young mind that walks through our gates emerges equipped to excel globally while holding firm to their national and spiritual roots.”
              </blockquote>

              <p className="text-xs sm:text-sm text-stone-600 font-prose-serif leading-relaxed">
                We invite parents to partner actively with our faculty in shaping the future trajectory of their children, creating an academic journey marked by curiosity, perseverance, and mutual respect.
              </p>

              <div>
                <button
                  onClick={() => onNavigate('principal-message')}
                  className="text-xs font-semibold text-emerald-900 hover:text-emerald-700 inline-flex items-center gap-1 underline underline-offset-4 cursor-pointer"
                >
                  <span>Read Full Executive Address</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ACADEMIC INFORMATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6 pb-3 border-b border-stone-200">
          <div className="text-xs font-semibold text-emerald-900 tracking-wider uppercase mb-1">
            Scholastic Structure
          </div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            Academic Information & Divisions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Junior Wing */}
          <div className="bg-white border border-stone-200 rounded-md p-5 flex flex-col justify-between hover:border-emerald-700 transition-colors">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                Division 01
              </div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 mb-2">
                Junior Wing (Classes I–V)
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-prose-serif">
                Foundation in literacy, numeracy, Quranic recitation (Nazra), introductory general science, social studies, and creative expression.
              </p>
            </div>
            <button
              onClick={() => onNavigate('classes')}
              className="mt-4 pt-3 border-t border-stone-100 text-xs font-semibold text-emerald-900 flex items-center justify-between hover:underline cursor-pointer"
            >
              <span>Explore Curriculum</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Middle Wing */}
          <div className="bg-white border border-stone-200 rounded-md p-5 flex flex-col justify-between hover:border-emerald-700 transition-colors">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                Division 02
              </div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 mb-2">
                Middle Wing (Classes VI–VIII)
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-prose-serif">
                Intensive preparation in discrete sciences (Physics, Chemistry, Biology), algebraic mathematics, computer literacy, English composition, and Urdu.
              </p>
            </div>
            <button
              onClick={() => onNavigate('classes')}
              className="mt-4 pt-3 border-t border-stone-100 text-xs font-semibold text-emerald-900 flex items-center justify-between hover:underline cursor-pointer"
            >
              <span>Explore Curriculum</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Senior / Matriculation */}
          <div className="bg-white border border-stone-200 rounded-md p-5 flex flex-col justify-between hover:border-emerald-700 transition-colors">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                Division 03
              </div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 mb-2">
                Matriculation (Classes IX–X)
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-prose-serif">
                Affiliated with Board of Intermediate & Secondary Education. Specialized Science (Biology) and Computer Science streams with dedicated laboratory work.
              </p>
            </div>
            <button
              onClick={() => onNavigate('academic-programs')}
              className="mt-4 pt-3 border-t border-stone-100 text-xs font-semibold text-emerald-900 flex items-center justify-between hover:underline cursor-pointer"
            >
              <span>Board Requirements</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* HSSC / College */}
          <div className="bg-white border border-stone-200 rounded-md p-5 flex flex-col justify-between hover:border-emerald-700 transition-colors">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                Division 04
              </div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 mb-2">
                Higher Secondary (HSSC)
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-prose-serif">
                Pre-Medical, Pre-Engineering, and Intermediate in Computer Science (ICS) with focus on competitive entrance test preparation (MDCAT/ECAT).
              </p>
            </div>
            <button
              onClick={() => onNavigate('academic-programs')}
              className="mt-4 pt-3 border-t border-stone-100 text-xs font-semibold text-emerald-900 flex items-center justify-between hover:underline cursor-pointer"
            >
              <span>Stream Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. LATEST NEWS & UPCOMING EVENTS (Side by Side Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Latest News (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h2 className="font-editorial text-xl font-bold text-stone-900">
                Latest Institutional News
              </h2>
              <button
                onClick={() => onNavigate('news')}
                className="text-xs font-semibold text-emerald-900 hover:underline cursor-pointer"
              >
                View News Archive
              </button>
            </div>

            <div className="space-y-4">
              {latestNews.map((news) => (
                <div
                  key={news.id}
                  className="bg-white border border-stone-200 rounded-md p-4 sm:p-5 hover:border-emerald-700 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
                    <span className="font-semibold text-emerald-900">{news.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{news.date}</span>
                  </div>
                  <h3 className="font-editorial text-base font-bold text-stone-900 hover:text-emerald-950">
                    {news.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed font-prose-serif">
                    {news.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h2 className="font-editorial text-xl font-bold text-stone-900">
                Upcoming Events & Dates
              </h2>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs font-semibold text-emerald-900 hover:underline cursor-pointer"
              >
                All Events
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white border border-stone-200 rounded-md p-4 flex gap-3 hover:border-emerald-700 transition-colors"
                >
                  <div className="shrink-0 w-12 h-14 bg-emerald-900 text-white rounded-sm flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {new Date(evt.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-base font-bold font-mono">
                      {new Date(evt.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-semibold text-emerald-900">
                      {evt.category} · {evt.time}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5 leading-snug">
                      {evt.title}
                    </h3>
                    <div className="text-[11px] text-stone-500 mt-1">
                      Venue: {evt.venue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. OFFICIAL CONTACT SUMMARY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-stone-100 border border-stone-200 rounded-lg p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs font-semibold text-emerald-900 tracking-wider uppercase mb-1">
                Institutional Contact & Inquiries
              </div>
              <h2 className="font-editorial text-2xl font-bold text-stone-900">
                Official Secretariat & Directorate
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 font-prose-serif leading-relaxed">
                Parents, prospective scholars, and regulatory authorities are welcome to contact our central administration during authorized office working hours.
              </p>

              <div className="mt-4 space-y-2 text-xs text-stone-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-900 shrink-0 mt-0.5" />
                  <span>{INSTITUTION_INFO.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-900 shrink-0" />
                  <span>Telephone: {INSTITUTION_INFO.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-900 shrink-0" />
                  <span>Official Email: {INSTITUTION_INFO.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-900 shrink-0" />
                  <span>Office Hours: {INSTITUTION_INFO.officeHours}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-md p-5 text-center space-y-3">
              <Emblem size="lg" className="mx-auto" />
              <h3 className="font-editorial text-base font-bold text-stone-900">
                Admissions for Session 2026–2027
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Applications for entry tests and merit placements are currently being received at the Admissions Desk.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => onNavigate('apply-admission')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer"
                >
                  Submit Online Application
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
                >
                  Contact Admissions Office
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
