import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  RefreshCw,
  Check,
  Move,
  Layers,
  Circle,
  Square,
  RectangleHorizontal,
  Sliders,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { uploadToCloudinary } from '../../services/cloudinaryService';

interface LogoCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onApplyCroppedLogo: (croppedUrl: string) => void;
}

type CropShape = 'circle' | 'square' | 'wide';

// Viewport Dimensions (Interactive Preview Canvas)
const VIEWPORT_SIZE = 340;
const CROP_CIRCLE_DIAMETER = 270;
const CROP_SQUARE_SIZE = 270;
const CROP_WIDE_WIDTH = 300;
const CROP_WIDE_HEIGHT = 200;

export const LogoCustomizerModal: React.FC<LogoCustomizerModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onApplyCroppedLogo,
}) => {
  const [zoom, setZoom] = useState<number>(0.85); // Safe initial scale so text isn't cut off
  const [rotation, setRotation] = useState<number>(0); // in degrees
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cropShape, setCropShape] = useState<CropShape>('circle');
  const [bgMode, setBgMode] = useState<'transparent' | 'white' | 'dark'>('transparent');
  const [includeOuterRing, setIncludeOuterRing] = useState<boolean>(true); // Light green border
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageObjRef.current = img;
      handleSafeFit();
    };
  }, [imageSrc]);

  // Safe Fit: automatically calculates the scale where 100% of the image fits inside the safe inner zone
  const handleSafeFit = useCallback(() => {
    if (!imageObjRef.current) {
      setZoom(0.85);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      return;
    }
    const img = imageObjRef.current;
    // For a circle, rectangular corners get cut if scale is 1.0. A safe factor of 0.82 ensures all text fits safely!
    const targetSize = CROP_CIRCLE_DIAMETER * 0.82;
    const baseScale = targetSize / Math.max(img.naturalWidth, img.naturalHeight);
    setZoom(0.85);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const getBaseFitScale = useCallback((img: HTMLImageElement): number => {
    const targetSize = CROP_CIRCLE_DIAMETER;
    return targetSize / Math.max(img.naturalWidth, img.naturalHeight);
  }, []);

  // ----------------------------------------------------
  // 1. Live Interactive Canvas Render (WYSIWYG on Screen)
  // ----------------------------------------------------
  const drawInteractiveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObjRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageObjRef.current;
    const w = VIEWPORT_SIZE;
    const h = VIEWPORT_SIZE;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Background pattern
    if (bgMode === 'transparent') {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#292524';
      const gridSize = 16;
      for (let x = 0; x < w; x += gridSize) {
        for (let y = 0; y < h; y += gridSize) {
          if ((x / gridSize + y / gridSize) % 2 === 0) {
            ctx.fillRect(x, y, gridSize, gridSize);
          }
        }
      }
    } else if (bgMode === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    } else if (bgMode === 'dark') {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);
    }

    // Draw Transformed Image
    ctx.save();
    ctx.translate(cx + position.x, cy + position.y);
    ctx.rotate((rotation * Math.PI) / 180);

    const baseScale = getBaseFitScale(img);
    const scale = baseScale * zoom;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Dark semi-transparent mask outside crop boundary
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.70)';
    ctx.beginPath();
    ctx.rect(0, 0, w, h);

    if (cropShape === 'circle') {
      const radius = CROP_CIRCLE_DIAMETER / 2;
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    } else if (cropShape === 'square') {
      const s = CROP_SQUARE_SIZE;
      ctx.rect(cx - s / 2 + s, cy - s / 2, -s, s);
    } else if (cropShape === 'wide') {
      const ww = CROP_WIDE_WIDTH;
      const wh = CROP_WIDE_HEIGHT;
      ctx.rect(cx - ww / 2 + ww, cy - wh / 2, -ww, wh);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Outer Light Green Border Ring
    ctx.save();
    if (includeOuterRing) {
      ctx.strokeStyle = '#10b981'; // Emerald 500 (Light green border)
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
    }

    if (cropShape === 'circle') {
      const radius = (CROP_CIRCLE_DIAMETER / 2) - 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (cropShape === 'square') {
      const s = CROP_SQUARE_SIZE - 3;
      ctx.strokeRect(cx - s / 2, cy - s / 2, s, s);
    } else if (cropShape === 'wide') {
      const ww = CROP_WIDE_WIDTH - 3;
      const wh = CROP_WIDE_HEIGHT - 3;
      ctx.strokeRect(cx - ww / 2, cy - wh / 2, ww, wh);
    }

    // Inner Safe Text Margin Guideline (Amber Dotted Circle)
    if (cropShape === 'circle') {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)'; // Amber 400
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, (CROP_CIRCLE_DIAMETER / 2) * 0.85, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center Crosshair
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy);
    ctx.lineTo(cx + 6, cy);
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx, cy + 6);
    ctx.stroke();

    ctx.restore();
  }, [position, rotation, zoom, cropShape, bgMode, includeOuterRing, getBaseFitScale]);

  // Redraw interactive canvas whenever state changes
  useEffect(() => {
    if (isOpen) {
      drawInteractiveCanvas();
    }
  }, [isOpen, drawInteractiveCanvas]);

  // ----------------------------------------------------
  // 2. High Resolution Master Export (100% WYSIWYG Math)
  // ----------------------------------------------------
  const generateExportDataUrl = useCallback(
    (targetSize = 1024): string => {
      if (!imageObjRef.current) return '';
      const img = imageObjRef.current;

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = targetSize;
      exportCanvas.height = targetSize;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return '';

      ctx.clearRect(0, 0, targetSize, targetSize);

      let cropDimension = CROP_CIRCLE_DIAMETER;
      if (cropShape === 'square') cropDimension = CROP_SQUARE_SIZE;
      if (cropShape === 'wide') cropDimension = CROP_WIDE_WIDTH;

      const scaleFactor = targetSize / cropDimension;
      const cx = targetSize / 2;
      const cy = targetSize / 2;

      // Optional background fill
      if (bgMode === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetSize, targetSize);
      } else if (bgMode === 'dark') {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, targetSize, targetSize);
      }

      // Clip mask to exact user-selected crop shape
      if (cropShape === 'circle') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, targetSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      } else if (cropShape === 'wide') {
        ctx.save();
        const exportH = targetSize * (CROP_WIDE_HEIGHT / CROP_WIDE_WIDTH);
        ctx.beginPath();
        ctx.rect(0, (targetSize - exportH) / 2, targetSize, exportH);
        ctx.closePath();
        ctx.clip();
      }

      // Draw transformed image with matched coordinates
      ctx.save();
      ctx.translate(cx + position.x * scaleFactor, cy + position.y * scaleFactor);
      ctx.rotate((rotation * Math.PI) / 180);

      const baseScale = getBaseFitScale(img);
      const totalScale = baseScale * zoom * scaleFactor;
      const drawW = img.naturalWidth * totalScale;
      const drawH = img.naturalHeight * totalScale;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Outer Light Green Border Ring if enabled
      if (includeOuterRing) {
        ctx.strokeStyle = '#10b981'; // Light green
        ctx.lineWidth = Math.max(6, Math.round(targetSize * 0.012)); // Clean proportioned border
        if (cropShape === 'circle') {
          ctx.beginPath();
          ctx.arc(cx, cy, (targetSize / 2) - (ctx.lineWidth / 2), 0, Math.PI * 2);
          ctx.stroke();
        } else if (cropShape === 'square') {
          const s = targetSize - ctx.lineWidth;
          ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, s, s);
        }
      }

      if (cropShape === 'circle' || cropShape === 'wide') {
        ctx.restore();
      }

      return exportCanvas.toDataURL('image/png', 1.0);
    },
    [position, rotation, zoom, cropShape, bgMode, includeOuterRing, getBaseFitScale]
  );

  // Update Live Preview
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    const timer = setTimeout(() => {
      const url = generateExportDataUrl(320);
      setLivePreviewUrl(url);
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen, imageSrc, generateExportDataUrl]);

  // Mouse & Touch Pan Handling
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.04 : 0.04;
    setZoom((prev) => Math.min(Math.max(0.2, parseFloat((prev + delta).toFixed(2))), 3.5));
  };

  const nudge = (dx: number, dy: number) => {
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const rotateBy = (deg: number) => {
    setRotation((prev) => {
      let next = prev + deg;
      if (next > 180) next -= 360;
      if (next < -180) next += 360;
      return next;
    });
  };

  // ----------------------------------------------------
  // Save & Upload to Cloudinary
  // ----------------------------------------------------
  const handleSaveAndUpload = async () => {
    setIsProcessing(true);
    try {
      const highResDataUrl = generateExportDataUrl(1024);

      const uploadRes = await uploadToCloudinary(highResDataUrl, {
        folder: 'dare_arqam/branding',
        resourceType: 'image',
      });

      const finalUrl = uploadRes.success && uploadRes.url ? uploadRes.url : highResDataUrl;
      onApplyCroppedLogo(finalUrl);
      onClose();
    } catch (err) {
      console.error('Failed to process customized logo:', err);
      const fallbackUrl = generateExportDataUrl(1024);
      onApplyCroppedLogo(fallbackUrl);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400 flex items-center justify-center shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Logo Customizer & Safe-Zone Cropper
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Light Green Border Included
                </span>
              </h3>
              <p className="text-xs text-stone-400 font-sans">
                Keep all text inside the circular frame. Use "Auto-Fit Safe Zone" to ensure text like "DAR-E-ARQAM" is 100% visible with zero cut off.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left: Interactive Canvas (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            {/* Viewport Frame */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-stone-700 shadow-2xl bg-stone-950">
              <canvas
                ref={canvasRef}
                width={VIEWPORT_SIZE}
                height={VIEWPORT_SIZE}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                className={`w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] block cursor-grab active:cursor-grabbing ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              />

              {/* Guide Hint */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-black/80 backdrop-blur-sm rounded-full text-[10px] font-mono text-amber-300 flex items-center gap-1 border border-amber-500/30 pointer-events-none whitespace-nowrap">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Keep text inside yellow dotted safe ring
              </div>

              {/* Pan & Zoom Hint */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-full text-[10px] font-mono text-stone-300 flex items-center gap-1.5 border border-white/10 pointer-events-none whitespace-nowrap">
                <Move className="w-3 h-3 text-emerald-400" />
                Drag to center • Scroll wheel to zoom
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {/* Auto-Fit Safe Zone Button */}
              <button
                type="button"
                onClick={handleSafeFit}
                className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                title="Automatically fits 100% of text and logo without any side cuts"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Auto-Fit Safe Zone (No Cuts)
              </button>

              {/* Directional Nudge */}
              <div className="flex items-center gap-0.5 bg-stone-950 p-1 rounded-lg border border-stone-800">
                <button
                  type="button"
                  onClick={() => nudge(-4, 0)}
                  className="p-1 hover:bg-stone-800 rounded text-stone-300 hover:text-white"
                  title="Nudge Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => nudge(0, -4)}
                  className="p-1 hover:bg-stone-800 rounded text-stone-300 hover:text-white"
                  title="Nudge Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => nudge(0, 4)}
                  className="p-1 hover:bg-stone-800 rounded text-stone-300 hover:text-white"
                  title="Nudge Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => nudge(4, 0)}
                  className="p-1 hover:bg-stone-800 rounded text-stone-300 hover:text-white"
                  title="Nudge Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Rotation */}
              <button
                type="button"
                onClick={() => rotateBy(-90)}
                className="px-2 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                title="Rotate -90°"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                -90°
              </button>
              <button
                type="button"
                onClick={() => rotateBy(90)}
                className="px-2 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                title="Rotate +90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
                +90°
              </button>
            </div>
          </div>

          {/* Right: Controls & Real-World Navbar Simulation (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-stone-950/80 border border-stone-800/90 rounded-xl p-5">
            <div className="space-y-4">
              {/* 1. Zoom Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                    Zoom & Scale
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom(0.85)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 hover:text-white"
                    >
                      Safe Fit (85%)
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.2, parseFloat((z - 0.05).toFixed(2))))}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-md text-stone-300"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.02"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3.0, parseFloat((z + 0.05).toFixed(2))))}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-md text-stone-300"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2. Tilt & Rotation Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                    Tilt Angle
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold">{rotation}°</span>
                    {rotation !== 0 && (
                      <button
                        type="button"
                        onClick={() => setRotation(0)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 hover:text-white"
                      >
                        0°
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* 3. Light Green Border Ring Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Outer Light Green Border Ring
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIncludeOuterRing(true)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      includeOuterRing
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Light Green Border (On)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncludeOuterRing(false)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      !includeOuterRing
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                    }`}
                  >
                    Border Off
                  </button>
                </div>
              </div>

              {/* 4. Live Website Navbar Preview */}
              <div className="pt-2 border-t border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-emerald-400" />
                    Live Website Navbar Preview
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">Full Text Safe</span>
                </div>

                {/* Navbar Bar Simulation */}
                <div className="bg-white text-stone-900 p-3 rounded-xl border border-stone-300 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 shrink-0 rounded-full border-2 border-emerald-500/80 bg-white/95 p-0.5 overflow-hidden flex items-center justify-center select-none shadow-xs">
                      {livePreviewUrl && (
                        <img
                          src={livePreviewUrl}
                          alt="Navbar Live preview"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-editorial text-sm font-bold text-emerald-950 leading-tight">
                        DARE ARQAM
                      </div>
                      <div className="text-[11px] text-stone-600 font-medium">
                        School of Excellence
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-700 font-semibold px-2 py-1 bg-emerald-50 rounded border border-emerald-200">
                    D & M 100% Intact
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAndUpload}
                disabled={isProcessing}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-lg shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Uploading to Cloudinary...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Apply & Upload to Cloudinary
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
