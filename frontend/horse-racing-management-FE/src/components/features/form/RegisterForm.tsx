import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FIELDS, useRegisterForm } from '@/hooks/useRegisterForm';
import OtpBoxes from './OtpBoxes';
import Button from '@/components/ui/Button';
import type { UserRole } from '@/types';

interface RoleConfig { apiRole: UserRole; roleLabel: string }

interface RegisterFormProps {
 roles: Array<{ id: string; label: string; desc: string; Icon: ComponentType }>;
 roleConfig: Record<string, RoleConfig>;
}

const inputCls = (_err?: string) =>
 'w-full border border-rim bg-surface-input rounded px-4 py-3 text-sm text-ink ' +
 'placeholder:text-ink-4 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10';

const inputErrCls =
 'w-full border border-fail bg-surface-input rounded px-4 py-3 text-sm text-ink ' +
 'placeholder:text-ink-4 outline-none transition focus:border-fail focus:ring-2 focus:ring-fail/10';

/* Step progress dots */
function StepDots({ current }: { current: number | 'success' }) {
 const active = current === 'success' ? 3 : (current as number);
 return (
 <div className="flex items-center justify-center gap-2 mt-4 mb-6">
 {[1, 2, 3].map((i) => (
 <span
 key={i}
 className={`h-1.5 rounded-full transition-all duration-300 ${
 i <= active
 ? 'bg-navy w-6'
 : 'bg-rim w-2'
 }`}
 />
 ))}
 </div>
 );
}

