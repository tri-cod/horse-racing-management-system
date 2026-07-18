import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { forgotPassword, resetPassword } from '@/api/authApi';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '@/components/seo/Seo';
import Button from '@/components/ui/Button';
import OtpBoxes from '@/components/features/form/OtpBoxes';
import AuthSplitLayout from '@/components/layout/AuthSplitLayout';

const STEPS = ['Enter Email', 'Reset Password'];

const inputCls =
 'w-full border border-rim bg-surface-input rounded px-4 py-3 text-sm text-ink ' +
 'placeholder:text-ink-4 outline-none transition ' +
 'focus:border-navy focus:ring-2 focus:ring-navy/10';

const inputErrCls =
 'w-full border border-fail bg-surface-input rounded px-4 py-3 text-sm text-ink ' +
 'placeholder:text-ink-4 outline-none transition focus:border-fail focus:ring-2 focus:ring-fail/10';

export default function ForgotPasswordPage() {
 const navigate = useNavigate();
 const reduce = useReducedMotion();
 const stepVariants = {
 initial: reduce ? {} : { opacity: 0, x: 16 },
 animate: { opacity: 1, x: 0 },
 exit: reduce ? {} : { opacity: 0, x: -16 },
 };
 const [step, setStep] = useState(1);
 const [email, setEmail] = useState('');
 const [otp, setOtp] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [showPw, setShowPw] = useState(false);
 const [showConfirm, setShowConfirm] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

 const clear = () => { setError(''); setSuccess(''); };

 const handleSendOtp = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!email) return setError('Please enter your email.');
 clear(); setLoading(true);
 try {
 await forgotPassword(email);
 setSuccess('OTP sent to your email.');
 setStep(2);
 } catch (err: unknown) {
 const e = err as { response?: { data?: { message?: string } }; message?: string };
 setError(e.response?.data?.message ?? e.message ?? 'Failed to send OTP.');
 } finally { setLoading(false); }
 };

 // OTP is verified and consumed in this single call (backend treats verify+reset
 // as one operation). We deliberately don't call verifyResetOtp separately first —
 // the backend's OTP store is one-time-use, so a prior "verify" call would consume
 // it and make this call always fail with "Invalid or expired OTP".
 const handleReset = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!otp) return setError('Please enter the OTP code.');
 if (!newPassword || !confirmPassword) return setError('Please fill in all fields.');
 if (newPassword.length < 8) return setError('Password must be at least 8 characters.');
 if (newPassword !== confirmPassword) return setError('Passwords do not match.');
 clear(); setLoading(true);
 try {
 await resetPassword(otp, email, newPassword);
 setSuccess('Password reset successfully. Redirecting...');
 setTimeout(() => navigate('/login'), 2000);
 } catch (err: unknown) {
 const e = err as { response?: { data?: { message?: string } }; message?: string };
 setError(e.response?.data?.message ?? e.message ?? 'Failed to reset password.');
 } finally { setLoading(false); }
 };

 const spinner = (
 <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-blue border-t-transparent" />
 );

 return (
 <AuthSplitLayout>
 <Seo title="Reset Password" description="Reset your Royal Derby account password securely." />

 {/* Heading */}
 <div className="mb-8">
 <h1 className="font-serif text-4xl font-bold text-ink sm:text-5xl">
 {step === 1 ? 'Forgot Password?' : 'Set New Password'}
 </h1>
 <p className="mt-2 text-base text-ink-3">
 {step === 1 ?"Enter your email and we'll send you a reset code."
 : `Enter the 6-digit code sent to ${email} and choose a new password.`}
 </p>
 </div>

 {/* Step indicator */}
 <div className="mb-8 flex items-start justify-center">
 {STEPS.map((label, i) => {
 const n = i + 1;
 const done = step > n;
 const active = step === n;
 return (
 <div key={n} className="flex items-start">
 <div className="flex w-24 flex-col items-center gap-1.5">
 <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
 done ? 'bg-navy text-on-blue' :
 active ? 'bg-navy text-on-blue ring-4 ring-navy/20' :
 'bg-rim text-ink-4'
 }`}>
 {done ? <Check size={14} /> : n}
 </div>
 <span className={`text-center text-[10px] font-medium leading-tight ${
 active ? 'text-navy' : done ? 'text-ink-3' : 'text-ink-4'
 }`}>
 {label}
 </span>
 </div>
 {i < STEPS.length - 1 && (
 <div className={`mt-4 h-px w-8 transition-colors ${done ? 'bg-navy' : 'bg-rim'}`} />
 )}
 </div>
 );
 })}
 </div>

 {/* Alerts */}
 {error && <div role="alert" className="mb-5 bg-fail-subtle px-4 py-3 text-sm text-fail">{error}</div>}
 {success && <div role="status" className="mb-5 bg-ok-subtle px-4 py-3 text-sm text-ok">{success}</div>}

 <AnimatePresence mode="wait">
 {/* Step 1 — Email */}
 {step === 1 && (
 <motion.form key="step1" {...stepVariants} transition={{ duration: 0.25 }}
 onSubmit={handleSendOtp} className="space-y-5" noValidate>
 <div>
 <label htmlFor="fp-email" className="mb-1.5 block text-xs font-medium text-ink-3">Email address</label>
 <input id="fp-email" type="email" className={error ? inputErrCls : inputCls} placeholder="Enter your registered email"
 value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} />
 </div>
 <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
 {loading ? spinner : <>Send Reset Code <ArrowRight size={15} /></>}
 </Button>
 <div className="text-center">
 <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-navy hover:text-navy-hi transition-colors">
 <ArrowLeft size={14} /> Back to Sign In
 </Link>
 </div>
 </motion.form>
 )}

 {/* Step 2 — OTP + New Password (combined so the OTP is only ever
 verified once, by the final submit) */}
 {step === 2 && (
 <motion.form key="step2" {...stepVariants} transition={{ duration: 0.25 }}
 onSubmit={handleReset} className="space-y-5" noValidate>
 <div>
 <label className="mb-2 block text-center text-xs font-medium text-ink-3">OTP Code</label>
 <OtpBoxes value={otp} onChange={setOtp} hasError={!!error} />
 </div>
 <div>
 <label htmlFor="fp-pw" className="mb-1.5 block text-xs font-medium text-ink-3">New Password</label>
 <div className="relative">
 <input id="fp-pw" type={showPw ? 'text' : 'password'} className={error ? inputErrCls : inputCls}
 placeholder="At least 8 characters" aria-invalid={!!error}
 value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
 <button type="button" onClick={() => setShowPw(!showPw)}
 aria-label={showPw ? 'Hide password' : 'Show password'}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-2 transition-colors">
 {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
 </button>
 </div>
 </div>
 <div>
 <label htmlFor="fp-pw2" className="mb-1.5 block text-xs font-medium text-ink-3">Confirm Password</label>
 <div className="relative">
 <input id="fp-pw2" type={showConfirm ? 'text' : 'password'} className={error ? inputErrCls : inputCls}
 placeholder="Re-enter your password" aria-invalid={!!error}
 value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
 <button type="button" onClick={() => setShowConfirm(!showConfirm)}
 aria-label={showConfirm ? 'Hide password' : 'Show password'}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-2 transition-colors">
 {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
 </button>
 </div>
 </div>
 <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
 {loading ? spinner : <>Reset Password <ArrowRight size={15} /></>}
 </Button>
 <div className="text-center">
 <button type="button" onClick={() => { clear(); setStep(1); }}
 className="inline-flex items-center gap-1.5 text-sm text-navy hover:text-navy-hi transition-colors">
 <ArrowLeft size={14} /> Resend OTP
 </button>
 </div>
 </motion.form>
 )}
 </AnimatePresence>
 </AuthSplitLayout>
 );
}
