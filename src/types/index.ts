export type PageId =
  | 'home'
  | 'about'
  | 'principal-message'
  | 'vision-mission'
  | 'administration'
  | 'faculty'
  | 'departments'
  | 'academic-programs'
  | 'classes'
  | 'academic-calendar'
  | 'examination'
  | 'results'
  | 'syllabus'
  | 'admission-info'
  | 'eligibility'
  | 'admission-process'
  | 'required-documents'
  | 'fee-structure'
  | 'apply-admission'
  | 'student-portal'
  | 'student-login'
  | 'student-register'
  | 'admin-login'
  | 'admin-dashboard'
  | 'super-admin-dashboard'
  | 'notices'
  | 'notice-detail'
  | 'events'
  | 'news'
  | 'gallery'
  | 'downloads'
  | 'contact';

export interface Notice {
  id: string;
  refNo: string;
  title: string;
  category: 'Admissions' | 'Academic' | 'Examination' | 'Administrative' | 'General';
  date: string;
  summary: string;
  fullText: string;
  isImportant?: boolean;
  issuedBy: string;
  fileSize?: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  date: string;
  category: 'Examination' | 'Ceremony' | 'Holiday' | 'Sports' | 'Academic';
  description: string;
  venue: string;
  time: string;
  isUpcoming: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  content: string;
}

export interface StudentResult {
  id?: string;
  studentId: string;
  rollNumber: string;
  studentName: string;
  fatherName: string;
  className: string;
  section: string;
  examination: string;
  session: string;
  examDate: string;
  subjects: {
    name: string;
    totalMarks: number;
    obtainedMarks: number;
    grade: string;
    status: 'Pass' | 'Fail';
  }[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  overallGrade: string;
  resultStatus: 'PASS - FIRST DIVISION' | 'PASS - SECOND DIVISION' | 'FAILED' | 'HELD';
  positionInClass?: string;
  remarks: string;
}

export interface DocumentDownload {
  id: string;
  title: string;
  category: 'Admissions' | 'Academic' | 'Forms' | 'Examination' | 'Rules';
  date: string;
  fileSize: string;
  fileType: string;
  refNo: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  experience: string;
}

export interface GallerySlide {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  category?: string;
  order: number;
  enabled: boolean;
  createdAt: string;
}

export interface GallerySettings {
  autoSlideInterval: number; // in milliseconds (e.g. 3000, 4000, 5000, 7000, 10000)
  pauseOnHover: boolean;
  loop: boolean;
  showNavigation: boolean;
  showIndicators: boolean;
}
