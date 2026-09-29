import React, { useState } from 'react';
import { PageId, Notice } from '../types';
import { RESULTS_DATABASE, NOTICES_DATA, DOWNLOADS_DATA, INSTITUTION_INFO } from '../data/mockData';
import { Emblem } from '../components/Emblem';
import { 
  User, 
  BookOpen, 
  Award, 
  Calendar, 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  LogOut, 
  Printer, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

interface StudentPortalViewProps {
  onNavigate: (page: PageId) => void;
  onSelectNotice: (notice: Notice) => void;
  onLogout: () => void;
  studentProfile?: any;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  onNavigate,
  onSelectNotice,
  onLogout,
  studentProfile,
}) => {
  // Student Dossier (Dynamic from Firebase with institutional fallback)
  const student = {
    name: studentProfile?.fullName || studentProfile?.name || 'Muhammad Bilal Khan',
    id: studentProfile?.studentId || studentProfile?.id || 'DA-2026-1001',
    rollNumber: studentProfile?.rollNumber || '849201',
    fatherName: studentProfile?.fatherName || 'Tariq Mehmood Khan',
    guardianContact: studentProfile?.phone || studentProfile?.guardianContact || '+92 300 5551234',
    guardianEmail: studentProfile?.email || studentProfile?.guardianEmail || 'tariq.khan@guardian.edu.pk',
    residentialAddress: studentProfile?.address 
      ? `${studentProfile.address}${studentProfile.city ? ', ' + studentProfile.city : ''}` 
      : 'House 142, Street 19, Sector G-10/2, Islamabad',
    dob: studentProfile?.dob || '14 August 2009',
    gender: studentProfile?.gender || 'Male',
    bForm: studentProfile?.bForm || '61101-9876543-1',
    className: studentProfile?.targetClass || studentProfile?.className || 'Class X (Matriculation)',
    section: studentProfile?.section || 'Section A (Science Group)',
    session: studentProfile?.session || '2025–2026',
    status: studentProfile?.status || 'ACTIVE / REGULAR ENROLLED',
    bloodGroup: studentProfile?.bloodGroup || 'B Positive',
    emergencyContact: studentProfile?.emergencyContact || '+92 321 9876543 (Mother)',
    attendancePercentage: studentProfile?.attendancePercentage ?? 94.6,
    totalWorkingDays: studentProfile?.totalWorkingDays ?? 148,
    presentDays: studentProfile?.presentDays ?? 140,
    leavesSanctioned: studentProfile?.leavesSanctioned ?? 6,
    unexcusedAbsences: studentProfile?.unexcusedAbsences ?? 2,
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'attendance' | 'notices' | 'downloads'>('profile');

  const demoResult = RESULTS_DATABASE[0];

  const studentNotices = NOTICES_DATA;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top Portal Banner with Institutional Verification */}
      <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Student Photo Placeholder */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md bg-[#EEF2F8] border border-[#94A3B8] flex items-center justify-center shrink-0 text-stone-400">
            <User className="w-10 h-10 text-[#475569]" />
            <div className="absolute -bottom-1 -right-1 bg-[#20216B] text-white rounded-full p-0.5 border border-white">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FFF000]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#20216B] bg-[#EEF0FF] px-2 py-0.5 rounded-xs">
                {student.id}
              </span>
              <span className="text-xs text-[#20216B] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {student.status}
              </span>
            </div>
            <h1 className="font-editorial text-xl sm:text-2xl font-bold text-[#0F1035] mt-1">
              {student.name}
            </h1>
            <p className="text-xs text-[#475569]">
              {student.className} · {student.section} · Roll #: {student.rollNumber}
            </p>
          </div>
        </div>

        {/* Portal Utility Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-medium text-[#1E293B] hover:text-[#20216B] bg-[#EEF2F8] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Student Slip</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-xs font-semibold text-red-700 hover:text-white hover:bg-red-700 bg-red-50 border border-red-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Portal Tab Navigation (Segmented zero-pill buttons) */}
      <div className="bg-[#EEF2F8] p-1 rounded-md flex flex-wrap gap-1 border border-[#CBD5E1]">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-[#0F1035] hover:bg-[#E2E8F0]'
          }`}
        >
          Student Profile & Info
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'academic'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-[#0F1035] hover:bg-[#E2E8F0]'
          }`}
        >
          Academics & Examination Results
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-[#0F1035] hover:bg-[#E2E8F0]'
          }`}
        >
          Attendance Record ({student.attendancePercentage}%)
        </button>
        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'notices'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-[#0F1035] hover:bg-[#E2E8F0]'
          }`}
        >
          Student Notices
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'downloads'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-[#0F1035] hover:bg-[#E2E8F0]'
          }`}
        >
          Academic Downloads
        </button>
      </div>

      {/* TAB 1: STUDENT PROFILE & INFORMATION */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info Card */}
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 space-y-4 shadow-2xs">
            <h2 className="font-editorial text-base font-bold text-[#0F1035] pb-2 border-b border-[#CBD5E1] flex items-center justify-between">
              <span>Personal Information</span>
              <span className="text-[11px] font-mono text-[#475569] font-normal">SEC-A/BIO</span>
            </h2>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="text-[#475569] font-medium">Candidate Name</dt>
                <dd className="font-semibold text-[#0F1035] mt-0.5">{student.name}</dd>
              </div>
              <div>
                <dt className="text-[#475569] font-medium">Father's Name</dt>
                <dd className="font-semibold text-[#0F1035] mt-0.5">{student.fatherName}</dd>
              </div>
              <div>
                <dt className="text-[#475569] font-medium">Date of Birth</dt>
                <dd className="font-semibold text-[#0F1035] mt-0.5">{student.dob}</dd>
              </div>
              <div>
                <dt className="text-[#475569] font-medium">Gender</dt>
                <dd className="font-semibold text-[#0F1035] mt-0.5">{student.gender}</dd>
              </div>
              <div>
                <dt className="text-[#475569] font-medium">NADRA B-Form Number</dt>
                <dd className="font-mono text-[#0F1035] mt-0.5">{student.bForm}</dd>
              </div>
              <div>
                <dt className="text-[#475569] font-medium">Blood Group</dt>
                <dd className="font-semibold text-[#0F1035] mt-0.5">{student.bloodGroup}</dd>
              </div>
            </dl>
          </div>

          {/* Guardian & Contact Info Card */}
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 space-y-4 shadow-2xs">
            <h2 className="font-editorial text-base font-bold text-[#0F1035] pb-2 border-b border-[#CBD5E1]">
              Guardian & Emergency Contact
            </h2>

            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-[#475569] font-medium">Primary Guardian Name</dt>
                <dd className="font-semibold text-[#0F1035] mt-0.5">{student.fatherName}</dd>
              </div>
              <div>
                <dt className="text-[#475569] font-medium">Guardian Contact Phone</dt>
                <dd className="font-semibold text-[#0F1035] mt-0.5">{student.guardianContact}</dd>
              </div>
              <div>
                <dt className="text-[#475569] font-medium">Guardian Verified Email</dt>
                <dd className="text-[#0F1035] mt-0.5">{student.guardianEmail}</dd>
              </div>
              <div>
                <dt className="text-[#475569] font-medium">Registered Residential Address</dt>
                <dd className="text-[#0F1035] mt-0.5 leading-relaxed">{student.residentialAddress}</dd>
              </div>
              <div>
                <dt className="text-[#475569] font-medium">Secondary Emergency Contact</dt>
                <dd className="font-mono text-[#0F1035] mt-0.5">{student.emergencyContact}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC & RESULTS */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          {/* Current Enrolled Subjects */}
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 shadow-2xs space-y-3">
            <h2 className="font-editorial text-base font-bold text-[#0F1035] pb-2 border-b border-[#CBD5E1]">
              Enrolled Curriculum & Subject Code Details (Academic Session {student.session})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#CBD5E1]">
                <thead className="bg-[#EEF2F8] text-[#1E293B] font-semibold border-b border-[#CBD5E1]">
                  <tr>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Weekly Hours</th>
                    <th className="py-2.5 px-3">Assessment Medium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-[#0F1035]">
                  <tr>
                    <td className="py-2.5 px-3 font-medium">English Compulsory</td>
                    <td className="py-2.5 px-3 font-mono">ENG-101</td>
                    <td className="py-2.5 px-3">Compulsory</td>
                    <td className="py-2.5 px-3">6 Hours</td>
                    <td className="py-2.5 px-3">English</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Urdu Compulsory</td>
                    <td className="py-2.5 px-3 font-mono">URD-102</td>
                    <td className="py-2.5 px-3">Compulsory</td>
                    <td className="py-2.5 px-3">6 Hours</td>
                    <td className="py-2.5 px-3">Urdu</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Mathematics (Science)</td>
                    <td className="py-2.5 px-3 font-mono">MTH-201</td>
                    <td className="py-2.5 px-3">Major Science</td>
                    <td className="py-2.5 px-3">7 Hours</td>
                    <td className="py-2.5 px-3">English</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Physics (Theory & Practical)</td>
                    <td className="py-2.5 px-3 font-mono">PHY-202</td>
                    <td className="py-2.5 px-3">Major Science</td>
                    <td className="py-2.5 px-3">6 Hours + 2 Lab</td>
                    <td className="py-2.5 px-3">English</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Chemistry (Theory & Practical)</td>
                    <td className="py-2.5 px-3 font-mono">CHM-203</td>
                    <td className="py-2.5 px-3">Major Science</td>
                    <td className="py-2.5 px-3">6 Hours + 2 Lab</td>
                    <td className="py-2.5 px-3">English</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Biology (Theory & Practical)</td>
                    <td className="py-2.5 px-3 font-mono">BIO-204</td>
                    <td className="py-2.5 px-3">Major Science</td>
                    <td className="py-2.5 px-3">6 Hours + 2 Lab</td>
                    <td className="py-2.5 px-3">English</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Islamiyat / Ethics & Quranic Tajweed</td>
                    <td className="py-2.5 px-3 font-mono">ISL-105</td>
                    <td className="py-2.5 px-3">Core Religious</td>
                    <td className="py-2.5 px-3">4 Hours</td>
                    <td className="py-2.5 px-3">Urdu / Arabic</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Most Recent Examination Marksheet Summary */}
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CBD5E1] gap-2">
              <div>
                <div className="text-xs text-[#20216B] font-semibold">Latest Record On File</div>
                <h3 className="font-editorial text-lg font-bold text-[#0F1035]">
                  {demoResult.examination}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#20216B] bg-[#EEF0FF] border border-[#292A86]/30 px-2.5 py-1 rounded-sm">
                  {demoResult.resultStatus}
                </span>
                <button
                  onClick={() => onNavigate('results')}
                  className="text-xs font-semibold text-[#20216B] underline hover:text-[#292A86] cursor-pointer"
                >
                  View Full Marksheet
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-md">
                <div className="text-xs text-[#475569] font-medium">Total Maximum Marks</div>
                <div className="text-lg font-mono font-bold text-[#0F1035] mt-0.5 tabular-nums">
                  {demoResult.totalMarks}
                </div>
              </div>
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-md">
                <div className="text-xs text-[#475569] font-medium">Total Marks Obtained</div>
                <div className="text-lg font-mono font-bold text-[#20216B] mt-0.5 tabular-nums">
                  {demoResult.obtainedMarks}
                </div>
              </div>
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-md">
                <div className="text-xs text-[#475569] font-medium">Overall Percentage</div>
                <div className="text-lg font-mono font-bold text-[#20216B] mt-0.5 tabular-nums">
                  {demoResult.percentage}%
                </div>
              </div>
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-md">
                <div className="text-xs text-[#475569] font-medium">Awarded Grade</div>
                <div className="text-lg font-mono font-bold text-amber-700 mt-0.5">
                  {demoResult.overallGrade}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE RECORD */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="font-editorial text-base font-bold text-[#0F1035] pb-2 border-b border-[#CBD5E1]">
              Institutional Attendance Ledger — Academic Year 2025–2026
            </h2>

            {/* Attendance Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md">
                <div className="text-xs text-[#475569]">Total Instructional Days</div>
                <div className="text-xl font-mono font-bold text-[#0F1035] mt-1 tabular-nums">
                  {student.totalWorkingDays}
                </div>
              </div>
              <div className="p-3 bg-[#EEF0FF] border border-[#292A86]/20 rounded-md">
                <div className="text-xs text-[#20216B]">Days Present</div>
                <div className="text-xl font-mono font-bold text-[#20216B] mt-1 tabular-nums">
                  {student.presentDays}
                </div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="text-xs text-amber-800">Sanctioned Medical Leaves</div>
                <div className="text-xl font-mono font-bold text-amber-900 mt-1 tabular-nums">
                  {student.leavesSanctioned}
                </div>
              </div>
              <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md">
                <div className="text-xs text-[#334155]">Attendance Ratio</div>
                <div className="text-xl font-mono font-bold text-[#20216B] mt-1 tabular-nums">
                  {student.attendancePercentage}%
                </div>
              </div>
            </div>

            {/* Attendance Regulations Note */}
            <div className="p-3.5 bg-[#F8FAFC] border-l-3 border-[#292A86] rounded-r-md text-xs text-[#1E293B] leading-relaxed font-prose-serif">
              <strong>BISE Board Rule:</strong> Candidates must maintain a minimum threshold of 85% attendance across theoretical and practical class sessions to qualify for issuance of the final Board Examination Roll Number slip.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT NOTICES */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 shadow-2xs space-y-4">
            <h2 className="font-editorial text-base font-bold text-[#0F1035] pb-2 border-b border-[#CBD5E1]">
              Student Specific & General Dispatches
            </h2>

            <div className="divide-y divide-stone-200">
              {studentNotices.map((n) => (
                <div key={n.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#475569]">
                      <span className="font-semibold text-[#20216B]">{n.category}</span>
                      <span>·</span>
                      <span>{n.date}</span>
                    </div>
                    <div className="text-sm font-bold text-[#0F1035]">{n.title}</div>
                    <p className="text-xs text-[#334155] leading-relaxed">{n.summary}</p>
                  </div>
                  <button
                    onClick={() => onSelectNotice(n)}
                    className="shrink-0 px-3 py-1.5 text-xs font-semibold text-[#20216B] bg-[#EEF2F8] hover:bg-[#E2E8F0] rounded-md cursor-pointer"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DOWNLOADS */}
      {activeTab === 'downloads' && (
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 shadow-2xs space-y-4">
          <h2 className="font-editorial text-base font-bold text-[#0F1035] pb-2 border-b border-[#CBD5E1]">
            Student Academic Files & Official Downloads
          </h2>

          <div className="divide-y divide-stone-200">
            {DOWNLOADS_DATA.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs sm:text-sm font-semibold text-[#0F1035]">
                    {doc.title}
                  </div>
                  <div className="text-[11px] text-[#475569]">
                    Category: {doc.category} · Size: {doc.fileSize} · Ref: {doc.refNo}
                  </div>
                </div>
                <button
                  onClick={() => alert(`Simulated institutional download: ${doc.title}`)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#20216B] bg-[#EEF0FF] hover:bg-[#EEF0FF] border border-[#292A86]/30 rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
