import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  addDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Notice, StudentResult } from '../types';
import { NOTICES_DATA, RESULTS_DATABASE } from '../data/mockData';

// Constants
const DEFAULT_ADMIN_EMAIL = 'Darearqam@mardan.com';
const DEFAULT_ADMIN_PASSWORD = 'Hasnainqadir8696';
const ADMIN_STORAGE_KEY = 'dare_arqam_admin_session';
const ADMIN_CREDS_STORAGE_KEY = 'dare_arqam_admin_creds';

export interface AdminUser {
  email: string;
  name: string;
  role: string;
  loggedInAt: string;
}

export interface AdmissionApplicationRecord {
  id: string;
  applicationRef: string;
  candidateName: string;
  targetClass: string;
  fatherName: string;
  parentPhone: string;
  parentEmail: string;
  status: 'PENDING' | 'UNDER REVIEW' | 'APPROVED' | 'INTERVIEW SCHEDULED' | 'REJECTED';
  appliedDate: string;
  previousSchool?: string;
  remarks?: string;
}

export interface InquiryRecord {
  id: string;
  inquiryId: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

// ----------------------------------------------------------------------
// 1. ADMIN AUTHENTICATION & CREDENTIALS
// ----------------------------------------------------------------------

export async function getActiveAdminCredentials(): Promise<{ email: string; passwordHash: string }> {
  // Try to load from Firestore
  try {
    const credSnap = await getDoc(doc(db, 'settings', 'admin_credentials'));
    if (credSnap.exists()) {
      const data = credSnap.data();
      if (data?.password) {
        return {
          email: data.email || DEFAULT_ADMIN_EMAIL,
          passwordHash: data.password,
        };
      }
    }
  } catch (err) {
    // Fall through to localStorage
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(ADMIN_CREDS_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed?.password) {
        return {
          email: parsed.email || DEFAULT_ADMIN_EMAIL,
          passwordHash: parsed.password,
        };
      }
    }
  } catch {}

  // Default hardcoded initial credentials
  return {
    email: DEFAULT_ADMIN_EMAIL,
    passwordHash: DEFAULT_ADMIN_PASSWORD,
  };
}

export async function verifyAdminLogin(email: string, password: string): Promise<{ success: boolean; message: string; user?: AdminUser }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  const creds = await getActiveAdminCredentials();
  const expectedEmail = creds.email.trim().toLowerCase();
  const expectedPassword = creds.passwordHash;

  if (cleanEmail !== expectedEmail) {
    return {
      success: false,
      message: 'Unrecognized administrator email. Please verify and try again.',
    };
  }

  if (cleanPass !== expectedPassword) {
    return {
      success: false,
      message: 'Invalid administrator password. Please check your credentials.',
    };
  }

  const user: AdminUser = {
    email: creds.email,
    name: 'Chief Administrative Directorate',
    role: 'SUPER_ADMIN',
    loggedInAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
  } catch {}

  return {
    success: true,
    message: 'Authentication successful. Accessing Directorate Console.',
    user,
  };
}

export function getCurrentAdminSession(): AdminUser | null {
  try {
    const item = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!item) return null;
    return JSON.parse(item);
  } catch {
    return null;
  }
}

export function logoutAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  } catch {}
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const creds = await getActiveAdminCredentials();

  if (currentPassword.trim() !== creds.passwordHash) {
    return {
      success: false,
      message: 'Current administrator password does not match.',
    };
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return {
      success: false,
      message: 'New password must be at least 6 characters long.',
    };
  }

  const updatedCreds = {
    email: creds.email,
    password: newPassword.trim(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Update localStorage
  try {
    localStorage.setItem(ADMIN_CREDS_STORAGE_KEY, JSON.stringify(updatedCreds));
  } catch {}

  // 2. Persist to Firestore
  try {
    await setDoc(doc(db, 'settings', 'admin_credentials'), updatedCreds, { merge: true });
  } catch (err) {
    console.warn('Could not persist new admin password to Firestore:', err);
  }

  return {
    success: true,
    message: 'Administrator password changed successfully.',
  };
}

// ----------------------------------------------------------------------
// 2. NOTICE BOARD MANAGEMENT
// ----------------------------------------------------------------------

export async function adminFetchAllNotices(): Promise<Notice[]> {
  try {
    const snap = await getDocs(collection(db, 'notices'));
    if (!snap.empty) {
      const list: Notice[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          refNo: d.refNo || 'REF-2026',
          title: d.title || '',
          category: d.category || 'General',
          date: d.date || '',
          summary: d.summary || '',
          fullText: d.fullText || d.summary || '',
          isImportant: !!d.isImportant,
          issuedBy: d.issuedBy || 'Directorate of Academics',
          fileSize: d.fileSize || '140 KB',
        });
      });
      return list;
    }
  } catch (e) {
    console.warn('adminFetchAllNotices error, using mock fallback:', e);
  }
  return NOTICES_DATA;
}

