import React, { useState, useEffect } from 'react';
import { PageId, Notice, StudentResult } from '../types';
import { Emblem } from '../components/Emblem';
import { useBranding } from '../context/BrandingContext';
import { 
  ShieldCheck, 
  LogOut, 
  Globe, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Award, 
  Users, 
  MessageSquare, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Save, 
  Lock, 
  Check, 
  X, 
  Layers, 
  ExternalLink,
  Eye,
  Crop,
  Sliders
} from 'lucide-react';
import { 
  getCurrentAdminSession, 
  logoutAdminSession, 
  changeAdminPassword, 
  getActiveAdminCredentials,
  adminFetchAllNotices,
  adminCreateNotice,
  adminUpdateNotice,
  adminDeleteNotice,
  adminFetchAllResults,
  adminCreateResult,
  adminUpdateResult,
  adminDeleteResult,
  adminFetchAdmissions,
  adminUpdateAdmissionStatus,
  adminFetchInquiries,
  adminUpdateInquiryStatus,
  AdmissionApplicationRecord,
  InquiryRecord
} from '../services/adminService';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { LogoCustomizerModal } from '../components/admin/LogoCustomizerModal';

interface AdminDashboardViewProps {
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
}

type AdminTab = 'branding' | 'notices' | 'results' | 'admissions' | 'inquiries' | 'security';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate, onLogout }) => {
  const { logoUrl, updateLogo, resetLogo, institutionName, tagline, updateBrandingDetails } = useBranding();
  
  const [currentTab, setCurrentTab] = useState<AdminTab>('branding');
  const [adminUser, setAdminUser] = useState(() => getCurrentAdminSession());

  // Global notification banner in admin console
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // ----------------------------------------------------
  // Tab 1: Logo & Branding State
  // ----------------------------------------------------
  const [tempLogoUrl, setTempLogoUrl] = useState<string>(logoUrl || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [tempInstName, setTempInstName] = useState(institutionName);
  const [tempTagline, setTempTagline] = useState(tagline);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerImageSrc, setCustomizerImageSrc] = useState<string>('');

  // Preset logo options for quick institutional selection
  const PRESET_LOGOS = [
    {
      name: 'Dare Arqam Gold Seal',
      desc: 'High-res golden institutional round crest',
      url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=85',
    },
    {
      name: 'Islamic Classical Emblem',
      desc: 'Deep emerald & calligraphy monogram',
      url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=300&q=85',
    },
    {
      name: 'Modern Academic Insignia',
      desc: 'Geometric laurel & open book medallion',
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=300&q=85',
    }
  ];

  // ----------------------------------------------------
  // Tab 2: Notices Management State
  // ----------------------------------------------------
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoadingNotices, setIsLoadingNotices] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [noticeFormData, setNoticeFormData] = useState({
    title: '',
    refNo: '',
    category: 'Academic' as Notice['category'],
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    summary: '',
    fullText: '',
    isImportant: false,
    issuedBy: 'Directorate of Academics & Examination',
  });

  // ----------------------------------------------------
  // Tab 3: Results Management State
  // ----------------------------------------------------
  const [resultsList, setResultsList] = useState<StudentResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [editingResult, setEditingResult] = useState<StudentResult | null>(null);
  const [resultSearchQuery, setResultSearchQuery] = useState('');
  const [resultFormData, setResultFormData] = useState({
    studentName: '',
    rollNumber: '',
    studentId: '',
    fatherName: '',
    examination: 'Annual Examination',
    session: '2025–2026',
    examDate: 'March 2026',
    className: 'Class X (Matriculation)',
    section: 'Section A (Science)',
    totalMarks: 550,
    obtainedMarks: 480,
    percentage: 87.2,
    overallGrade: 'A-One (Outstanding)',
    resultStatus: 'PASS - FIRST DIVISION' as StudentResult['resultStatus'],
  });

  // ----------------------------------------------------
  // Tab 4: Admissions Applications State
  // ----------------------------------------------------
  const [admissions, setAdmissions] = useState<AdmissionApplicationRecord[]>([]);
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(false);

  // ----------------------------------------------------
  // Tab 5: Inquiries State
  // ----------------------------------------------------
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);

  // ----------------------------------------------------
  // Tab 6: Security & Password State
  // ----------------------------------------------------
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [activeAdminEmail, setActiveAdminEmail] = useState('Darearqam@mardan.com');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Sync tempLogoUrl if logoUrl changes from context
  useEffect(() => {
    setTempLogoUrl(logoUrl || '');
  }, [logoUrl]);

  // Load active admin credentials on mount
  useEffect(() => {
    getActiveAdminCredentials().then(c => {
      setActiveAdminEmail(c.email);
    }).catch(() => {});
  }, []);

  // Fetch data on tab change
  useEffect(() => {
    if (currentTab === 'notices') {
      loadNotices();
    } else if (currentTab === 'results') {
      loadResults();
    } else if (currentTab === 'admissions') {
      loadAdmissions();
    } else if (currentTab === 'inquiries') {
      loadInquiries();
    }
  }, [currentTab]);

  const loadNotices = async () => {
    setIsLoadingNotices(true);
    const data = await adminFetchAllNotices();
    setNotices(data);
    setIsLoadingNotices(false);
  };

  const loadResults = async () => {
    setIsLoadingResults(true);
    const data = await adminFetchAllResults();
    setResultsList(data);
    setIsLoadingResults(false);
  };

  const loadAdmissions = async () => {
    setIsLoadingAdmissions(true);
    const data = await adminFetchAdmissions();
    setAdmissions(data);
    setIsLoadingAdmissions(false);
  };

  const loadInquiries = async () => {
    setIsLoadingInquiries(true);
    const data = await adminFetchInquiries();
    setInquiries(data);
    setIsLoadingInquiries(false);
  };

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // ----------------------------------------------------
  // Logo Upload & Customizer (Zoom / Rotate / Tilt / Crop & Cloudinary CDN)
  // ----------------------------------------------------
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 12MB for high resolution raw image)
    if (file.size > 12 * 1024 * 1024) {
      showNotification('error', 'File size exceeds 12MB limit. Please upload an image under 12MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomizerImageSrc(result);
        setIsCustomizerOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleOpenCustomizer = (srcToEdit?: string) => {
    const targetSrc = srcToEdit || tempLogoUrl;
    if (!targetSrc) {
      showNotification('info', 'Please select or upload an image file first.');
      return;
    }
    setCustomizerImageSrc(targetSrc);
    setIsCustomizerOpen(true);
  };

  const handleApplyCustomizedLogo = (croppedUrl: string) => {
    setTempLogoUrl(croppedUrl);
    showNotification('success', 'Customized logo saved to Cloudinary CDN! Click "Save & Apply Website-Wide" to publish.');
  };

  const handleApplyLogo = async () => {
    if (!tempLogoUrl.trim()) {
      showNotification('error', 'Please upload or specify a logo first.');
      return;
    }
    await updateLogo(tempLogoUrl);
    await updateBrandingDetails(tempInstName, tempTagline);
    showNotification('success', 'Custom institutional logo updated and published website-wide in high resolution!');
  };

  const handleResetToDefaultLogo = async () => {
    await resetLogo();
    setTempLogoUrl('');
    showNotification('info', 'Institutional logo restored to default vector emblem.');
  };

  // ----------------------------------------------------
  // Notice Form Actions
  // ----------------------------------------------------
  const openNewNoticeModal = () => {
    setEditingNotice(null);
    setNoticeFormData({
      title: '',
      refNo: `DA/DIR/2026-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Academic',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      summary: '',
      fullText: '',
      isImportant: false,
      issuedBy: 'Directorate of Academics & Examination',
    });
    setShowNoticeModal(true);
  };

  const openEditNoticeModal = (notice: Notice) => {
    setEditingNotice(notice);
    setNoticeFormData({
      title: notice.title,
      refNo: notice.refNo,
      category: notice.category,
      date: notice.date,
      summary: notice.summary,
      fullText: notice.fullText,
      isImportant: !!notice.isImportant,
      issuedBy: notice.issuedBy,
    });
    setShowNoticeModal(true);
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeFormData.title || !noticeFormData.summary) {
      showNotification('error', 'Please fill in notice title and summary.');
      return;
    }

    try {
      if (editingNotice) {
        await adminUpdateNotice(editingNotice.id, noticeFormData);
        showNotification('success', 'Notice circular updated successfully.');
      } else {
        await adminCreateNotice({
          ...noticeFormData,
          fileSize: '160 KB',
        });
        showNotification('success', 'New institutional notice published successfully.');
      }
      setShowNoticeModal(false);
      await loadNotices();
    } catch (err: any) {
      showNotification('error', err?.message || 'Error saving notice.');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this official notice?')) return;
    try {
      await adminDeleteNotice(id);
      showNotification('success', 'Notice deleted successfully.');
      await loadNotices();
    } catch (e: any) {
      showNotification('error', e?.message || 'Failed to delete notice.');
    }
  };

  // ----------------------------------------------------
  // Result Actions
  // ----------------------------------------------------
  const openNewResultModal = () => {
    setEditingResult(null);
    setResultFormData({
      studentName: '',
      rollNumber: String(849200 + Math.floor(Math.random() * 500)),
      studentId: `DA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      fatherName: '',
      examination: 'Annual Examination',
      session: '2025–2026',
      examDate: 'March 2026',
      className: 'Class X (Matriculation)',
      section: 'Section A (Science)',
      totalMarks: 550,
      obtainedMarks: 480,
      percentage: 87.2,
      overallGrade: 'A-One (Outstanding)',
      resultStatus: 'PASS - FIRST DIVISION',
    });
    setShowResultModal(true);
  };

  const openEditResultModal = (res: StudentResult) => {
    setEditingResult(res);
    setResultFormData({
      studentName: res.studentName,
      rollNumber: res.rollNumber,
      studentId: res.studentId,
      fatherName: res.fatherName,
      examination: res.examination || 'Annual Examination',
      session: res.session || '2025–2026',
      examDate: res.examDate || 'March 2026',
      className: res.className,
      section: res.section,
      totalMarks: res.totalMarks,
      obtainedMarks: res.obtainedMarks,
      percentage: res.percentage,
      overallGrade: res.overallGrade || 'A-One (Outstanding)',
      resultStatus: res.resultStatus || 'PASS - FIRST DIVISION',
    });
    setShowResultModal(true);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultFormData.studentName || !resultFormData.rollNumber) {
      showNotification('error', 'Student name and Roll Number are required.');
      return;
    }

    const calculatedPercentage = parseFloat(((resultFormData.obtainedMarks / resultFormData.totalMarks) * 100).toFixed(1));
    const resultDocId = editingResult?.id || `res-${resultFormData.rollNumber}`;
    const finalResult: StudentResult = {
      id: resultDocId,
      studentName: resultFormData.studentName,
      rollNumber: resultFormData.rollNumber,
      studentId: resultFormData.studentId,
      fatherName: resultFormData.fatherName,
      examination: resultFormData.examination,
      session: resultFormData.session,
      examDate: resultFormData.examDate,
      className: resultFormData.className,
      section: resultFormData.section,
      totalMarks: resultFormData.totalMarks,
      obtainedMarks: resultFormData.obtainedMarks,
      percentage: calculatedPercentage,
      overallGrade: resultFormData.overallGrade,
      resultStatus: resultFormData.resultStatus,
      subjects: [
        { name: 'Nazra Quran & Tajweed', totalMarks: 50, obtainedMarks: 48, grade: 'A-1', status: 'Pass' },
        { name: 'Urdu Literature', totalMarks: 100, obtainedMarks: 86, grade: 'A-1', status: 'Pass' },
        { name: 'English Language', totalMarks: 100, obtainedMarks: 84, grade: 'A', status: 'Pass' },
        { name: 'Mathematics (Advanced)', totalMarks: 100, obtainedMarks: 94, grade: 'A-1', status: 'Pass' },
        { name: 'General Science', totalMarks: 100, obtainedMarks: 88, grade: 'A-1', status: 'Pass' },
        { name: 'Pakistan Studies', totalMarks: 50, obtainedMarks: 45, grade: 'A-1', status: 'Pass' },
      ],
      remarks: 'Certified official examination record issued by the Directorate Controller of Examinations.',
    };

    try {
      if (editingResult && editingResult.id) {
        await adminUpdateResult(editingResult.id, finalResult);
        showNotification('success', 'Student examination record updated.');
      } else {
        await adminCreateResult(finalResult);
        showNotification('success', `New examination result added for Roll No. ${finalResult.rollNumber}`);
      }
      setShowResultModal(false);
      await loadResults();
    } catch (err: any) {
      showNotification('error', err?.message || 'Error saving result.');
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!window.confirm('Delete this examination record?')) return;
    try {
      await adminDeleteResult(id);
      showNotification('success', 'Examination record deleted.');
      await loadResults();
    } catch (e: any) {
      showNotification('error', e?.message || 'Failed to delete record.');
    }
  };

  // ----------------------------------------------------
  // Password Change
  // ----------------------------------------------------
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPasswordInput) {
      showNotification('error', 'Please enter your current administrator password.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      showNotification('error', 'New password and confirmation do not match.');
      return;
    }
    if (newPasswordInput.length < 6) {
      showNotification('error', 'New password must be at least 6 characters long.');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changeAdminPassword(currentPasswordInput, newPasswordInput);
      if (res.success) {
        showNotification('success', res.message);
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
      } else {
        showNotification('error', res.message);
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update administrator password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleAdminLogout = () => {
    logoutAdminSession();
    onLogout();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* 1. Executive Top Bar (Distinct Institutional Look) */}
      <header className="bg-stone-900 border-b border-stone-800 sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Emblem + Directorate Header */}
          <div className="flex items-center gap-3">
            <Emblem size="md" className="ring-2 ring-emerald-600/70" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-lg sm:text-xl font-bold tracking-tight text-white">
                  DARE ARQAM
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  DIRECTORATE CONSOLE
                </span>
              </div>
              <div className="text-[11px] text-stone-400 font-mono hidden sm:block">
                Directorate Executive Management Panel
              </div>
            </div>
          </div>

          {/* Right: Quick actions (View Site & Logout) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open Public Website"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">View Public Website</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="px-3 py-1.5 text-xs font-semibold text-red-200 hover:text-white bg-red-950/70 hover:bg-red-900 border border-red-800/80 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Feedback Notification Toast */}
      {feedback && (
        <div className="fixed top-16 right-4 z-50 max-w-md animate-in slide-in-from-top-2">
          <div
            className={`p-4 rounded-lg shadow-xl border text-xs sm:text-sm flex items-start gap-3 ${
              feedback.type === 'success'
                ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
                : feedback.type === 'error'
                ? 'bg-red-950 border-red-700 text-red-200'
                : 'bg-stone-900 border-stone-700 text-stone-200'
            }`}
          >
            {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {feedback.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {feedback.type === 'info' && <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />}
            <span className="leading-snug">{feedback.text}</span>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Layout (Tab Bar + Content) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-stone-900 p-1.5 rounded-xl border border-stone-800 flex flex-wrap gap-1">
          <button
            onClick={() => setCurrentTab('branding')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'branding'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-300" />
            <span>Custom Logo & Branding</span>
          </button>

          <button
            onClick={() => setCurrentTab('notices')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'notices'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-300" />
            <span>Notices & Circulars</span>
          </button>

          <button
            onClick={() => setCurrentTab('results')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'results'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-300" />
            <span>Examination Results</span>
          </button>

          <button
            onClick={() => setCurrentTab('admissions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'admissions'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-300" />
            <span>Admissions Applications</span>
          </button>

          <button
            onClick={() => setCurrentTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'inquiries'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span>Public Inquiries</span>
          </button>

          <button
            onClick={() => setCurrentTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'security'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <KeyRound className="w-4 h-4 text-emerald-300" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: CUSTOM LOGO & BRANDING MANAGEMENT */}
        {/* ========================================================================= */}
        {currentTab === 'branding' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">
                    INSTITUTIONAL IDENTITY & MEDIA CLOUD
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                    Custom Logo & Cloudinary Storage
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif leading-relaxed">
                    Upload an ultra-high quality emblem image to be displayed across the entire website (Header, Hamburger Menu, Footer, Student Portal, Verification, and Results).
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/80 border border-emerald-700/60 rounded-lg text-emerald-300 text-xs shrink-0 font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Cloudinary Storage: <strong>ehc1fewm</strong></span>
                </div>
              </div>

              {/* Upload & Input Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Upload and URL controls */}
                <div className="lg:col-span-7 space-y-5">
                  {/* File Upload Box */}
                  <div className="border-2 border-dashed border-stone-700 hover:border-emerald-500 rounded-xl p-6 text-center transition-colors bg-stone-950/60 relative">
                    <input
                      type="file"
                      id="logo-file-input"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                    <label 
                      htmlFor="logo-file-input"
                      className="cursor-pointer block space-y-3"
                    >
                      <div className="w-14 h-14 bg-emerald-950 border border-emerald-700 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-emerald-400 hover:underline">
                          Click here to upload logo & launch visual customizer
                        </span>
                        <p className="text-[11px] text-stone-500 mt-1 font-mono">
                          Live Zoom In/Out, Pan/Drag, 360° Tilt/Rotate & Circular/Square Crop
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Or Enter Direct Logo Image URL */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                        Or Enter Image Web URL (High-Res CDN or Cloud Image)
                      </label>
                      {tempLogoUrl && (
                        <button
                          type="button"
                          onClick={() => handleOpenCustomizer(tempLogoUrl)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                        >
                          <Crop className="w-3.5 h-3.5" />
                          <span>Customize & Crop Image</span>
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://your-domain.com/official-logo.png"
                        value={tempLogoUrl}
                        onChange={(e) => setTempLogoUrl(e.target.value)}
                        className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-950 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      {tempLogoUrl && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenCustomizer(tempLogoUrl)}
                            className="px-3 py-2 text-xs text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 rounded-lg flex items-center gap-1.5 font-semibold"
                            title="Open interactive zoom/rotate/crop editor"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Crop / Tilt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTempLogoUrl('')}
                            className="px-3 py-2 text-xs text-stone-400 hover:text-white bg-stone-800 rounded-lg"
                          >
                            Clear
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Institution Title & Tagline update */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                        Institution Name
                      </label>
                      <input
                        type="text"
                        value={tempInstName}
                        onChange={(e) => setTempInstName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-950 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                        Tagline / Subtitle
                      </label>
                      <input
                        type="text"
                        value={tempTagline}
                        onChange={(e) => setTempTagline(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-950 text-white"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleApplyLogo}
                      className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-lg shadow-emerald-950 flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Apply Website-Wide</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetToDefaultLogo}
                      className="px-4 py-2.5 text-xs font-medium text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Reset to Default Vector Emblem
                    </button>
                  </div>
                </div>

                {/* Right: Live Preview Panel in Multiple Sizes */}
                <div className="lg:col-span-5 bg-stone-950 border border-stone-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <span className="text-xs font-mono font-bold text-stone-300 uppercase">
                      Live High-Quality Preview
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {tempLogoUrl ? 'Custom Image Active' : 'Default Vector'}
                    </span>
                  </div>

                  {/* Primary Large Preview */}
                  <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-3 relative group">
                    <Emblem size="xl" customSrc={tempLogoUrl || null} className="shadow-lg" />
                    <div>
                      <div className="font-editorial text-lg font-bold text-white">
                        {tempInstName}
                      </div>
                      <div className="text-xs text-stone-400">
                        {tempTagline}
                      </div>
                    </div>
                    {tempLogoUrl && (
                      <button
                        type="button"
                        onClick={() => handleOpenCustomizer(tempLogoUrl)}
                        className="mt-2 px-3 py-1.5 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-700/60 rounded-lg text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow transition-all"
                      >
                        <Crop className="w-3.5 h-3.5" />
                        <span>Zoom / Rotate / Crop Live</span>
                      </button>
                    )}
                  </div>

                  {/* Multi-Size Rendering Simulation */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                      Rendering Across Key Components:
                    </div>
                    <div className="space-y-2 text-xs">
                      {/* Header Simulation */}
                      <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Emblem size="md" customSrc={tempLogoUrl || null} />
                          <div>
                            <div className="font-bold text-white text-xs">{tempInstName}</div>
                            <div className="text-[10px] text-stone-400">Header Display</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-stone-500">44px (md)</span>
                      </div>

                      {/* Hamburger & Modals Simulation */}
                      <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Emblem size="sm" customSrc={tempLogoUrl || null} />
                          <div>
                            <div className="font-bold text-white text-xs">{tempInstName}</div>
                            <div className="text-[10px] text-stone-400">Hamburger Menu Display</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-stone-500">32px (sm)</span>
                      </div>
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="pt-2 border-t border-stone-800 space-y-2">
                    <span className="text-[11px] font-mono text-stone-400 block">
                      Quick Institutional Presets:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_LOGOS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTempLogoUrl(preset.url)}
                          className="p-1.5 rounded-md bg-stone-900 hover:bg-stone-800 border border-stone-700 text-center space-y-1 transition-all group"
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-10 h-10 object-cover rounded-full mx-auto border border-emerald-600/50"
                          />
                          <div className="text-[10px] text-stone-300 font-medium truncate">
                            {preset.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: NOTICES & CIRCULARS MANAGEMENT */}
        {/* ========================================================================= */}
        {currentTab === 'notices' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">
                    PUBLIC CIRCULARS & NOTIFICATIONS
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                    Notice Board Management
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif">
                    Publish, edit, or archive official academic notices, datesheets, and administrative circulars.
                  </p>
                </div>

                <button
                  onClick={openNewNoticeModal}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue New Notice</span>
                </button>
              </div>

              {/* Notices Table */}
              <div className="overflow-x-auto rounded-lg border border-stone-800">
                <table className="w-full text-left text-xs sm:text-sm text-stone-300">
                  <thead className="bg-stone-950 text-stone-400 uppercase text-[11px] font-mono border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Ref Number</th>
                      <th className="py-3 px-4">Title & Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Importance</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 bg-stone-900/60 font-prose-serif">
                    {isLoadingNotices ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-500 font-mono">
                          Loading institutional notices...
                        </td>
                      </tr>
                    ) : notices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-500 font-mono">
                          No circulars found. Click "Issue New Notice" to add one.
                        </td>
                      </tr>
                    ) : (
                      notices.map((n) => (
                        <tr key={n.id} className="hover:bg-stone-800/60 transition-colors">
                          <td className="py-3 px-4 font-mono text-emerald-400 font-medium">
                            {n.refNo}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{n.title}</div>
                            <div className="text-xs text-stone-400 line-clamp-1">{n.summary}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">
                            <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                              {n.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-stone-400 font-mono text-xs">
                            {n.date}
                          </td>
                          <td className="py-3 px-4">
                            {n.isImportant ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                PINNED / URGENT
                              </span>
                            ) : (
                              <span className="text-stone-500 text-[11px] font-mono">Normal</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => openEditNoticeModal(n)}
                              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors cursor-pointer"
                              title="Edit Notice"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNotice(n.id)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded transition-colors cursor-pointer"
                              title="Delete Notice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EXAMINATION RESULTS MANAGEMENT */}
        {/* ========================================================================= */}
        {currentTab === 'results' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">
                    CONTROLLER OF EXAMINATIONS
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                    Examination Results Management
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif">
                    Add and maintain student academic report cards, marks sheets, and grade records searchable by roll number.
                  </p>
                </div>

                <button
                  onClick={openNewResultModal}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Student Result Record</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by Student Name or Roll Number..."
                  value={resultSearchQuery}
                  onChange={(e) => setResultSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-950 text-white placeholder-stone-500"
                />
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto rounded-lg border border-stone-800">
                <table className="w-full text-left text-xs sm:text-sm text-stone-300">
                  <thead className="bg-stone-950 text-stone-400 uppercase text-[11px] font-mono border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Student & Father Name</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Obtained / Total</th>
                      <th className="py-3 px-4">Grade & Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 bg-stone-900/60 font-prose-serif">
                    {isLoadingResults ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-500 font-mono">
                          Loading examination records...
                        </td>
                      </tr>
                    ) : resultsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-500 font-mono">
                          No results found. Click "Add Student Result Record" to create one.
                        </td>
                      </tr>
                    ) : (
                      resultsList
                        .filter(r => 
                          !resultSearchQuery || 
                          r.studentName?.toLowerCase().includes(resultSearchQuery.toLowerCase()) ||
                          r.rollNumber?.includes(resultSearchQuery)
                        )
                        .map((res) => (
                          <tr key={res.id || res.rollNumber} className="hover:bg-stone-800/60 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                              {res.rollNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{res.studentName}</div>
                              <div className="text-xs text-stone-400">S/O {res.fatherName}</div>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs">
                              {res.className}
                            </td>
                            <td className="py-3 px-4 font-mono text-xs">
                              <span className="font-bold text-white">{res.obtainedMarks}</span> / {res.totalMarks} ({res.percentage}%)
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                {res.overallGrade || 'A'} · {res.resultStatus || 'PASS'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => openEditResultModal(res)}
                                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors cursor-pointer"
                                title="Edit Result"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteResult(res.id || res.rollNumber)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded transition-colors cursor-pointer"
                                title="Delete Result"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ADMISSIONS APPLICATIONS REVIEW */}
        {/* ========================================================================= */}
        {currentTab === 'admissions' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">
                  DIRECTORATE OF ADMISSIONS & ENROLLMENT
                </span>
                <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                  Admissions Applications Management
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif">
                  Review applicant dossiers submitted through the online admission portal. Update eligibility and enrollment approvals.
                </p>
              </div>

              {/* Applications List */}
              <div className="overflow-x-auto rounded-lg border border-stone-800">
                <table className="w-full text-left text-xs sm:text-sm text-stone-300">
                  <thead className="bg-stone-950 text-stone-400 uppercase text-[11px] font-mono border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Ref Number</th>
                      <th className="py-3 px-4">Candidate & Father</th>
                      <th className="py-3 px-4">Target Class</th>
                      <th className="py-3 px-4">Guardian Contact</th>
                      <th className="py-3 px-4">Application Status</th>
                      <th className="py-3 px-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 bg-stone-900/60 font-prose-serif">
                    {isLoadingAdmissions ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-500 font-mono">
                          Loading admission records...
                        </td>
                      </tr>
                    ) : admissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-500 font-mono">
                          No admission applications received yet.
                        </td>
                      </tr>
                    ) : (
                      admissions.map((adm) => (
                        <tr key={adm.id} className="hover:bg-stone-800/60 transition-colors">
                          <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                            {adm.applicationRef}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{adm.candidateName}</div>
                            <div className="text-xs text-stone-400">{adm.fatherName}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">
                            {adm.targetClass}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono">
                            <div>{adm.parentPhone}</div>
                            <div className="text-stone-400 text-[11px]">{adm.parentEmail}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span 
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                adm.status === 'APPROVED'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : adm.status === 'REJECTED'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {adm.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <select
                              value={adm.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as any;
                                await adminUpdateAdmissionStatus(adm.id, newStatus);
                                showNotification('success', `Status updated to ${newStatus}`);
                                await loadAdmissions();
                              }}
                              className="px-2 py-1 text-xs border border-stone-700 bg-stone-950 text-white rounded cursor-pointer font-mono"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="UNDER REVIEW">UNDER REVIEW</option>
                              <option value="INTERVIEW SCHEDULED">INTERVIEW SCHEDULED</option>
                              <option value="APPROVED">APPROVED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PUBLIC INQUIRIES MANAGEMENT */}
        {/* ========================================================================= */}
        {currentTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">
                  PUBLIC SECRETARIAT & HELPDESK
                </span>
                <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                  Public Inquiries Management
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif">
                  Messages, admissions queries, and institutional correspondence received from the public Contact page.
                </p>
              </div>

              <div className="space-y-3">
                {isLoadingInquiries ? (
                  <div className="p-8 text-center text-stone-500 font-mono text-xs">
                    Loading inquiries...
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="p-8 text-center text-stone-500 font-mono text-xs">
                    No active inquiries in secretariat queue.
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <div 
                      key={inq.id}
                      className="bg-stone-950 border border-stone-800 rounded-lg p-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{inq.name}</span>
                            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                              {inq.inquiryId}
                            </span>
                          </div>
                          <div className="text-xs text-stone-400 font-mono mt-0.5">
                            {inq.email} · {inq.phone} · Category: <span className="text-stone-300">{inq.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-400">Status:</span>
                          <select
                            value={inq.status}
                            onChange={async (e) => {
                              await adminUpdateInquiryStatus(inq.id, e.target.value);
                              showNotification('success', 'Inquiry status updated.');
                              await loadInquiries();
                            }}
                            className="px-2 py-1 text-xs border border-stone-700 bg-stone-900 text-white rounded font-mono"
                          >
                            <option value="Received / Pending">Received / Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Replied">Replied</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </div>
                      </div>

                      <div className="text-xs text-stone-300 font-prose-serif leading-relaxed">
                        <div className="font-bold text-stone-200 mb-1">{inq.subject}</div>
                        <p>{inq.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SECURITY & PASSWORD CHANGE */}
        {/* ========================================================================= */}
        {currentTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">
                  EXECUTIVE ACCESS SECURITY
                </span>
                <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                  Change Admin Password
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif">
                  You can modify your administrator credentials at any time. Changes take effect immediately for all subsequent login sessions.
                </p>
              </div>

              {/* Active Admin Details Banner */}
              <div className="bg-stone-950 border border-stone-800 rounded-lg p-4 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs text-stone-400">Current Administrator Identity:</div>
                  <div className="font-mono text-sm font-bold text-emerald-300">
                    {activeAdminEmail}
                  </div>
                </div>
              </div>

              {/* Password Form */}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password (Default: Hasnainqadir8696)"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-950 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                    New Administrator Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new strong password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-950 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-950 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="w-full py-3 px-6 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isChangingPass ? 'Updating Credentials...' : 'Save New Administrator Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* NOTICE MODAL (CREATE / EDIT) */}
      {/* ========================================================================= */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-xs" 
            onClick={() => setShowNoticeModal(false)} 
          />
          <div className="relative z-10 w-full max-w-lg bg-stone-900 border border-stone-700 rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-editorial text-lg font-bold text-white">
                {editingNotice ? 'Edit Institutional Notice' : 'Issue New Official Notice'}
              </h3>
              <button 
                onClick={() => setShowNoticeModal(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule of Annual Board Examinations 2026"
                  value={noticeFormData.title}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Reference No.</label>
                  <input
                    type="text"
                    required
                    value={noticeFormData.refNo}
                    onChange={(e) => setNoticeFormData({ ...noticeFormData, refNo: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={noticeFormData.category}
                    onChange={(e) => setNoticeFormData({ ...noticeFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Examination">Examination</option>
                    <option value="Admissions">Admissions</option>
                    <option value="Administrative">Administrative</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">Summary (Short Preview)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief synopsis for home ticker and list cards"
                  value={noticeFormData.summary}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-prose-serif"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">Full Circular Text</label>
                <textarea
                  rows={4}
                  placeholder="Full text details of this institutional directive"
                  value={noticeFormData.fullText}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, fullText: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-prose-serif"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notice-important"
                  checked={noticeFormData.isImportant}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, isImportant: e.target.checked })}
                  className="rounded border-stone-700 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="notice-important" className="text-xs text-amber-300 font-medium cursor-pointer">
                  Mark as Pinned / Urgent Notice (Shows alert indicator on home view)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 border border-stone-700 rounded text-stone-300 hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded"
                >
                  Save Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESULT MODAL (CREATE / EDIT) */}
      {/* ========================================================================= */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-xs" 
            onClick={() => setShowResultModal(false)} 
          />
          <div className="relative z-10 w-full max-w-lg bg-stone-900 border border-stone-700 rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-editorial text-lg font-bold text-white">
                {editingResult ? 'Edit Examination Result' : 'Add Student Examination Record'}
              </h3>
              <button 
                onClick={() => setShowResultModal(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Muhammad Ali"
                    value={resultFormData.studentName}
                    onChange={(e) => setResultFormData({ ...resultFormData, studentName: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Father Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Tariq Mehmood"
                    value={resultFormData.fatherName}
                    onChange={(e) => setResultFormData({ ...resultFormData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Roll Number (Search Key)</label>
                  <input
                    type="text"
                    required
                    placeholder="849201"
                    value={resultFormData.rollNumber}
                    onChange={(e) => setResultFormData({ ...resultFormData, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Student ID</label>
                  <input
                    type="text"
                    required
                    placeholder="DA-2026-1001"
                    value={resultFormData.studentId}
                    onChange={(e) => setResultFormData({ ...resultFormData, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Class</label>
                  <input
                    type="text"
                    required
                    value={resultFormData.className}
                    onChange={(e) => setResultFormData({ ...resultFormData, className: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={resultFormData.section}
                    onChange={(e) => setResultFormData({ ...resultFormData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Obtained Marks</label>
                  <input
                    type="number"
                    required
                    value={resultFormData.obtainedMarks}
                    onChange={(e) => setResultFormData({ ...resultFormData, obtainedMarks: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={resultFormData.totalMarks}
                    onChange={(e) => setResultFormData({ ...resultFormData, totalMarks: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Overall Grade</label>
                  <input
                    type="text"
                    required
                    value={resultFormData.overallGrade}
                    onChange={(e) => setResultFormData({ ...resultFormData, overallGrade: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">Result Status</label>
                <select
                  value={resultFormData.resultStatus}
                  onChange={(e) => setResultFormData({ ...resultFormData, resultStatus: e.target.value as any })}
                  className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                >
                  <option value="PASS - FIRST DIVISION">PASS - FIRST DIVISION</option>
                  <option value="PASS - SECOND DIVISION">PASS - SECOND DIVISION</option>
                  <option value="FAILED">FAILED</option>
                  <option value="HELD">HELD</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2 border border-stone-700 rounded text-stone-300 hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded"
                >
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Logo Customizer Modal (Zoom, Pan, Rotate, Tilt, Mask, & Direct Cloudinary Upload) */}
      <LogoCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        imageSrc={customizerImageSrc}
        onApplyCroppedLogo={handleApplyCustomizedLogo}
      />
    </div>
  );
};
