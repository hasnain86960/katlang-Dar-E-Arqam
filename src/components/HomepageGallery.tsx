import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GallerySlide, 
  GallerySettings 
} from '../types';
import { 
  fetchHomepageGallery, 
  subscribeHomepageGallery,
  DEFAULT_GALLERY_SETTINGS,
  DEFAULT_GALLERY_SLIDES
} from '../services/firebaseService';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Sparkles, 
  Layers, 
  Pause, 
  Play, 
  Image as ImageIcon,
  Building,
  ShieldCheck,
  Eye
} from 'lucide-react';

export const HomepageGallery: React.FC = () => {
  const [slides, setSlides] = useState<GallerySlide[]>(DEFAULT_GALLERY_SLIDES);
  const [settings, setSettings] = useState<GallerySettings>(DEFAULT_GALLERY_SETTINGS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isManualPaused, setIsManualPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active enabled slides filtered and sorted
  const activeSlides = slides
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order);

  const totalActive = activeSlides.length;

  // Realtime subscription to Firebase
  useEffect(() => {
    // Initial fetch
    fetchHomepageGallery().then(data => {
      if (data.slides) setSlides(data.slides);
      if (data.settings) setSettings(data.settings);
    });

    // Realtime sync
    const unsubscribe = subscribeHomepageGallery((data) => {
      if (data.slides) setSlides(data.slides);
      if (data.settings) setSettings(data.settings);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Safe navigation helpers
  const handleNext = useCallback(() => {
    if (totalActive <= 1) return;
    setCurrentIndex(prev => (prev + 1) % totalActive);
    setProgress(0);
  }, [totalActive]);

  const handlePrev = useCallback(() => {
    if (totalActive <= 1) return;
    setCurrentIndex(prev => (prev - 1 + totalActive) % totalActive);
    setProgress(0);
  }, [totalActive]);

  const handleGoTo = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // Auto-slide effect with progress tracking
  useEffect(() => {
    if (totalActive <= 1) {
      setProgress(0);
      return;
    }

    const intervalTime = settings.autoSlideInterval || 4000;
    const shouldPause = (isHovered && settings.pauseOnHover) || isManualPaused;

    if (shouldPause) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    // Reset progress tick
    setProgress(0);
    const progressStep = 100 / (intervalTime / 50);

    progressTimerRef.current = setInterval(() => {
      setProgress(old => {
        if (old >= 100) return 0;
        return old + progressStep;
      });
    }, 50);

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % totalActive);
      setProgress(0);
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [totalActive, settings.autoSlideInterval, settings.pauseOnHover, isHovered, isManualPaused]);

  // Keyboard accessibility for lightbox and carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === 'Escape') setLightboxIndex(null);
        if (e.key === 'ArrowRight') setLightboxIndex((lightboxIndex + 1) % totalActive);
        if (e.key === 'ArrowLeft') setLightboxIndex((lightboxIndex - 1 + totalActive) % totalActive);
      } else if (isHovered) {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, totalActive, isHovered, handleNext, handlePrev]);

  if (totalActive === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10">
        <div className="bg-[#0E1222] border-2 border-[#D4AF37]/30 rounded-2xl p-8 text-center space-y-3 shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#1A223E] border border-[#D4AF37]/40 flex items-center justify-center text-[#FFF000]">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-white">Institutional Visual Archive</h3>
          <p className="text-sm text-stone-300 max-w-md mx-auto">
            Visual gallery exhibits are currently being curated by the Directorate. Please check back shortly.
          </p>
        </div>
      </section>
    );
  }

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <section 
      aria-label="Campus Visual Showcase" 
      className="max-w-7xl mx-auto px-4 sm:px-6 my-10 sm:my-14"
    >
      {/* 1. Header with futuristic badge */}
      <div className="mb-6 pb-4 border-b border-[#CBD5E1]/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-[#171852] text-[#FFF000] border border-[#FFF000]/40 font-bold shadow-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FFF000] animate-pulse" />
            <span>CAMPUS LIFE & INFRASTRUCTURE</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F1035] tracking-tight flex items-center gap-3">
            <span>Visual Architectural Showcase</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] font-prose-serif mt-1 max-w-2xl">
            Explore our state-of-the-art campus facilities, academic research labs, and vibrant student learning environments.
          </p>
        </div>
      </div>

      {/* 2. Main Horizontal Showcase Card with Futuristic Backdrop */}
      <div 
        ref={containerRef}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        className="relative bg-gradient-to-br from-[#0B0F1F] via-[#141A35] to-[#1C244B] border-2 border-[#D4AF37]/40 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden group transition-all duration-300"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#FFF000]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#20216B]/40 blur-3xl pointer-events-none" />

        {/* Top Progress Bar for Auto-Slide */}
        {totalActive > 1 && !isManualPaused && !isHovered && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30">
            <div 
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFF000] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Hover Pause Indicator */}
        {(isHovered || isManualPaused) && totalActive > 1 && (
          <div className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#FFF000] text-[10px] font-mono tracking-wide font-bold flex items-center gap-1.5 pointer-events-none animate-in fade-in">
            <Pause className="w-2.5 h-2.5" />
            <span>PAUSED</span>
          </div>
        )}

        {/* Image Track Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px] sm:min-h-[440px] md:min-h-[480px]">
          {/* Main Visual Display (7 Columns on large screens) */}
          <div className="lg:col-span-8 relative h-64 sm:h-80 md:h-[420px] lg:h-full bg-black overflow-hidden flex items-center justify-center">
            {/* Current Active Image with Smooth Transition */}
            <img
              key={currentSlide.id}
              src={currentSlide.url}
              alt={currentSlide.title || "Campus showcase photograph"}
              className={`w-full h-full object-cover object-center transition-all duration-700 ease-out transform group-hover:scale-105 ${
                loadedImages[currentSlide.id] ? 'opacity-100' : 'opacity-90 blur-xs'
              }`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={() => setLoadedImages(prev => ({ ...prev, [currentSlide.id]: true }))}
            />

            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1F] via-black/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0B0F1F]/70 hidden lg:block pointer-events-none" />

            {/* Expand / Lightbox Trigger Button */}
            <button
              type="button"
              onClick={() => setLightboxIndex(currentIndex)}
              className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-[#FFF000]/60 text-[#FFF000] text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95"
              aria-label="View full screen high-resolution image"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </button>

            {/* Category tag over image */}
            {currentSlide.category && (
              <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-lg bg-[#171852]/90 backdrop-blur-md border border-[#D4AF37]/60 text-[#FFF000] text-[11px] font-mono font-bold uppercase tracking-wider shadow-md">
                {currentSlide.category}
              </div>
            )}

            {/* In-Image Large Chevrons for Quick Tapping on Mobile & Desktop */}
            {totalActive > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white hover:text-[#FFF000] border border-white/20 backdrop-blur-sm transition-all shadow-lg cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white hover:text-[#FFF000] border border-white/20 backdrop-blur-sm transition-all shadow-lg cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Description & Narrative Chamber (4 Columns on large screens) */}
          <div className="lg:col-span-4 p-5 sm:p-7 md:p-8 flex flex-col justify-center space-y-4 bg-[#0F1428]/95 border-t lg:border-t-0 lg:border-l border-[#263352]">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-[#D4AF37] font-mono uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Verified Infrastructure</span>
                </span>
                <span className="text-[11px] text-stone-400">DAR - E - ARQAM</span>
              </div>

              {/* Slide Title */}
              <h3 className="font-editorial text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug drop-shadow-sm">
                {currentSlide.title || "Institutional Facility & Learning Environment"}
              </h3>

              {/* Golden accent divider */}
              <div className="w-12 h-0.5 bg-gradient-to-r from-[#FFF000] to-transparent" />

              {/* Slide Caption */}
              <p className="text-xs sm:text-sm text-stone-300 font-prose-serif leading-relaxed">
                {currentSlide.caption || "Empowering students through high-standard educational resources, state-of-the-art laboratory workshops, and spacious campus grounds."}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Indicator Dots */}
        {totalActive > 1 && settings.showIndicators && (
          <div className="py-3 bg-[#0B0E1C] border-t border-[#1E293B] flex items-center justify-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleGoTo(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx 
                    ? 'w-7 bg-[#FFF000] shadow-[0_0_8px_rgba(255,240,0,0.6)]' 
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Image Fullscreen Lightbox"
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/50 text-xs font-mono font-bold">
                {String(lightboxIndex + 1).padStart(2, '0')} / {String(totalActive).padStart(2, '0')}
              </span>
              <div className="font-editorial text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
                {activeSlides[lightboxIndex]?.title || "Campus Gallery Inspection"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-[#FFF000] transition-colors cursor-pointer"
              aria-label="Close fullscreen modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Image Center */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={activeSlides[lightboxIndex]?.url}
              alt={activeSlides[lightboxIndex]?.title || "Inspection view"}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />

            {/* Prev & Next in Lightbox */}
            {totalActive > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((lightboxIndex - 1 + totalActive) % totalActive)}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-[#FFF000] border border-white/20 transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((lightboxIndex + 1) % totalActive)}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-[#FFF000] border border-white/20 transition-all cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer Caption */}
          {activeSlides[lightboxIndex]?.caption && (
            <div className="max-w-3xl mx-auto text-center text-xs sm:text-sm text-stone-300 font-prose-serif pt-2 pb-1">
              {activeSlides[lightboxIndex].caption}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