export async function adminCreateNotice(notice: Omit<Notice, 'id'>): Promise<string> {
  const noticeId = `notice-${Date.now()}`;
  const noticeData = {
    ...notice,
    id: noticeId,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'notices', noticeId), noticeData);
  return noticeId;
}

export async function adminUpdateNotice(id: string, updates: Partial<Notice>): Promise<void> {
  await setDoc(doc(db, 'notices', id), {
    ...updates,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function adminDeleteNotice(id: string): Promise<void> {
  await deleteDoc(doc(db, 'notices', id));
}

// ----------------------------------------------------------------------
// 3. EXAMINATION RESULTS MANAGEMENT
// ----------------------------------------------------------------------

export async function adminFetchAllResults(): Promise<StudentResult[]> {
  try {
    const snap = await getDocs(collection(db, 'results'));
    if (!snap.empty) {
      const list: StudentResult[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data() as StudentResult;
        list.push({ ...data, id: docSnap.id });
      });
      return list;
    }
  } catch (e) {
    console.warn('adminFetchAllResults error:', e);
  }
  return [];
}

export async function adminCreateResult(result: StudentResult): Promise<string> {
  const docId = result.id || `res-${result.rollNumber || Date.now()}`;
  await setDoc(doc(db, 'results', docId), {
    ...result,
    id: docId,
    updatedAt: new Date().toISOString(),
  });
  return docId;
}

export async function adminUpdateResult(id: string, updates: Partial<StudentResult>): Promise<void> {
  await setDoc(doc(db, 'results', id), {
    ...updates,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function adminDeleteResult(id: string): Promise<void> {
  await deleteDoc(doc(db, 'results', id));
}

// ----------------------------------------------------------------------
// 4. ADMISSION APPLICATIONS MANAGEMENT
// ----------------------------------------------------------------------

export async function adminFetchAdmissions(): Promise<AdmissionApplicationRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'admissions_applications'));
    if (!snap.empty) {
      const list: AdmissionApplicationRecord[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          applicationRef: d.applicationRef || docSnap.id,
          candidateName: d.candidateName || 'Unnamed Candidate',
          targetClass: d.targetClass || 'Unassigned',
          fatherName: d.fatherName || '',
          parentPhone: d.parentPhone || '',
          parentEmail: d.parentEmail || '',
          status: d.status || 'PENDING',
          appliedDate: d.appliedDate || d.createdAt || '2026',
          previousSchool: d.previousSchool || '',
          remarks: d.remarks || '',
        });
      });
      return list;
    }
  } catch (e) {
    console.warn('adminFetchAdmissions error:', e);
  }

  return [];
}

export async function adminUpdateAdmissionStatus(id: string, status: AdmissionApplicationRecord['status'], remarks?: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'admissions_applications', id), {
      status,
      remarks: remarks || '',
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    // Try setDoc merge if updateDoc fails
    await setDoc(doc(db, 'admissions_applications', id), {
      status,
      remarks: remarks || '',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
}

// ----------------------------------------------------------------------
// 5. INQUIRIES MANAGEMENT
// ----------------------------------------------------------------------

export async function adminFetchInquiries(): Promise<InquiryRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'inquiries'));
    if (!snap.empty) {
      const list: InquiryRecord[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          inquiryId: d.inquiryId || docSnap.id,
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          category: d.category || 'General Inquiry',
          subject: d.subject || '',
          message: d.message || '',
          status: d.status || 'Received / Pending',
          createdAt: d.createdAt || '2026',
        });
      });
      return list;
    }
  } catch (e) {
    console.warn('adminFetchInquiries error:', e);
  }

  return [];
}

export async function adminUpdateInquiryStatus(id: string, status: string): Promise<void> {
  try {
    await setDoc(doc(db, 'inquiries', id), {
      status,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.warn('Could not update inquiry status in Firestore:', e);
  }
}
