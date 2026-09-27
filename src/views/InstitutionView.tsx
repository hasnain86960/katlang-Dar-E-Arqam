import React, { useState } from 'react';
import { PageId } from '../types';
import { INSTITUTION_INFO, FACULTY_DATA } from '../data/mockData';
import { Emblem } from '../components/Emblem';
import { 
  Building2, 
  Award, 
  Target, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Compass, 
  UserCheck 
} from 'lucide-react';

interface InstitutionViewProps {
  initialTab?: 'about' | 'principal' | 'vision' | 'admin' | 'faculty' | 'departments';
  onNavigate: (page: PageId) => void;
}

export const InstitutionView: React.FC<InstitutionViewProps> = ({
  initialTab = 'about',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'principal' | 'vision' | 'admin' | 'faculty' | 'departments'>(initialTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Banner */}
      <div className="pb-4 border-b border-stone-200">
        <div className="text-xs font-semibold text-emerald-900 tracking-wider uppercase mb-1">
          Institutional Governance & Profile
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
          The Institution: DARE ARQAM
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-prose-serif">
          Established in 1998 under a charter dedicated to academic rigor, scientific inquiry, and unyielding ethical formation.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-stone-100 p-1 rounded-md flex flex-wrap gap-1 border border-stone-200">
        <button
          onClick={() => setActiveTab('about')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'about'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
          }`}
        >
          About DARE ARQAM
        </button>
        <button
          onClick={() => setActiveTab('principal')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'principal'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
          }`}
        >
          Principal's Message
        </button>
        <button
          onClick={() => setActiveTab('vision')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'vision'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
          }`}
        >
          Vision & Mission
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
          }`}
        >
          Administration & Board
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'faculty'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
          }`}
        >
          Faculty & Staff
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'departments'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
          }`}
        >
          Academic Departments
        </button>
      </div>

      {/* 1. ABOUT DARE ARQAM */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white border border-stone-200 rounded-lg p-6 sm:p-8 space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-stone-900">
                Institutional Charter & History
              </h2>
              <div className="text-stone-700 text-xs sm:text-sm font-prose-serif leading-relaxed space-y-3">
                <p>
                  DARE ARQAM was founded in 1998 with an uncompromising educational charter: to synthesize classical ethical virtues and contemporary scientific rigor. Taking inspiration from the historic sanctuary of early scholarship (Dar al-Arqam), the institution cultivates an environment where intellect, character, and discipline converge.
                </p>
                <p>
                  Over more than two and a half decades of committed service, DARE ARQAM has evolved from a single model campus into an acclaimed institutional network educating tens of thousands of scholars across Pakistan. Our alumni consistently achieve high merit ranks in national board examinations, leading medical colleges, engineering universities, and public service institutes.
                </p>
                <p>
                  The institution operates under rigorous oversight guidelines, ensuring student-to-teacher ratios that guarantee individualized pastoral care, modern digital science laboratories, and high ethical standards.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-stone-500 block">Registration Code:</span>
                  <span className="font-bold text-stone-900">{INSTITUTION_INFO.registrationNo}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Accreditation:</span>
                  <span className="font-bold text-emerald-950">{INSTITUTION_INFO.affiliation}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-lg overflow-hidden border border-stone-200 shadow-sm bg-stone-100">
                <img
                  src="/src/assets/images/campus_main_building_1790434904126.jpg"
                  alt="DARE ARQAM Campus Main Administrative Block"
                  className="w-full h-64 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-3 bg-stone-900 text-stone-200 text-xs">
                  <span className="font-bold text-white">Central Secretariat & Academic Wing:</span> Built according to formal institutional architectural norms.
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-2">
                <h3 className="font-editorial text-sm font-bold text-stone-900">
                  Institutional Mandate
                </h3>
                <ul className="text-xs text-stone-600 space-y-1.5 font-prose-serif">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-900 shrink-0 mt-0.5" />
                    <span>Provide standardized, verified educational frameworks adhering to national guidelines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-900 shrink-0 mt-0.5" />
                    <span>Inculcate profound Quranic understanding, Arabic Tajweed, and civic responsibility.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-900 shrink-0 mt-0.5" />
                    <span>Maintain zero-compromise examination integrity and merit-based faculty appointments.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRINCIPAL'S MESSAGE */}
      {activeTab === 'principal' && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-10 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-stone-200">
            <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-emerald-900/30 shrink-0 shadow-sm bg-stone-100">
              <img
                src="/src/assets/images/principal_portrait_1790434918701.jpg"
                alt="Prof. Dr. Abdul Rahman Qureshi"
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-emerald-900 uppercase">
                EXECUTIVE COMMUNIQUE
              </div>
              <h2 className="font-editorial text-2xl font-bold text-stone-900 mt-1">
                Address by the Principal & Head of Institution
              </h2>
              <div className="text-sm font-bold text-stone-800 mt-1">
                {INSTITUTION_INFO.principalName}
              </div>
              <div className="text-xs text-stone-500">
                {INSTITUTION_INFO.principalQualification}
              </div>
            </div>
          </div>

          <div className="font-prose-serif text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4 max-w-4xl">
            <p className="first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:text-emerald-950">
              In the Name of Allah, the Most Gracious, the Most Merciful.
            </p>
            <p>
              It is my singular honor to welcome prospective scholars, esteemed parents, and distinguished members of our academic community to the official portal of DARE ARQAM School System.
            </p>
            <p>
              Education has always stood as the defining bedrock upon which civilized nations anchor their destinies. When an institution takes custody of young children, it takes custody of the future leaders, thinkers, doctors, engineers, and upright citizens of Pakistan. That responsibility cannot be taken lightly.
            </p>
            <blockquote className="border-l-3 border-emerald-900 pl-4 py-1 italic font-semibold text-stone-900">
              “True education does not merely teach a pupil to make a living; it instructs them in how to live with honor, honesty, compassion, and unwavering scientific diligence.”
            </blockquote>
            <p>
              Our pedagogical philosophy is grounded in balance. While our laboratory facilities, computing infrastructure, and academic curricula meet stringent national board specifications, our hearts remain committed to character building. Through systematic Quranic Tajweed, ethical reflections, physical education, and competitive speech assemblies, we cultivate young women and men equipped with self-respect and civic devotion.
            </p>
            <p>
              I invite parents to work collaboratively with our faculty coordinators. Let us continue to nurture our scholars with patience, wisdom, and prayers.
            </p>
            <div className="pt-4 text-xs font-semibold text-stone-900">
              Prof. Dr. Abdul Rahman Qureshi
              <div className="text-stone-500 font-normal">Principal & Head of Institution · DARE ARQAM</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. VISION & MISSION */}
      {activeTab === 'vision' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
              <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-900 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="font-editorial text-xl font-bold text-stone-900">
                Institutional Vision
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 font-prose-serif leading-relaxed">
                To stand as an exemplary Pakistani educational institution celebrated for cultivating generations of intellectually brilliant, ethically upright, and technologically capable citizens dedicated to societal welfare and national progress.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
              <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-900 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="font-editorial text-xl font-bold text-stone-900">
                Institutional Mission
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 font-prose-serif leading-relaxed">
                To deliver comprehensive, affordable, and high-standard academic schooling within an environment illuminated by Islamic morals, scientific rigor, critical inquiry, and deep civic commitment.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 space-y-4">
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              Core Institutional Pillars
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-white border border-stone-200 rounded-md">
                <div className="font-bold text-emerald-950">1. Ilm (Knowledge)</div>
                <p className="text-stone-600 mt-1">
                  Commitment to genuine conceptual understanding over rote memorization.
                </p>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-md">
                <div className="font-bold text-emerald-950">2. Akhlaq (Character)</div>
                <p className="text-stone-600 mt-1">
                  Inculcating integrity, modesty, mutual empathy, and truthfulness.
                </p>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-md">
                <div className="font-bold text-emerald-950">3. Khidmat (Service)</div>
                <p className="text-stone-600 mt-1">
                  Dedication to the progress of the community, homeland, and humanity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADMINISTRATION & BOARD */}
      {activeTab === 'admin' && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-6">
          <h2 className="font-editorial text-xl font-bold text-stone-900 pb-2 border-b border-stone-200">
            Administration & Board of Governors
          </h2>

          <div className="space-y-4 text-xs font-prose-serif text-stone-700 leading-relaxed">
            <p>
              DARE ARQAM is governed by an autonomous Board of Governors composed of distinguished academics, educational jurists, and administrative specialists.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-md space-y-1">
                <div className="text-[11px] font-bold text-emerald-900 uppercase">Board Chairman</div>
                <div className="text-sm font-bold text-stone-900">Dr. Mian Muhammad Akram</div>
                <div className="text-xs text-stone-500">Former Vice Chancellor & Senior Educational Policy Consultant</div>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-md space-y-1">
                <div className="text-[11px] font-bold text-emerald-900 uppercase">Director General (Academic Systems)</div>
                <div className="text-sm font-bold text-stone-900">Engr. Muhammad Asif Siddiqui</div>
                <div className="text-xs text-stone-500">Curriculum Development & Board Evaluation Director</div>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-md space-y-1">
                <div className="text-[11px] font-bold text-emerald-900 uppercase">Director (Finance & Development)</div>
                <div className="text-sm font-bold text-stone-900">Mr. Khalid Masood Cheema</div>
                <div className="text-xs text-stone-500">FCA, Chartered Financial Comptroller</div>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-md space-y-1">
                <div className="text-[11px] font-bold text-emerald-900 uppercase">Registrar & Executive Secretary</div>
                <div className="text-sm font-bold text-stone-900">Malik Muhammad Rafiq</div>
                <div className="text-xs text-stone-500">Institutional Governance & Regulatory Affairs</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FACULTY & STAFF */}
      {activeTab === 'faculty' && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-6">
          <div className="pb-2 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-editorial text-xl font-bold text-stone-900">
                Academic Faculty & Departmental Chairs
              </h2>
              <p className="text-xs text-stone-500 font-prose-serif mt-0.5">
                Qualified educators selected through competitive board screening and ongoing pedagogical training.
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-950 font-bold">
              100% Certified Secondary Faculty
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FACULTY_DATA.map((fac) => (
              <div key={fac.id} className="p-4 bg-stone-50 border border-stone-200 rounded-md space-y-1.5">
                <div className="text-[11px] font-mono font-bold text-emerald-900 uppercase">
                  {fac.department}
                </div>
                <h3 className="font-editorial text-sm font-bold text-stone-900">
                  {fac.name}
                </h3>
                <div className="text-xs font-medium text-stone-700">
                  {fac.designation}
                </div>
                <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                  <span>{fac.qualification}</span>
                  <span className="block mt-0.5 text-stone-600 font-mono">Exp: {fac.experience}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ACADEMIC DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-2">
              <h3 className="font-editorial text-base font-bold text-stone-900">
                Department of Natural & Physical Sciences
              </h3>
              <p className="text-xs text-stone-600 font-prose-serif leading-relaxed">
                Supervises secondary Physics, Chemistry, and Biology laboratories equipped for Board of Intermediate & Secondary Education practical examinations.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-2">
              <h3 className="font-editorial text-base font-bold text-stone-900">
                Department of Mathematics & Computing
              </h3>
              <p className="text-xs text-stone-600 font-prose-serif leading-relaxed">
                Manages quantitative mathematical thinking, algebraic fundamentals, computing laboratories, and high-school computer science syllabus tracks.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-2">
              <h3 className="font-editorial text-base font-bold text-stone-900">
                Department of Languages & Humanities
              </h3>
              <p className="text-xs text-stone-600 font-prose-serif leading-relaxed">
                Coordinates English and Urdu literary studies, grammar composition, Pakistan Studies, world geography, and inter-school debating societies.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-2">
              <h3 className="font-editorial text-base font-bold text-stone-900">
                Department of Quranic & Islamic Studies
              </h3>
              <p className="text-xs text-stone-600 font-prose-serif leading-relaxed">
                Oversees Hifz-ul-Quran classes, daily Nazra Tajweed recitation, Hadith translation courses, and annual Seerat-un-Nabi conferences.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-2">
              <h3 className="font-editorial text-base font-bold text-stone-900">
                Physical Education & Student Sports Wing
              </h3>
              <p className="text-xs text-stone-600 font-prose-serif leading-relaxed">
                Conducts daily assembly physical drills, annual athletics competitions, inter-house cricket tournaments, and table tennis leagues.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-2">
              <h3 className="font-editorial text-base font-bold text-stone-900">
                Student Counseling & Guidance Directorate
              </h3>
              <p className="text-xs text-stone-600 font-prose-serif leading-relaxed">
                Provides academic diagnostic support, career mentorship for matriculation graduates, and parental consultative meetings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
