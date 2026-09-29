import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
  User,
  UserCredential 
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Notice, StudentResult, AcademicEvent } from '../types';
import { NOTICES_DATA, RESULTS_DATABASE, EVENTS_DATA } from '../data/mockData';

// ----------------------------------------------------
// SINGLE DOCUMENT STATE ARCHITECTURE (Reduces Firestore Read/Write Fees)
// All app state (notices, events, branding) is consolidated into 1 single Firestore document: settings/single_app_state
// ----------------------------------------------------

export interface LeadershipState {
  principalPhotoUrl?: string;
  principalName?: string;
  principalTitle?: string;
  principalQualification?: string;
  principalMessage?: string;
}

export interface SocialMediaPlatformConfig {
  enabled: boolean;
  profileName: string;
  url: string;
  displayOrder: number;
}

export interface SocialMediaState {
  youtube: SocialMediaPlatformConfig;
  facebook: SocialMediaPlatformConfig;
  tiktok: SocialMediaPlatformConfig;
}

export const DEFAULT_SOCIAL_MEDIA_STATE: SocialMediaState = {
  youtube: {
    enabled: true,
    profileName: 'YouTube',
    url: 'https://youtube.com',
    displayOrder: 1,
  },
  facebook: {
    enabled: true,
    profileName: 'Facebook',
    url: 'https://facebook.com',
    displayOrder: 2,
  },
  tiktok: {
    enabled: true,
    profileName: 'TikTok',
    url: 'https://tiktok.com',
    displayOrder: 3,
  },
};

export interface SingleAppState {
  notices?: Notice[];
  events?: AcademicEvent[];
  branding?: {
    logoUrl?: string;
    bannerUrl?: string;
    institutionName?: string;
    tagline?: string;
  };
  leadership?: LeadershipState;
  socialMedia?: SocialMediaState;
  sitemapXml?: string;
  sitemapGeneratedAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const LOCAL_STORAGE_APP_STATE_KEY = 'dare_arqam_local_single_app_state';

export async function fetchSingleAppState(): Promise<SingleAppState | null> {
  let localData: SingleAppState | null = null;
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_APP_STATE_KEY);
      if (cached) {
        localData = JSON.parse(cached);
      }
    } catch {}
  }

  try {
    const snap = await getDoc(doc(db, 'settings', 'single_app_state'));
    if (snap.exists()) {
      const remoteData = snap.data() as SingleAppState;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(remoteData));
        } catch {}
      }
      return remoteData;
    }
    return localData;
  } catch {
    return localData;
  }
}

