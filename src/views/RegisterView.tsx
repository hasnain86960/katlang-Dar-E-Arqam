import React, { useState } from 'react';
import { PageId } from '../types';
import { Emblem } from '../components/Emblem';
import { 
  User, 
  FileText, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck 
} from 'lucide-react';
import { registerStudentWithFirebase } from '../services/firebaseService';
import { EmailVerificationScreen } from '../components/EmailVerificationScreen';

interface RegisterViewProps {
  onNavigate: (page: PageId, authMode?: 'choice' | 'login') => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate }) => {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    dob: '',
    gender: 'Male',
    bForm: '',
    phone: '',
    targetClass: 'Class IX (Secondary)',
    previousInstitution: '',
    previousResult: '',
    email: '',
    address: '',
    city: 'Islamabad',
    district: 'Islamabad Capital Territory',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [assignedStudentId, setAssignedStudentId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = 'Father / Guardian Name is required';
    if (!formData.dob) newErrors.dob = 'Date of Birth is required';
    if (!formData.bForm.trim()) newErrors.bForm = 'CNIC or NADRA B-Form number is required';
    if (!formData.phone.trim()) newErrors.phone = 'Valid Pakistani telephone / mobile is required';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid Email is required';
    if (!formData.address.trim()) newErrors.address = 'Residential Address is required';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must acknowledge the Institutional Terms & Regulations';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerStudentWithFirebase({
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        dob: formData.dob,
        gender: formData.gender,
        bForm: formData.bForm,
        phone: formData.phone,
        targetClass: formData.targetClass,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        password: formData.password,
      });

      setAssignedStudentId(result.studentId);
      setIsRegistered(true);
    } catch (err: any) {
      let message = 'Registration failed. Please review your credentials.';
      if (err?.code === 'auth/email-already-in-use') {
        message = 'This email address is already registered with another student account.';
      } else if (err?.code === 'auth/weak-password') {
        message = 'The password is too weak. Please use at least 6 characters.';
      } else if (err?.message) {
        message = err.message;
      }
      setErrors(prev => ({ ...prev, form: message }));
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRegistered) {
    return (
      <EmailVerificationScreen
        email={formData.email}
        studentId={assignedStudentId}
        onVerified={() => onNavigate('student-portal')}
        onReturnToRegister={() => setIsRegistered(false)}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Navigation & Header */}
      <div className="pb-4 border-b border-[#CBD5E1] space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('student-login', 'choice')}
            className="inline-flex items-center gap-1.5 text-xs text-[#20216B] hover:text-[#171852] font-semibold hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal Options</span>
          </button>

          <div className="text-xs text-[#334155]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('student-login', 'login')}
              className="font-bold text-[#20216B] hover:text-[#171852] underline cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-[#20216B] tracking-wider uppercase mb-1">
            Directorate of Student Admissions & Records
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F1035]">
            Student Registration & Account Creation
          </h1>
          <p className="text-xs sm:text-sm text-[#334155] mt-1 max-w-2xl font-prose-serif">
            Official enrollment intake form for newly admitted or prospective candidates across all wings of DAR - E - ARQAM.
          </p>
        </div>
      </div>

      {/* Main Multi-Section Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {errors.form && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-red-800 text-xs">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#CBD5E1]">
            <User className="w-5 h-5 text-[#20216B]" />
            <h2 className="font-editorial text-lg font-bold text-[#0F1035]">
              1. Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Full Name of Candidate *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Muhammad Bilal Khan"
                className={`w-full px-3 py-2 text-xs border rounded-md bg-[#F8FAFC] ${
                  errors.fullName ? 'border-red-500 bg-red-50' : 'border-[#94A3B8]'
                }`}
              />
              {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Father / Guardian Name *
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="e.g. Tariq Mehmood Khan"
                className={`w-full px-3 py-2 text-xs border rounded-md bg-[#F8FAFC] ${
                  errors.fatherName ? 'border-red-500 bg-red-50' : 'border-[#94A3B8]'
                }`}
              />
              {errors.fatherName && <p className="text-[11px] text-red-600 mt-1">{errors.fatherName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-xs border rounded-md bg-[#F8FAFC] ${
                  errors.dob ? 'border-red-500 bg-red-50' : 'border-[#94A3B8]'
                }`}
              />
              {errors.dob && <p className="text-[11px] text-red-600 mt-1">{errors.dob}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Candidate CNIC / NADRA B-Form Number *
              </label>
              <input
                type="text"
                name="bForm"
                value={formData.bForm}
                onChange={handleChange}
                placeholder="e.g. 61101-1234567-1"
                className={`w-full px-3 py-2 text-xs border rounded-md bg-[#F8FAFC] font-mono ${
                  errors.bForm ? 'border-red-500 bg-red-50' : 'border-[#94A3B8]'
                }`}
              />
              {errors.bForm && <p className="text-[11px] text-red-600 mt-1">{errors.bForm}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Primary Contact / Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 0300-1234567"
                className={`w-full px-3 py-2 text-xs border rounded-md bg-[#F8FAFC] ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-[#94A3B8]'
                }`}
              />
              {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 2: ACADEMIC INFORMATION */}
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#CBD5E1]">
            <FileText className="w-5 h-5 text-[#20216B]" />
            <h2 className="font-editorial text-lg font-bold text-[#0F1035]">
              2. Academic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Class Applied For *
              </label>
              <select
                name="targetClass"
                value={formData.targetClass}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
              >
                <option value="Playgroup / Kindergarten">Playgroup / Kindergarten</option>
                <option value="Class I to V (Primary Wing)">Class I to V (Primary Wing)</option>
                <option value="Class VI to VIII (Middle Wing)">Class VI to VIII (Middle Wing)</option>
                <option value="Class IX (Secondary Science)">Class IX (Secondary Science)</option>
                <option value="Class X (Matriculation)">Class X (Matriculation)</option>
                <option value="HSSC-I (Pre-Medical)">HSSC-I (Pre-Medical)</option>
                <option value="HSSC-I (Pre-Engineering)">HSSC-I (Pre-Engineering)</option>
                <option value="HSSC-I (ICS Computer Science)">HSSC-I (ICS Computer Science)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Previous Institution
              </label>
              <input
                type="text"
                name="previousInstitution"
                value={formData.previousInstitution}
                onChange={handleChange}
                placeholder="e.g. Government High School / Private Academy"
                className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Previous Examination & Marks / Grade
              </label>
              <input
                type="text"
                name="previousResult"
                value={formData.previousResult}
                onChange={handleChange}
                placeholder="e.g. Class VIII Annual Exam - 88% (Grade A1)"
                className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: CONTACT INFORMATION */}
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#CBD5E1]">
            <MapPin className="w-5 h-5 text-[#20216B]" />
            <h2 className="font-editorial text-lg font-bold text-[#0F1035]">
              3. Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Official Guardian Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. guardian@domain.com"
                className={`w-full px-3 py-2 text-xs border rounded-md bg-[#F8FAFC] ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-[#94A3B8]'
                }`}
              />
              {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Permanent Residential Address *
              </label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="House #, Street, Sector / Area"
                className={`w-full px-3 py-2 text-xs border rounded-md bg-[#F8FAFC] ${
                  errors.address ? 'border-red-500 bg-red-50' : 'border-[#94A3B8]'
                }`}
              />
              {errors.address && <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                District *
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: ACCOUNT SECURITY */}
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#CBD5E1]">
            <Lock className="w-5 h-5 text-[#20216B]" />
            <h2 className="font-editorial text-lg font-bold text-[#0F1035]">
              4. Student Portal Account
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Portal Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className={`w-full px-3 py-2 text-xs border rounded-md bg-[#F8FAFC] ${
                  errors.password ? 'border-red-500 bg-red-50' : 'border-[#94A3B8]'
                }`}
              />
              {errors.password && <p className="text-[11px] text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={`w-full px-3 py-2 text-xs border rounded-md bg-[#F8FAFC] ${
                  errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-[#94A3B8]'
                }`}
              />
              {errors.confirmPassword && <p className="text-[11px] text-red-600 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        {/* Terms and Submit */}
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-5 space-y-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded-sm border-[#94A3B8] text-[#20216B] focus:ring-[#20216B]"
            />
            <label htmlFor="termsAccepted" className="text-xs text-[#1E293B] leading-relaxed">
              I affirm that all particulars provided in this student registration document are accurate and verifiable against original NADRA B-Form and institutional records. I pledge to adhere to the disciplinary code and academic regulations of DAR - E - ARQAM School System.
            </label>
          </div>
          {errors.termsAccepted && (
            <p className="text-[11px] text-red-600 pl-7">{errors.termsAccepted}</p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 text-xs sm:text-sm font-semibold text-white bg-[#20216B] hover:bg-[#292A86] rounded-md transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <span>Generating Institutional Record...</span>
              ) : (
                <>
                  <span>Complete Student Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-xs text-[#334155]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('student-login', 'login')}
                className="font-bold text-[#20216B] hover:text-[#171852] underline cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
