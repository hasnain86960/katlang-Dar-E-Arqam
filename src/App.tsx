/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageId, Notice } from './types';
import { NOTICES_DATA } from './data/mockData';
import { Header } from './components/Header';
import { HamburgerMenu } from './components/HamburgerMenu';
import { Footer } from './components/Footer';
import { NoticeModal } from './components/NoticeModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';
import { seedInitialDataIfEmpty } from './services/firebaseService';
import { getCurrentAdminSession } from './services/adminService';

// Views
import { HomeView } from './views/HomeView';
import { InstitutionView } from './views/InstitutionView';
import { AcademicsView } from './views/AcademicsView';
import { AdmissionsView } from './views/AdmissionsView';
import { ResultsView } from './views/ResultsView';
import { NoticeBoardView } from './views/NoticeBoardView';
import { EventsView } from './views/EventsView';
import { MediaView } from './views/MediaView';
import { ContactView } from './views/ContactView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { StudentPortalView } from './views/StudentPortalView';
import { EmailVerificationScreen } from './components/EmailVerificationScreen';
import { AdminLoginView } from './views/AdminLoginView';
import { AdminDashboardView } from './views/AdminDashboardView';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Notice Modal State
  const [activeNoticeModal, setActiveNoticeModal] = useState<Notice | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [selectedNoticeForReader, setSelectedNoticeForReader] = useState<Notice | null>(null);

  // Firebase Auth Context
  const { user, studentProfile, logout } = useAuth();

  // Seed Firestore data if the project is brand new
  useEffect(() => {
    seedInitialDataIfEmpty().catch(() => {});
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    // If navigating to notice board, reset individual reader unless specifically routed
    if (page === 'notices') {
      setSelectedNoticeForReader(null);
    }
  };

  const handleSelectNoticeFromList = (notice: Notice) => {
    setSelectedNoticeForReader(notice);
    setCurrentPage('notices');
  };

  const handleOpenNoticeModal = (notice: Notice) => {
    setActiveNoticeModal(notice);
    setIsNoticeModalOpen(true);
  };

  const handleModalViewDetails = (notice: Notice) => {
    setSelectedNoticeForReader(notice);
    setCurrentPage('notices');
  };

  // Determine subview tab mapping
  const renderCurrentView = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomeView
            onNavigate={handleNavigate}
            onSelectNotice={handleOpenNoticeModal}
          />
        );

      // Institution Subpages
      case 'about':
        return <InstitutionView initialTab="about" onNavigate={handleNavigate} />;
      case 'principal-message':
        return <InstitutionView initialTab="principal" onNavigate={handleNavigate} />;
      case 'vision-mission':
        return <InstitutionView initialTab="vision" onNavigate={handleNavigate} />;
      case 'administration':
        return <InstitutionView initialTab="admin" onNavigate={handleNavigate} />;
      case 'faculty':
        return <InstitutionView initialTab="faculty" onNavigate={handleNavigate} />;
      case 'departments':
        return <InstitutionView initialTab="departments" onNavigate={handleNavigate} />;

      // Academics Subpages
      case 'academic-programs':
        return <AcademicsView initialTab="programs" onNavigate={handleNavigate} />;
      case 'classes':
        return <AcademicsView initialTab="classes" onNavigate={handleNavigate} />;
      case 'academic-calendar':
        return <AcademicsView initialTab="calendar" onNavigate={handleNavigate} />;
      case 'examination':
        return <AcademicsView initialTab="examination" onNavigate={handleNavigate} />;
      case 'syllabus':
        return <AcademicsView initialTab="syllabus" onNavigate={handleNavigate} />;

      // Results
      case 'results':
        return <ResultsView onNavigate={handleNavigate} />;

      // Admissions Subpages
      case 'admission-info':
        return <AdmissionsView initialTab="info" onNavigate={handleNavigate} />;
      case 'eligibility':
        return <AdmissionsView initialTab="eligibility" onNavigate={handleNavigate} />;
      case 'admission-process':
        return <AdmissionsView initialTab="process" onNavigate={handleNavigate} />;
      case 'required-documents':
        return <AdmissionsView initialTab="documents" onNavigate={handleNavigate} />;
      case 'fee-structure':
        return <AdmissionsView initialTab="fees" onNavigate={handleNavigate} />;
      case 'apply-admission':
        return <AdmissionsView initialTab="apply" onNavigate={handleNavigate} />;

      // Notices
      case 'notices':
      case 'notice-detail':
        return (
          <NoticeBoardView
            selectedNotice={selectedNoticeForReader}
            onSelectNotice={setSelectedNoticeForReader}
            onNavigate={handleNavigate}
          />
        );

      // Events
      case 'events':
        return <EventsView onNavigate={handleNavigate} />;

      // Media Subpages
      case 'news':
        return <MediaView initialTab="news" onNavigate={handleNavigate} />;
      case 'gallery':
        return <MediaView initialTab="gallery" onNavigate={handleNavigate} />;
      case 'downloads':
        return <MediaView initialTab="downloads" onNavigate={handleNavigate} />;

      // Contact
      case 'contact':
        return <ContactView onNavigate={handleNavigate} />;

      // Authentication & Student Portal
      case 'student-login':
        // If already logged in and verified, take to student portal
        if (user && user.emailVerified) {
          return (
            <StudentPortalView
              onNavigate={handleNavigate}
              onSelectNotice={handleSelectNoticeFromList}
              studentProfile={studentProfile}
              onLogout={async () => {
                await logout();
                setCurrentPage('home');
              }}
            />
          );
        }
        return (
          <LoginView
            onNavigate={handleNavigate}
            onLoginSuccess={() => handleNavigate('student-portal')}
          />
        );
      case 'student-register':
        return <RegisterView onNavigate={handleNavigate} />;
      case 'student-portal':
        // Unauthenticated users are redirected to login
        if (!user) {
          return (
            <LoginView
              onNavigate={handleNavigate}
              onLoginSuccess={() => handleNavigate('student-portal')}
            />
          );
        }
        // Unverified users are strictly blocked from authenticated student features
        if (!user.emailVerified) {
          return (
            <EmailVerificationScreen
              email={user.email || ''}
              studentId={studentProfile?.studentId}
              onVerified={() => handleNavigate('student-portal')}
              onReturnToRegister={() => {
                logout();
                handleNavigate('student-register');
              }}
              onNavigate={handleNavigate}
            />
          );
        }
        // Verified users continue to authenticated portal features
        return (
          <StudentPortalView
            onNavigate={handleNavigate}
            onSelectNotice={handleSelectNoticeFromList}
            studentProfile={studentProfile}
            onLogout={async () => {
              await logout();
              setCurrentPage('home');
            }}
          />
        );

      // Directorate Administration (Admin Console)
      case 'admin-login':
        return (
          <AdminLoginView
            onNavigate={handleNavigate}
            onLoginSuccess={() => handleNavigate('admin-dashboard')}
          />
        );

      case 'admin-dashboard':
        if (!getCurrentAdminSession()) {
          return (
            <AdminLoginView
              onNavigate={handleNavigate}
              onLoginSuccess={() => handleNavigate('admin-dashboard')}
            />
          );
        }
        return (
          <AdminDashboardView
            onNavigate={handleNavigate}
            onLogout={() => handleNavigate('home')}
          />
        );

      default:
        return (
          <HomeView
            onNavigate={handleNavigate}
            onSelectNotice={handleOpenNoticeModal}
          />
        );
    }
  };

  // If viewing the standalone Directorate Admin Dashboard, render the dedicated executive console directly
  if (currentPage === 'admin-dashboard') {
    if (!getCurrentAdminSession()) {
      return (
        <AdminLoginView
          onNavigate={handleNavigate}
          onLoginSuccess={() => handleNavigate('admin-dashboard')}
        />
      );
    }
    return (
      <AdminDashboardView
        onNavigate={handleNavigate}
        onLogout={() => handleNavigate('home')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-900 selection:text-white">
      {/* 1. Official Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* 2. Slide-out Hamburger Menu Drawer */}
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* 3. Reusable Notice Modal Dialog */}
      <NoticeModal
        notice={activeNoticeModal}
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onViewDetails={handleModalViewDetails}
      />

      {/* 4. Active Page Content */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* 5. Official Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <BrandingProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrandingProvider>
  );
}
