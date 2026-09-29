import React, { useState, useEffect, useRef } from 'react';
import { GallerySlide, GallerySettings } from '../../types';
import { 
  fetchHomepageGallery, 
  saveHomepageGallery, 
  DEFAULT_GALLERY_SETTINGS, 
  DEFAULT_GALLERY_SLIDES,
  HomepageGalleryState 
} from '../../services/firebaseService';
import { 
  Upload, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Save, 
  RotateCcw, 
  Image as ImageIcon,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ExternalLink,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface HomepageGalleryManagerProps {
  onSuccessNotification?: (msg: string) => void;
}

export const HomepageGalleryManager: React.FC<HomepageGalleryManagerProps> = ({
  onSuccessNotification
}) => {
  const [slides, setSlides] = useState<GallerySlide[]>(DEFAULT_GALLERY_SLIDES);
  const [settings, setSettings] = useState<GallerySettings>(DEFAULT_GALLERY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // New slide form state
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Campus Life');
  const [newCaption, setNewCaption] = useState('');
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Edit slide modal
  const [editingSlide, setEditingSlide] = useState<GallerySlide | null>(null);

  // Live preview interactive state
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewPaused, setPreviewPaused] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchHomepageGallery().then((data) => {
      if (isMounted) {
        setSlides(data.slides || DEFAULT_GALLERY_SLIDES);
        setSettings(data.settings || DEFAULT_GALLERY_SETTINGS);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Save changes to Firestore
  const handleSaveAll = async (newSlides = slides, newSettings = settings) => {
    setIsSaving(true);
    try {
      await saveHomepageGallery({
        slides: newSlides,
        settings: newSettings,
      });
      setSaveSuccess(true);
      if (onSuccessNotification) {
        onSuccessNotification('Homepage gallery synchronized to Firebase successfully!');
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save gallery:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Convert files to base64 data URLs
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingFiles(true);
    setUploadProgress(0);

    const newUploadedSlides: GallerySlide[] = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      const file = files[i];
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const newSlide: GallerySlide = {
          id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          url: base64,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          category: 'Campus Infrastructure',
          caption: 'Institutional facilities and scholastic activities at DAR - E - ARQAM.',
          order: slides.length + newUploadedSlides.length + 1,
          enabled: true,
          createdAt: new Date().toISOString(),
        };

        newUploadedSlides.push(newSlide);
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      } catch (err) {
        console.error('Error reading file:', err);
      }
    }

    const combined = [...slides, ...newUploadedSlides];
    setSlides(combined);
    setIsUploadingFiles(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Automatically persist to Firebase
    await handleSaveAll(combined, settings);
  };

  // Add slide via URL
  const handleAddViaUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    const newSlide: GallerySlide = {
      id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      url: newImageUrl.trim(),
      title: newTitle.trim() || 'Institutional Facility Showcase',
      category: newCategory.trim() || 'Campus Facilities',
      caption: newCaption.trim() || 'Modern academic and infrastructure facilities.',
      order: slides.length + 1,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...slides, newSlide];
    setSlides(updated);
    setNewImageUrl('');
    setNewTitle('');
    setNewCaption('');

    await handleSaveAll(updated, settings);
  };

  // Reordering helpers
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...slides];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;

    // Refresh order index
    const normalized = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(normalized);
    await handleSaveAll(normalized, settings);
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;
    const reordered = [...slides];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;

    const normalized = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(normalized);
    await handleSaveAll(normalized, settings);
  };

  // Toggle slide visibility
  const handleToggleEnable = async (id: string) => {
    const updated = slides.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSlides(updated);
    await handleSaveAll(updated, settings);
  };

  // Delete slide
  const handleDeleteSlide = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery photo?')) return;
    const updated = slides
      .filter(s => s.id !== id)
      .map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(updated);
    await handleSaveAll(updated, settings);
  };

  // Update slide details modal save
  const handleSaveEditedSlide = async () => {
    if (!editingSlide) return;
    const updated = slides.map(s => s.id === editingSlide.id ? editingSlide : s);
    setSlides(updated);
    setEditingSlide(null);
    await handleSaveAll(updated, settings);
  };

  // Update duration settings
  const handleIntervalChange = async (intervalMs: number) => {
    const newSettings = { ...settings, autoSlideInterval: intervalMs };
    setSettings(newSettings);
    await handleSaveAll(slides, newSettings);
  };

  // Reset to default institutional showcase
  const handleResetToDefaults = async () => {
    if (!confirm('Reset gallery to default institutional photos and settings?')) return;
    setSlides(DEFAULT_GALLERY_SLIDES);
    setSettings(DEFAULT_GALLERY_SETTINGS);
    await handleSaveAll(DEFAULT_GALLERY_SLIDES, DEFAULT_GALLERY_SETTINGS);
  };

  const activeCount = slides.filter(s => s.enabled).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#171852] via-[#20216B] to-[#292A86] border-2 border-[#D4AF37]/50 rounded-2xl p-5 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF000]/15 border border-[#FFF000]/40 text-[#FFF000] text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Realtime Firebase Showcase</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold text-white">
            Homepage Gallery Management
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 font-prose-serif max-w-xl">
            Upload unlimited institutional photos, reorder slides, adjust auto-slide timing, and publish changes in realtime to the public portal.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white border border-white/20 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset to default campus photos"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#FFF000] hover:bg-[#F5D900] text-[#171852] font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#171852] border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Saved & Live!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#171852]" />
                <span>Save & Sync Firebase</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Configuration & Timing Controls Card */}
      <div className="bg-[#0F1424] border border-[#263352] rounded-2xl p-5 sm:p-6 space-y-6 shadow-md">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-[#FFF000]" />
            <h3 className="font-editorial text-base sm:text-lg font-bold text-white">
              Gallery Carousel Preferences
            </h3>
          </div>
          <span className="text-xs font-mono text-[#D4AF37] font-semibold">
            {activeCount} Active Slide{activeCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Slide Duration Interval */}
          <div className="space-y-2.5 bg-[#161B30] p-4 rounded-xl border border-[#263352]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FFF000]" />
                <span>Auto-Slide Duration</span>
              </label>
              <span className="text-[11px] font-mono text-[#FFF000] font-bold">
                {settings.autoSlideInterval / 1000}s
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Select time duration before moving to the next image automatically.
            </p>
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { label: '3s', val: 3000 },
                { label: '4s', val: 4000 },
                { label: '5s', val: 5000 },
                { label: '7s', val: 7000 },
                { label: '10s', val: 10000 },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => handleIntervalChange(item.val)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    settings.autoSlideInterval === item.val
                      ? 'bg-[#FFF000] text-[#171852] shadow-sm ring-1 ring-[#FFF000]'
                      : 'bg-[#0F1424] text-stone-300 hover:text-white hover:bg-[#1E2540] border border-[#263352]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pause on Hover Option */}
          <div className="space-y-2.5 bg-[#161B30] p-4 rounded-xl border border-[#263352] flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                <Eye className="w-3.5 h-3.5 text-[#FFF000]" />
                <span>Pause on Hover & Touch</span>
              </label>
              <p className="text-[11px] text-stone-400">
                Temporarily pause rotation when visitor hovers or touches carousel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = { ...settings, pauseOnHover: !settings.pauseOnHover };
                setSettings(updated);
                handleSaveAll(slides, updated);
              }}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                settings.pauseOnHover
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/50'
                  : 'bg-stone-900 text-stone-400 border border-stone-800'
              }`}
            >
              <span>{settings.pauseOnHover ? 'Enabled (Recommended)' : 'Disabled'}</span>
              <span className={`w-2 h-2 rounded-full ${settings.pauseOnHover ? 'bg-emerald-400 animate-pulse' : 'bg-stone-600'}`} />
            </button>
          </div>

          {/* Controls & Indicator Visibility */}
          <div className="space-y-2.5 bg-[#161B30] p-4 rounded-xl border border-[#263352] flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-[#FFF000]" />
                <span>Navigation & Indicator Dots</span>
              </label>
              <p className="text-[11px] text-stone-400">
                Display interactive next/prev chevrons and progress dots.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const updated = { ...settings, showNavigation: !settings.showNavigation };
                  setSettings(updated);
                  handleSaveAll(slides, updated);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold cursor-pointer border ${
                  settings.showNavigation
                    ? 'bg-[#20216B] text-[#FFF000] border-[#D4AF37]/60'
                    : 'bg-[#0F1424] text-stone-400 border-[#263352]'
                }`}
              >
                Chevrons: {settings.showNavigation ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...settings, showIndicators: !settings.showIndicators };
                  setSettings(updated);
                  handleSaveAll(slides, updated);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold cursor-pointer border ${
                  settings.showIndicators
                    ? 'bg-[#20216B] text-[#FFF000] border-[#D4AF37]/60'
                    : 'bg-[#0F1424] text-stone-400 border-[#263352]'
                }`}
              >
                Dots: {settings.showIndicators ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Upload & Add Images Card */}
      <div className="bg-[#0F1424] border border-[#263352] rounded-2xl p-5 sm:p-6 space-y-6 shadow-md">
        <div className="border-b border-[#1E293B] pb-3">
          <h3 className="font-editorial text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#FFF000]" />
            <span>Upload Unlimited Images to Firebase</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Select one or multiple high-resolution photos from your computer or provide direct web image links.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drag & Drop Multi-file Uploader */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#D4AF37]/50 hover:border-[#FFF000] bg-[#161B30]/60 hover:bg-[#161B30] rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-[#20216B] group-hover:bg-[#2B2D8C] text-[#FFF000] border border-[#D4AF37]/50 flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-[#FFF000] transition-colors">
                Click or Drop Multiple Images Here
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Supports JPG, PNG, WEBP (No limit on number of images)
              </div>
            </div>

            {isUploadingFiles && (
              <div className="w-full max-w-xs space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-[#FFF000] font-mono">
                  <span>Processing batch...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFF000] transition-all duration-150"
                    style={{ width: `${uploadProgress || 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Direct URL Form */}
          <form onSubmit={handleAddViaUrl} className="bg-[#161B30] p-4 sm:p-5 rounded-2xl border border-[#263352] space-y-3.5">
            <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Or Add Image via Web / Cloud URL</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1">Image URL *</label>
              <input
                type="url"
                required
                placeholder="https://example.com/images/campus-event.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F1424] border border-[#263352] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-hidden focus:border-[#FFF000]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Slide Title</label>
                <input
                  type="text"
                  placeholder="e.g. Science Exhibition 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F1424] border border-[#263352] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-hidden focus:border-[#FFF000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Campus Facilities"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F1424] border border-[#263352] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-hidden focus:border-[#FFF000]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1">Caption Description</label>
              <input
                type="text"
                placeholder="Brief summary of what this photo depicts"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F1424] border border-[#263352] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-hidden focus:border-[#FFF000]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#20216B] hover:bg-[#2A2C8A] border border-[#D4AF37]/50 text-[#FFF000] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image to Gallery</span>
            </button>
          </form>
        </div>
      </div>

      {/* 4. Manage Uploaded Slides List (Reorder, Edit, Toggle, Delete) */}
      <div className="bg-[#0F1424] border border-[#263352] rounded-2xl p-5 sm:p-6 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
          <div>
            <h3 className="font-editorial text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FFF000]" />
              <span>Uploaded Slides ({slides.length} Photos)</span>
            </h3>
            <p className="text-xs text-stone-400">
              Use the arrow buttons to reorder slides. The order here matches the sequence on the public homepage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const allEnabled = slides.map(s => ({ ...s, enabled: true }));
                setSlides(allEnabled);
                handleSaveAll(allEnabled, settings);
              }}
              className="px-2.5 py-1 text-[11px] font-semibold bg-[#161B30] hover:bg-[#1E2540] text-emerald-400 border border-emerald-500/30 rounded-lg cursor-pointer"
            >
              Enable All
            </button>
            <button
              type="button"
              onClick={() => {
                const allDisabled = slides.map(s => ({ ...s, enabled: false }));
                setSlides(allDisabled);
                handleSaveAll(allDisabled, settings);
              }}
              className="px-2.5 py-1 text-[11px] font-semibold bg-[#161B30] hover:bg-[#1E2540] text-stone-400 border border-stone-700 rounded-lg cursor-pointer"
            >
              Disable All
            </button>
          </div>
        </div>

        {slides.length === 0 ? (
          <div className="p-8 text-center bg-[#161B30] rounded-xl border border-dashed border-[#263352] text-stone-400 text-xs">
            No gallery images found. Upload photos or click "Reset Defaults" above.
          </div>
        ) : (
          <div className="space-y-3">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  slide.enabled
                    ? 'bg-[#14192D] border-[#2A3756] hover:border-[#D4AF37]/60'
                    : 'bg-[#0E121E] border-[#1C2438] opacity-60'
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Order Badge & Reorder Arrows */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="w-6 h-6 rounded-md bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/50 text-xs font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        className="p-1 rounded bg-[#161B30] hover:bg-[#202642] text-stone-300 hover:text-[#FFF000] disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === slides.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        className="p-1 rounded bg-[#161B30] hover:bg-[#202642] text-stone-300 hover:text-[#FFF000] disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0">
                    <img
                      src={slide.url}
                      alt={slide.title || "Gallery thumbnail"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Text Details */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-editorial text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                        {slide.title || "Untitled Image"}
                      </h4>
                      {slide.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/40 font-semibold">
                          {slide.category}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        slide.enabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' : 'bg-stone-800 text-stone-400'
                      }`}>
                        {slide.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-300 font-prose-serif line-clamp-1">
                      {slide.caption || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleEnable(slide.id)}
                    className={`p-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      slide.enabled
                        ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/40'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                    }`}
                    title={slide.enabled ? "Hide from public homepage" : "Show on public homepage"}
                  >
                    {slide.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingSlide(slide)}
                    className="px-3 py-1.5 rounded-lg bg-[#20216B] hover:bg-[#2A2C8A] border border-[#D4AF37]/40 text-[#FFF000] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Edit Info
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition-colors cursor-pointer"
                    title="Delete image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Live Simulator in Admin Console */}
      {slides.filter(s => s.enabled).length > 0 && (
        <div className="bg-[#0F1424] border border-[#263352] rounded-2xl p-5 sm:p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 className="font-editorial text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FFF000]" />
              <span>Realtime Live Carousel Simulator</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-600/40 font-bold">
              Synced with Public Website
            </span>
          </div>

          <div className="relative h-60 sm:h-80 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 bg-black shadow-inner flex flex-col justify-between">
            {(() => {
              const active = slides.filter(s => s.enabled);
              const cur = active[previewIndex % active.length] || active[0];
              if (!cur) return null;
              return (
                <div className="relative w-full h-full flex flex-col justify-between">
                  <img
                    src={cur.url}
                    alt={cur.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Header Tag */}
                  <div className="relative z-10 p-3 flex items-center justify-between">
                    {cur.category && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#171852]/90 backdrop-blur-md text-[#FFF000] border border-[#D4AF37]/40 font-bold uppercase">
                        {cur.category}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-black/60 text-stone-300 text-[10px] font-mono">
                      {previewIndex + 1} / {active.length}
                    </span>
                  </div>

                  {/* Bottom Minimal Title & Chevrons */}
                  <div className="relative z-10 p-3 sm:p-4 text-white flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-editorial text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
                        {cur.title || "Campus Facility Showcase"}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewIndex(prev => (prev - 1 + active.length) % active.length)}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 cursor-pointer"
                        aria-label="Previous preview"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewIndex(prev => (prev + 1) % active.length)}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 cursor-pointer"
                        aria-label="Next preview"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Indicator Dots */}
                  <div className="relative z-10 py-1.5 bg-black/50 backdrop-blur-xs border-t border-white/10 flex items-center justify-center gap-1.5">
                    {active.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          previewIndex === idx ? 'w-5 bg-[#FFF000]' : 'w-1.5 bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 6. Edit Slide Modal */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111628] border-2 border-[#D4AF37]/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 text-white">
            <div className="flex items-center justify-between border-b border-[#263352] pb-3">
              <h3 className="font-editorial text-lg font-bold text-[#FFF000]">
                Edit Slide Metadata
              </h3>
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Slide Title</label>
                <input
                  type="text"
                  value={editingSlide.title || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F1424] border border-[#263352] rounded-xl text-white focus:outline-hidden focus:border-[#FFF000]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category Badge</label>
                <input
                  type="text"
                  value={editingSlide.category || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F1424] border border-[#263352] rounded-xl text-white focus:outline-hidden focus:border-[#FFF000]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Caption / Summary</label>
                <textarea
                  rows={3}
                  value={editingSlide.caption || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, caption: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F1424] border border-[#263352] rounded-xl text-white focus:outline-hidden focus:border-[#FFF000]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#263352]">
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedSlide}
                className="px-5 py-2 rounded-xl bg-[#FFF000] hover:bg-[#F5D900] text-[#171852] font-bold text-xs cursor-pointer shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
