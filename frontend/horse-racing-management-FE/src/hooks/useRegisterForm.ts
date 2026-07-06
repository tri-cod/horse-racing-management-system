import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@/api/authApi';
import { sendVerificationOtp, verifyEmail } from '@/api/emailVerifyApi';
import type { UserRole } from '@/types';

// ─── Field definitions ────────────────────────────────────────────────────────

export interface RegisterFieldDef {
 name: string;
 label: string;
 type: string;
 placeholder: string;
 full?: boolean;
}

export const FIELDS: RegisterFieldDef[] = [
 { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe', full: true },
 { name: 'username', label: 'Username', type: 'text', placeholder: 'johndoe' },
 { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
 { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+84 234 567 890' },
 { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
 { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 'success';

interface SelectedRole {
 id: string;
 apiRole: UserRole;
 roleLabel: string;
}

interface RegisterFormData {
 fullName: string;
 username: string;
 email: string;
 phone: string;
 password: string;
 confirmPassword: string;
}

type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(name: keyof RegisterFormData, value: string, form: RegisterFormData): string {
 if (!value || !value.trim()) return`${name.replace(/([A-Z])/g, ' $1')} is required`;
 if (name === 'password' && value.length < 8) return 'Password must be at least 8 characters';
 if (name === 'confirmPassword' && value !== form.password) return 'Passwords do not match';
 if (name === 'phone' && !/^[0-9]{10,11}$/.test(value)) return 'Phone must be 10–11 digits';
 return '';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const emptyForm: RegisterFormData = {
 fullName: '', username: '', email: '', phone: '', password: '', confirmPassword: '',
};

export function useRegisterForm() {
 const navigate = useNavigate();
 const [step, setStep] = useState<Step>(1);
 const [selectedRole, setSelectedRole] = useState<SelectedRole | null>(null);
 const [form, setForm] = useState<RegisterFormData>(emptyForm);
 const [errors, setErrors] = useState<FormErrors>({});
 const [apiError, setApiError] = useState('');
 const [otp, setOtp] = useState('');
 const [otpError, setOtpError] = useState('');
 const [otpLoading, setOtpLoading] = useState(false);
 const [sendOtpLoading, setSendOtpLoading] = useState(false);
 const [resendLoading, setResendLoading] = useState(false);
 const [resendSuccess, setResendSuccess] = useState(false);

 const handleSelectRole = (id: string, apiRole: UserRole, roleLabel: string) => {
 setSelectedRole({ id, apiRole, roleLabel });
 setStep(2);
 };

 const handleBack = () => {
 if (step === 2) { setStep(1); setSelectedRole(null); setForm(emptyForm); setErrors({}); setApiError(''); }
 else if (step === 3) { setStep(2); setOtp(''); setOtpError(''); setResendSuccess(false); }
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { name, value } = e.target;
 const updated = { ...form, [name]: value };
 setForm(updated);
 setApiError('');
 setErrors((prev) => ({ ...prev, [name]: validate(name as keyof RegisterFormData, value, updated) }));
 // Re-validate confirm password when password changes
 if (name === 'password') {
 setErrors((prev) => ({
 ...prev,
 confirmPassword: updated.confirmPassword
 ? validate('confirmPassword', updated.confirmPassword, updated)
 : '',
 }));
 }
 if (name === 'email') { setOtp(''); setOtpError(''); setResendSuccess(false); }
 };

 const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { name, value } = e.target;
 setErrors((prev) => ({ ...prev, [name]: validate(name as keyof RegisterFormData, value, form) }));
 };

 // Validate all fields, send OTP, advance to step 3
 const handleNextStep = async () => {
 const newErrors: FormErrors = {};
 FIELDS.forEach((f) => {
 const err = validate(f.name as keyof RegisterFormData, form[f.name as keyof RegisterFormData], form);
 if (err) newErrors[f.name as keyof RegisterFormData] = err;
 });
 if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

 setSendOtpLoading(true);
 try {
 await sendVerificationOtp(form.email);
 setOtp(''); setOtpError(''); setResendSuccess(false);
 setStep(3);
 } catch (e: unknown) {
 const err = e as { response?: { data?: { message?: string } } };
 setErrors((prev) => ({ ...prev, email: err.response?.data?.message ?? 'Failed to send verification code' }));
 } finally {
 setSendOtpLoading(false);
 }
 };

 const handleOtpChange = (value: string) => { setOtp(value); setOtpError(''); };

 const handleResendOtp = async () => {
 setResendLoading(true); setResendSuccess(false); setOtpError('');
 try {
 await sendVerificationOtp(form.email);
 setResendSuccess(true);
 } catch {
 setOtpError('Failed to resend code. Please try again.');
 } finally {
 setResendLoading(false);
 }
 };

 // Verify OTP → register → show success
 const handleVerify = async () => {
 if (otp.replace(/\s/g, '').length < 6) {
 setOtpError('Please enter the complete 6-digit code');
 return;
 }
 setOtpLoading(true);
 try {
 await verifyEmail(form.email, otp);
 } catch (e: unknown) {
 const err = e as { response?: { data?: { message?: string } } };
 setOtpError(err.response?.data?.message ?? 'Invalid or expired code. Please try again.');
 setOtpLoading(false);
 return;
 }
 try {
 const { confirmPassword: _cp, ...rest } = form;
 void _cp;
 await register({ ...rest, role: selectedRole!.apiRole });
 setStep('success');
 } catch (e: unknown) {
 const err = e as { response?: { data?: { message?: string } } };
 setApiError(err.response?.data?.message ?? 'Registration failed. Please try again.');
 } finally {
 setOtpLoading(false);
 }
 };

 const handleGoToLogin = () => navigate('/login');

 return {
 step, selectedRole,
 form, errors, apiError, handleChange, handleBlur,
 sendOtpLoading, handleNextStep, handleSelectRole, handleBack,
 otp, otpError, otpLoading, resendLoading, resendSuccess,
 handleOtpChange, handleVerify, handleResendOtp,
 handleGoToLogin,
 };
}