export async function saveSingleAppState(partialState: Partial<SingleAppState>): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_APP_STATE_KEY);
      const current = cached ? JSON.parse(cached) : {};
      const merged = { ...current, ...partialState, updatedAt: new Date().toISOString() };
      localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(merged));
    } catch {}
  }

  try {
    await setDoc(doc(db, 'settings', 'single_app_state'), {
      ...partialState,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch {}
}

// ----------------------------------------------------
// 1. NOTICES SERVICE (Using Single Document)
// ----------------------------------------------------

export async function fetchNotices(): Promise<Notice[]> {
  try {
    const state = await fetchSingleAppState();
    if (state && state.notices && state.notices.length > 0) {
      return state.notices;
    }
    return NOTICES_DATA;
  } catch (error) {
    return NOTICES_DATA;
  }
}

export async function saveNotices(notices: Notice[]): Promise<void> {
  await saveSingleAppState({ notices });
}

export async function seedInitialDataIfEmpty(): Promise<void> {
  // No-op for single document optimization
}

// ----------------------------------------------------
// 2. EVENTS SERVICE (Using Single Document)
// ----------------------------------------------------

export async function fetchEvents(): Promise<AcademicEvent[]> {
  try {
    const state = await fetchSingleAppState();
    if (state && state.events && state.events.length > 0) {
      return state.events;
    }
    return EVENTS_DATA;
  } catch (error) {
    return EVENTS_DATA;
  }
}

export async function saveEvents(events: AcademicEvent[]): Promise<void> {
  await saveSingleAppState({ events });
}

// ----------------------------------------------------
// 3. EXAMINATION RESULTS SERVICE
// ----------------------------------------------------

export async function searchStudentResult(rollOrId: string): Promise<StudentResult | null> {
  const cleaned = rollOrId.trim();
  if (!cleaned) return null;

  try {
    const localMatch = RESULTS_DATABASE.find(
      r => r.rollNumber.toLowerCase() === cleaned.toLowerCase() ||
           r.studentId.toLowerCase() === cleaned.toLowerCase()
    );
    return localMatch || null;
  } catch (error) {
    console.warn('Results fetch error:', error);
    return null;
  }
}

export async function fetchResultByRollOrId(rollOrId: string): Promise<StudentResult | null> {
  return searchStudentResult(rollOrId);
}

// ----------------------------------------------------
// 4. ADMISSION APPLICATION SERVICE
// ----------------------------------------------------

export interface AdmissionApplicationPayload {
  candidateName: string;
  fatherName: string;
  bForm: string;
  gender: string;
  dob: string;
  targetClass: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  previousSchool?: string;
  [key: string]: any;
}

export async function submitAdmissionToFirebase(data: AdmissionApplicationPayload): Promise<{ referenceNumber: string }> {
  const referenceNumber = `ADM-DA-${Math.floor(10000 + Math.random() * 90000)}`;

  try {
    const state = await fetchSingleAppState();
    const existingAdmissions = (state as any)?.admissions || [];
    const newAdmission = {
      ...data,
      referenceNumber,
      submittedAt: new Date().toISOString(),
      status: 'Pending Verification'
    };

    await saveSingleAppState({
      ...state,
      admissions: [newAdmission, ...existingAdmissions]
    } as any);

    return { referenceNumber };
  } catch (error: any) {
    console.warn('Admission submission stored locally:', error);
    return { referenceNumber };
  }
}

export async function submitAdmissionApplication(data: AdmissionApplicationPayload): Promise<{ referenceNumber: string }> {
  return submitAdmissionToFirebase(data);
}

// ----------------------------------------------------
// 5. INQUIRIES SERVICE
// ----------------------------------------------------

export interface InquiryPayload {
  fullName?: string;
  name?: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  [key: string]: any;
}

export async function submitInquiryToFirebase(data: InquiryPayload): Promise<{ inquiryId: string }> {
  const inquiryId = `INQ-DA-${Math.floor(10000 + Math.random() * 90000)}`;
  try {
    const state = await fetchSingleAppState();
    const existingInquiries = (state as any)?.inquiries || [];
    const newInquiry = {
      ...data,
      inquiryId,
      submittedAt: new Date().toISOString(),
      status: 'Unread'
    };

    await saveSingleAppState({
      ...state,
      inquiries: [newInquiry, ...existingInquiries]
    } as any);
    return { inquiryId };
  } catch (error) {
    console.warn('Inquiry submission error:', error);
    return { inquiryId };
  }
}

export async function submitInquiry(data: InquiryPayload): Promise<{ inquiryId: string }> {
  return submitInquiryToFirebase(data);
}

// ----------------------------------------------------
// 6. STUDENT AUTHENTICATION
// ----------------------------------------------------

export async function loginStudentWithFirebase(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function registerStudentWithFirebase(data: { email: string; password: string; [key: string]: any }): Promise<{ studentId: string; user: User }> {
  const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
  const studentId = `STD-DA-${Math.floor(10000 + Math.random() * 90000)}`;
  await saveSingleAppState({
    [`student_${cred.user.uid}`]: { ...data, studentId }
  } as any);
  return { studentId, user: cred.user };
}

export async function logoutStudentFromFirebase(): Promise<void> {
  return signOut(auth);
}

export async function sendStudentVerificationEmail(user: User): Promise<void> {
  return sendEmailVerification(user);
}

export async function checkStudentEmailVerified(user: User): Promise<boolean> {
  await reload(user);
  return user.emailVerified;
}

export async function resetStudentPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

export async function getStudentProfile(uid: string): Promise<any> {
  try {
    const state = await fetchSingleAppState();
    return (state as any)?.[`student_${uid}`] || null;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// 7. AUTHENTICATION & ADMIN SERVICE
// ----------------------------------------------------

export { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload
};

export type { User, UserCredential };

export async function getActiveAdminCredentials() {
  return {
    email: 'Darearqam@mardan.com',
    role: 'Super Administrator',
    lastLogin: new Date().toISOString()
  };
}

export async function updateAdminCredentials(email: string, pass: string) {
  try {
    await saveSingleAppState({
      adminMeta: { email, updatedAt: new Date().toISOString() }
    } as any);
  } catch (error) {
    console.warn('Admin credentials update note:', error);
  }
}
