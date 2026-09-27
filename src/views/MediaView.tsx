import React, { useState } from 'react';
import { PageId } from '../types';
import { NEWS_DATA, DOWNLOADS_DATA } from '../data/mockData';
import { 
  FileText, 
  Download, 
  Image as ImageIcon, 
  Calendar, 
  ArrowRight, 
  Search, 
  ExternalLink 
} from 'lucide-react';

interface MediaViewProps {
  initialTab?: 'news' | 'gallery' | 'downloads';
  onNavigate: (page: PageId) => void;
}

export const MediaView: React.FC<MediaViewProps> = ({
  initialTab = 'news',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'news' | 'gallery' | 'downloads'>(initialTab);
  const [galleryFilter, setGalleryFilter] = useState<string>('All');
  const [downloadSearch, setDownloadSearch] = useState<string>('');

  // Gallery items using verified generated assets
  const galleryItems = [
    {
      id: 'gal-01',
      title: 'Main Academic Block & Central Quadrangle',
      category: 'Campus',
      date: 'March 2026',
      image: '/src/assets/images/campus_main_building_1790434904126.jpg',
      description: 'The administrative heart of DARE ARQAM featuring the central assembly arena and academic chambers.',
    },
    {
      id: 'gal-02',
      title: 'Senior Physics & Applied Chemistry Laboratory',
      category: 'Academic Activities',
      date: 'February 2026',
      image: '/src/assets/images/campus_science_lab_1790434931736.jpg',
      description: 'Fully equipped practical workstations designed in strict accordance with Board of Intermediate & Secondary Education specifications.',
    },
    {
      id: 'gal-03',
      title: 'Central Reference Library & Independent Study Hall',
      category: 'Student Activities',
      date: 'January 2026',
      image: '/src/assets/images/campus_library_hall_1790434944628.jpg',
      description: 'Quiet scholarly environment offering access to thousands of educational volumes, encyclopedias, and reference journals.',
    },
    {
      id: 'gal-04',
      title: 'Executive Council Room & Academic Directorate',
      category: 'Campus',
      date: 'December 2025',
      image: '/src/assets/images/campus_main_building_1790434904126.jpg',
      description: 'Chambers dedicated to periodic board consultations and academic steering committees.',
    },
    {
      id: 'gal-05',
      title: 'Inter-House Annual Sports Olympiad & Physical Fitness Trials',
      category: 'Sports',
      date: 'November 2025',
      image: '/src/assets/images/campus_science_lab_1790434931736.jpg',
      description: 'Annual competitive athletic championship covering sprint relays, cricket, and physical drills.',
    },
    {
      id: 'gal-06',
      title: 'Annual Seerat Conference & Quranic Tajweed Recitations',
      category: 'Events',
      date: 'October 2025',
      image: '/src/assets/images/campus_library_hall_1790434944628.jpg',
      description: 'Scholarly presentations and Husn-e-Qirat competitions held in the central institutional auditorium.',
    }
  ];

  const galleryCategories = ['All', 'Campus', 'Academic Activities', 'Events', 'Sports', 'Student Activities'];

  const filteredGallery = galleryItems.filter(item => {
    if (galleryFilter === 'All') return true;
    return item.category === galleryFilter;
  });

  const filteredDownloads = DOWNLOADS_DATA.filter(doc =>
    doc.title.toLowerCase().includes(downloadSearch.toLowerCase()) ||
    doc.category.toLowerCase().includes(downloadSearch.toLowerCase()) ||
    doc.refNo.toLowerCase().includes(downloadSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Banner */}
      <div className="pb-4 border-b border-stone-200">
        <div className="text-xs font-semibold text-emerald-900 tracking-wider uppercase mb-1">
          Institutional Archives & Media
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
          Media, News & Document Downloads
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-prose-serif">
          Public statements, photo documentation of campus life, and official institutional documents for parents and scholars.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-stone-100 p-1 rounded-md flex flex-wrap gap-1 border border-stone-200">
        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'news'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
          }`}
        >
          Institutional News
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
          }`}
        >
          Campus Gallery
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'downloads'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
          }`}
        >
          Official Downloads Repository
        </button>
      </div>

      {/* 1. NEWS TAB */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="space-y-4">
            {NEWS_DATA.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-lg p-6 space-y-3 hover:border-emerald-800 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                  <span className="font-semibold text-emerald-900">{item.category}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{item.date}</span>
                  </span>
                </div>

                <h2 className="font-editorial text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                  {item.title}
                </h2>

                <p className="text-xs sm:text-sm text-stone-700 font-prose-serif leading-relaxed">
                  {item.content}
                </p>

                <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                  Published by: Office of Institutional Public Relations · DARE ARQAM
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. GALLERY TAB */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Gallery Category Filter (Zero-Pill discipline) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-md border border-stone-200">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                  galleryFilter === cat
                    ? 'bg-emerald-900 text-white font-semibold shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((gal) => (
              <div
                key={gal.id}
                className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs group hover:border-emerald-800 transition-colors"
              >
                <div className="relative h-48 bg-stone-100 overflow-hidden">
                  <img
                    src={gal.image}
                    alt={gal.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-stone-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-xs">
                    {gal.category}
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="text-[11px] text-stone-500 font-medium">
                    {gal.date}
                  </div>
                  <h3 className="font-editorial text-sm sm:text-base font-bold text-stone-900 leading-snug">
                    {gal.title}
                  </h3>
                  <p className="text-xs text-stone-600 font-prose-serif leading-relaxed line-clamp-2">
                    {gal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DOWNLOADS TAB */}
      {activeTab === 'downloads' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white border border-stone-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search download files, forms, rules..."
                value={downloadSearch}
                onChange={(e) => setDownloadSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 rounded-md bg-stone-50"
              />
            </div>
            <div className="text-xs text-stone-500">
              Showing {filteredDownloads.length} authorized institutional documents
            </div>
          </div>

          {/* Document Rows */}
          <div className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-200 shadow-2xs">
            {filteredDownloads.map((doc) => (
              <div
                key={doc.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-semibold text-emerald-900">{doc.category}</span>
                    <span>·</span>
                    <span className="font-mono text-[11px]">Ref: {doc.refNo}</span>
                    <span>·</span>
                    <span>{doc.date}</span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900">
                    {doc.title}
                  </h3>

                  <div className="text-[11px] text-stone-500">
                    Format: {doc.fileType} Document · File Size: {doc.fileSize} · Verified Digitally
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => alert(`Simulated downloading: ${doc.title}`)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-stone-100 border border-stone-200 rounded-md text-xs text-stone-600 font-prose-serif leading-relaxed">
            <strong>Authenticity Note:</strong> Forms downloaded from this portal are official instruments of DARE ARQAM. Any alterations made to official circulars or forms void their institutional validity.
          </div>
        </div>
      )}
    </div>
  );
};
