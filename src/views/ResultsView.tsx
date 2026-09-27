import React, { useState } from 'react';
import { PageId, StudentResult } from '../types';
import { RESULTS_DATABASE, INSTITUTION_INFO } from '../data/mockData';
import { Emblem } from '../components/Emblem';
import { Search, Printer, CheckCircle2, AlertCircle, Award, ArrowLeft, ShieldCheck } from 'lucide-react';
import { fetchResultByRollOrId } from '../services/firebaseService';

interface ResultsViewProps {
  onNavigate: (page: PageId) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class X (Matriculation)');
  const [selectedExam, setSelectedExam] = useState('Annual Board Model Examination 2026');
  const [currentResult, setCurrentResult] = useState<StudentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const query = searchQuery.trim();

    if (!query) {
      setErrorMessage('Please enter a Roll Number or Student ID.');
      setCurrentResult(null);
      return;
    }

    setIsSearching(true);
    try {
      const found = await fetchResultByRollOrId(query);
      if (found) {
        setCurrentResult(found);
        setHasSearched(true);
      } else {
        // Fallback to local
        const local = RESULTS_DATABASE.find(
          (r) =>
            r.rollNumber.toLowerCase() === query.toLowerCase() ||
            r.studentId.toLowerCase() === query.toLowerCase()
        );
        if (local) {
          setCurrentResult(local);
          setHasSearched(true);
        } else {
          setCurrentResult(null);
          setErrorMessage(
            `No examination record found for Roll Number / Student ID "${searchQuery}". Please verify the digits or contact the Controller of Examinations.`
          );
        }
      }
    } catch {
      const local = RESULTS_DATABASE.find(
        (r) =>
          r.rollNumber.toLowerCase() === query.toLowerCase() ||
          r.studentId.toLowerCase() === query.toLowerCase()
      );
      if (local) {
        setCurrentResult(local);
        setHasSearched(true);
      } else {
        setCurrentResult(null);
        setErrorMessage(
          `No examination record found for Roll Number / Student ID "${searchQuery}". Please verify the digits or contact the Controller of Examinations.`
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Banner */}
      <div className="pb-4 border-b border-stone-200">
        <div className="text-xs font-semibold text-emerald-900 tracking-wider uppercase mb-1">
          Office of the Controller of Examinations
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
          Official Examination Results Verification
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-prose-serif">
          Search, view, and print official institutional examination transcripts and gazette marksheets.
        </p>
      </div>

      {/* Formal Search Interface */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-7 shadow-2xs space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Student ID / Roll Number */}
            <div>
              <label 
                htmlFor="roll-number" 
                className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1"
              >
                Student ID / Roll Number *
              </label>
              <input
                id="roll-number"
                type="text"
                required
                placeholder="e.g. 849201 or DA-2026-1001"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-stone-50 font-mono"
              />
            </div>

            {/* Class */}
            <div>
              <label 
                htmlFor="class-select" 
                className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1"
              >
                Class Level *
              </label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-stone-50"
              >
                <option value="Class X (Matriculation)">Class X (Matriculation)</option>
                <option value="Class IX (Secondary)">Class IX (Secondary)</option>
                <option value="Class VIII (Middle)">Class VIII (Middle)</option>
                <option value="HSSC-I (College)">HSSC-I (College)</option>
              </select>
            </div>

            {/* Examination */}
            <div>
              <label 
                htmlFor="exam-select" 
                className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1"
              >
                Examination *
              </label>
              <select
                id="exam-select"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-stone-50"
              >
                <option value="Annual Board Model Examination 2026">
                  Annual Board Model Examination 2026
                </option>
                <option value="Mid-Term Examination 2025–2026">
                  Mid-Term Examination 2025–2026
                </option>
                <option value="Pre-Board Simulation Examination 2026">
                  Pre-Board Simulation Examination 2026
                </option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>Enter registered Roll Number or Student ID to verify official gazette records.</span>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-md transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isSearching ? 'Verifying Records...' : 'Verify & View Result'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Default Instruction State when no search executed yet */}
      {!currentResult && !errorMessage && (
        <div className="bg-white border border-stone-200 rounded-lg p-8 text-center space-y-3">
          <Emblem size="md" className="mx-auto opacity-80" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-editorial text-base font-bold text-stone-900">
              Direct Examination Transcript Lookup
            </h3>
            <p className="text-xs text-stone-600 font-prose-serif leading-relaxed">
              Official student transcripts, marks breakdown, overall division status, and certified examination gazette records are generated directly from the institutional database.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Record Not Found:</span> {errorMessage}
          </div>
        </div>
      )}

      {/* Official Marksheet Display */}
      {currentResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-900" />
              <span>Print Official Marksheet</span>
            </button>
          </div>

          <div className="bg-white border-2 border-stone-300 rounded-lg p-6 sm:p-10 shadow-sm space-y-6 print-area relative overflow-hidden">
            {/* Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <Emblem size="xl" className="w-96 h-96" />
            </div>

            {/* Official Marksheet Header */}
            <div className="text-center pb-6 border-b-2 border-stone-800 space-y-2">
              <div className="flex items-center justify-center gap-3">
                <Emblem size="lg" />
                <div className="text-left">
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950">
                    DARE ARQAM
                  </h2>
                  <div className="text-xs text-stone-700 font-semibold tracking-wide">
                    CONTROLLER OF EXAMINATIONS · OFFICIAL RESULT TRANSCRIPT
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">
                    Affiliated with Board of Intermediate & Secondary Education
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <div className="inline-block bg-stone-100 border border-stone-300 px-4 py-1 rounded-xs text-xs font-bold text-stone-900 font-mono uppercase tracking-wider">
                  {currentResult.examination}
                </div>
              </div>
            </div>

            {/* Student Credential Particulars (Responsive grid) */}
            <div className="bg-stone-50 border border-stone-200 rounded-md p-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5 text-xs">
                <div>
                  <dt className="text-stone-500 font-medium">Candidate Name:</dt>
                  <dd className="font-bold text-stone-900 mt-0.5">{currentResult.studentName}</dd>
                </div>
                <div>
                  <dt className="text-stone-500 font-medium">Father's Name:</dt>
                  <dd className="font-bold text-stone-900 mt-0.5">{currentResult.fatherName}</dd>
                </div>
                <div>
                  <dt className="text-stone-500 font-medium">Roll Number:</dt>
                  <dd className="font-mono font-bold text-emerald-950 mt-0.5">{currentResult.rollNumber}</dd>
                </div>
                <div>
                  <dt className="text-stone-500 font-medium">Student Registration ID:</dt>
                  <dd className="font-mono font-bold text-stone-900 mt-0.5">{currentResult.studentId}</dd>
                </div>
                <div>
                  <dt className="text-stone-500 font-medium">Class & Group:</dt>
                  <dd className="font-semibold text-stone-900 mt-0.5">{currentResult.className} · {currentResult.section}</dd>
                </div>
                <div>
                  <dt className="text-stone-500 font-medium">Academic Session:</dt>
                  <dd className="font-mono text-stone-900 mt-0.5">{currentResult.session}</dd>
                </div>
              </dl>
            </div>

            {/* Subject Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-stone-200">
                <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Subject Description</th>
                    <th className="py-2.5 px-3 text-right">Max Marks</th>
                    <th className="py-2.5 px-3 text-right">Obtained</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800">
                  {currentResult.subjects.map((sub, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">{sub.name}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{sub.totalMarks}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-950 tabular-nums">
                        {sub.obtainedMarks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-stone-800">
                        {sub.grade}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[11px] font-semibold text-emerald-800">
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Aggregate Summary Box */}
            <div className="bg-stone-100 border border-stone-300 rounded-md p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-[11px] text-stone-500 font-medium">Grand Total</div>
                  <div className="text-lg font-mono font-bold text-stone-900 mt-0.5 tabular-nums">
                    {currentResult.obtainedMarks} / {currentResult.totalMarks}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-stone-500 font-medium">Percentage</div>
                  <div className="text-lg font-mono font-bold text-emerald-950 mt-0.5 tabular-nums">
                    {currentResult.percentage}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-stone-500 font-medium">Overall Grade</div>
                  <div className="text-lg font-mono font-bold text-amber-800 mt-0.5">
                    {currentResult.overallGrade}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-stone-500 font-medium">Final Determination</div>
                  <div className="text-sm font-bold text-emerald-900 mt-1">
                    {currentResult.resultStatus}
                  </div>
                </div>
              </div>

              {currentResult.remarks && (
                <div className="mt-3 pt-3 border-t border-stone-200 text-xs text-stone-600 font-prose-serif italic text-center">
                  “{currentResult.remarks}”
                </div>
              )}
            </div>

            {/* Institutional Signatures & Stamp */}
            <div className="pt-8 flex flex-col sm:flex-row items-end justify-between gap-6 border-t border-stone-200 text-xs">
              <div className="space-y-1 text-stone-500 text-[11px]">
                <div>Date of Issuance: {currentResult.examDate}</div>
                <div>Gazette Reference: DA-GAZ-{currentResult.rollNumber}</div>
                <div>Disclaimer: Official verified transcript copy from institutional database.</div>
              </div>

              <div className="text-right">
                <div className="w-40 h-10 border-b border-dashed border-stone-400 mx-auto sm:ml-auto mb-1 flex items-end justify-center text-[10px] text-stone-400 italic">
                  (Signature of Controller)
                </div>
                <div className="font-bold text-stone-900">Controller of Examinations</div>
                <div className="text-[11px] text-stone-600">DARE ARQAM School System</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