export default function RegisterForm({ roles, roleConfig }: RegisterFormProps) {
 const {
 step, selectedRole,
 form, errors, apiError, handleChange, handleBlur,
 sendOtpLoading, handleNextStep, handleSelectRole, handleBack,
 otp, otpError, otpLoading, resendLoading, resendSuccess,
 handleOtpChange, handleVerify, handleResendOtp, handleGoToLogin,
 } = useRegisterForm();

 const onRoleClick = (roleId: string) => {
 const cfg = roleConfig[roleId];
 handleSelectRole(roleId, cfg.apiRole, cfg.roleLabel);
 };

 const reduce = useReducedMotion();
 const stepVariants = {
 initial: reduce ? {} : { opacity: 0, x: 20 },
 animate: { opacity: 1, x: 0 },
 exit: reduce ? {} : { opacity: 0, x: -20 },
 };

 /* ── Success ──────────────────────────────────────────────── */
 if (step === 'success') {
 return (
 <motion.div className="p-10 text-center"
 initial={reduce ? false : { opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ type: 'spring', stiffness: 140, damping: 16 }}>
 <motion.div className="mb-4 flex justify-center"
 initial={reduce ? false : { scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}>
 <CheckCircle size={56} className="text-ok" strokeWidth={1.5} />
 </motion.div>
 <h2 className="font-serif text-2xl font-bold text-ink">Registration Successful</h2>
 <p className="mt-2 text-sm text-ink-3">Your account has been created. Welcome to Royal Derby!</p>
 <Button className="mt-8 w-full" onClick={handleGoToLogin}>
 Sign In <ArrowRight size={15} />
 </Button>
 </motion.div>
 );
 }

 return (
 <div className="overflow-hidden">

 {/* ── Tabs header ──────────────────────────────────────── */}
 <div className="flex justify-center border-b border-rim px-8 pt-6">
 <Link to="/login" className="px-4 pb-3 text-sm font-medium text-ink-3 hover:text-ink transition-colors">
 Sign In
 </Link>
 <span className="-mb-px border-b-2 border-navy px-4 pb-3 text-sm font-semibold text-navy">
 Register
 </span>
 </div>

 <div className="overflow-hidden p-8">
 <AnimatePresence mode="wait">

 {/* ── Step 1: Role Selection ────────────────────────── */}
 {step === 1 && (
 <motion.div key="step1" {...stepVariants} transition={{ duration: 0.25 }}>
 <div className="text-center">
 <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl">
 Your journey starts{' '}
 <em className="not-italic text-gold">here.</em>
 </h1>
 <p className="mt-1 text-sm text-ink-3">Choose your role to get started:</p>
 </div>
 <div className="flex justify-center">
 <StepDots current={step} />
 </div>

 <div className="grid grid-cols-2 gap-3">
 {roles.map(({ id, label, desc, Icon }) => (
 <button key={id} type="button" onClick={() => onRoleClick(id)}
 className="flex items-start gap-3 rounded-md border border-rim bg-surface p-4 text-left transition hover:border-navy hover:bg-navy/5 hover:shadow-card group">
 <span className="mt-0.5 shrink-0 text-ink-3 group-hover:text-navy transition-colors">
 <Icon />
 </span>
 <span>
 <span className="block text-xs font-bold uppercase tracking-wider text-ink group-hover:text-navy transition-colors">
 {label}
 </span>
 <span className="mt-1 block text-xs leading-relaxed text-ink-3">{desc}</span>
 </span>
 </button>
 ))}
 </div>

 <p className="mt-6 text-center text-sm text-ink-3">
 Already have an account?{' '}
 <Link to="/login" className="font-semibold text-navy hover:text-navy-hi transition-colors">
 Sign in
 </Link>
 </p>
 </motion.div>
 )}

 {/* ── Step 2: Account Details ───────────────────────── */}
 {step === 2 && (
 <motion.div key="step2" {...stepVariants} transition={{ duration: 0.25 }}>
 <div className="text-center">
 <div className="mb-1 flex items-center justify-center gap-2">
 {selectedRole && (
 <span className="rounded-full bg-navy/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy">
 {selectedRole.roleLabel}
 </span>
 )}
 <span className="text-xs text-ink-4">Step 2 of 3</span>
 </div>
 <h2 className="font-serif text-2xl font-bold text-ink">Create Account</h2>
 </div>
 <StepDots current={step} />

 <button type="button" onClick={handleBack}
 className="mb-5 flex items-center justify-center gap-1.5 text-sm text-ink-3 hover:text-ink transition-colors">
 <ArrowLeft size={15} /> Back
 </button>

 {apiError && (
 <div className="mb-5 bg-fail-subtle px-4 py-3 text-sm text-fail">{apiError}</div>
 )}

 <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} noValidate>
 {FIELDS.map((f) => (
 <div key={f.name}>
 <label className="mb-1.5 block text-xs font-medium text-ink-3" htmlFor={`rg-${f.name}`}>
 {f.label}
 </label>
 <input
 id={`rg-${f.name}`}
 name={f.name}
 type={f.type}
 placeholder={f.placeholder}
 value={form[f.name as keyof typeof form]}
 onChange={handleChange}
 onBlur={handleBlur}
 aria-invalid={!!errors[f.name as keyof typeof errors]}
 className={errors[f.name as keyof typeof errors] ? inputErrCls : inputCls()}
 />
 {errors[f.name as keyof typeof errors] && (
 <p className="mt-1 text-xs text-fail">{errors[f.name as keyof typeof errors]}</p>
 )}
 </div>
 ))}

 <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={sendOtpLoading}>
 {sendOtpLoading
 ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-blue border-t-transparent" />
 : <>Next Step <ArrowRight size={15} /></>}
 </Button>
 </form>

 <p className="mt-5 text-center text-sm text-ink-3">
 Already have an account?{' '}
 <Link to="/login" className="font-semibold text-navy hover:text-navy-hi transition-colors">Sign in</Link>
 </p>
 </motion.div>
 )}

 {/* ── Step 3: OTP Verification ──────────────────────── */}
 {step === 3 && (
 <motion.div key="step3" {...stepVariants} transition={{ duration: 0.25 }}>
 <div className="text-center">
 <span className="text-xs text-ink-4">Step 3 of 3</span>
 <h2 className="mt-1 font-serif text-2xl font-bold text-ink">Verify Your Email</h2>
 <p className="mt-1 text-sm text-ink-3">
 We sent a 6-digit code to{' '}
 <strong className="font-semibold text-ink">{form.email}</strong>
 </p>
 </div>
 <StepDots current={step} />

 <button type="button" onClick={handleBack}
 className="mb-6 flex items-center justify-center gap-1.5 text-sm text-ink-3 hover:text-ink transition-colors">
 <ArrowLeft size={15} /> Back
 </button>

 {apiError && (
 <div className="mb-4 bg-fail-subtle px-4 py-3 text-sm text-fail">{apiError}</div>
 )}

 <div className="space-y-5">
 <OtpBoxes value={otp} onChange={handleOtpChange} hasError={!!otpError} />

 {otpError && (
 <p className="text-center text-sm text-fail">{otpError}</p>
 )}

 <div className="flex items-center justify-center gap-2 text-sm text-ink-3">
 <span>Didn't receive the code?</span>
 {resendSuccess && <span className="text-ok font-medium">Sent!</span>}
 <button type="button" disabled={resendLoading} onClick={handleResendOtp}
 className="font-semibold text-navy hover:text-navy-hi transition-colors disabled:opacity-50">
 {resendLoading ? 'Sending…' : 'Resend'}
 </button>
 </div>

 <Button type="button" variant="primary" size="lg" className="w-full" disabled={otpLoading} onClick={handleVerify}>
 {otpLoading
 ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-blue border-t-transparent" />
 : <>Verify & Create Account <ArrowRight size={15} /></>}
 </Button>
 </div>

 <p className="mt-6 text-center text-sm text-ink-3">
 Already have an account?{' '}
 <Link to="/login" className="font-semibold text-navy hover:text-navy-hi transition-colors">Sign in</Link>
 </p>
 </motion.div>
 )}

 </AnimatePresence>
 </div>
 </div>
 );
}
