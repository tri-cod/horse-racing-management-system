import { useState, useEffect } from 'react';
import { X, AlertCircle, Copy, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { createDeposit } from '@/api/walletApi';
import Button from '@/components/ui/Button';

const fmt = (n?: number) =>
 n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : '—';

const QUICK = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

const STEPS = ['Enter Amount', 'Scan & Pay'];

interface DepositResult { amount?: number; qrUrl?: string; referenceCode?: string }

interface DepositModalProps {
 open: boolean;
 onClose: () => void;
 onSuccess?: () => void;
}

export default function DepositModal({ open, onClose, onSuccess }: DepositModalProps) {
 const [step, setStep] = useState(1);
 const [amount, setAmount] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [result, setResult] = useState<DepositResult | null>(null);
 const [copied, setCopied] = useState(false);

 useEffect(() => { if (open) { setStep(1); setAmount(''); setError(''); setResult(null); setCopied(false); } }, [open]);
 useEffect(() => {
 if (!open) return;
 const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
 document.addEventListener('keydown', h);
 return () => document.removeEventListener('keydown', h);
 }, [open, onClose]);

 if (!open) return null;

 const handleCopy = () => {
 if (result?.referenceCode) { navigator.clipboard.writeText(result.referenceCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 const amt = parseInt(amount, 10);
 if (isNaN(amt) || amt < 10000) { setError('Minimum deposit is 10,000 ₫.'); return; }
 try {
 setLoading(true); setError('');
 const data = await createDeposit({ amount: amt });
 setResult(data as unknown as DepositResult);
 setStep(2);
 onSuccess?.();
 } catch (e: unknown) {
 const err = e as { response?: { data?: { message?: string } } };
 setError(err?.response?.data?.message ?? 'Failed to create deposit request.');
 } finally { setLoading(false); }
 };

 const stepDot = (n: number) => {
 const done = step > n;
 const active = step === n;
 return (
 <div className="flex flex-col items-center gap-1.5">
 <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
 done ? 'bg-navy text-on-blue' : active ? 'bg-navy text-on-blue ring-4 ring-navy/15' : 'bg-rim text-ink-4'
 }`}>
 {done ? <CheckCircle size={13} /> : n}
 </div>
 <span className={`text-[10px] font-medium uppercase tracking-wider ${active ? 'text-navy' : 'text-ink-4'}`}>
 {STEPS[n - 1]}
 </span>
 </div>
 );
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onMouseDown={onClose}>
 <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-rim bg-surface-raised shadow-2xl"
 onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">

 {/* Header */}
 <div className="flex items-center justify-between border-b border-rim px-6 py-4">
 <div className="flex items-center gap-2.5">
 {step === 2 && (
 <button type="button" onClick={() => setStep(1)}
 className="text-ink-3 hover:text-ink transition-colors">
 <ArrowLeft size={16} />
 </button>
 )}
 <div>
 <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Step {step} of 2</p>
 <h3 className="font-serif text-lg font-bold text-ink">{step === 1 ? 'Deposit Funds' : 'Complete Payment'}</h3>
 </div>
 </div>
 <button type="button" onClick={onClose} className="text-ink-3 hover:text-ink transition-colors" aria-label="Close">
 <X size={20} />
 </button>
 </div>

 {/* Step indicator */}
 <div className="flex items-start justify-center gap-3 border-b border-rim bg-surface px-6 py-4">
 {stepDot(1)}
 <div className={`mt-3.5 h-px w-10 transition-colors ${step > 1 ? 'bg-navy' : 'bg-rim'}`} />
 {stepDot(2)}
 </div>

 <div className="px-6 py-5">
 {step === 1 && (
 <form onSubmit={handleSubmit} className="space-y-4" noValidate>
 <div>
 <label htmlFor="deposit-amount" className="mb-1.5 block text-xs font-medium text-ink-3">Amount (VND)</label>
 <div className="relative">
 <input id="deposit-amount" type="number" autoFocus required
 min="10000" step="1000" value={amount} onChange={(e) => setAmount(e.target.value)}
 placeholder="0"
 className="w-full appearance-none rounded border border-rim bg-surface-input px-4 py-3 pr-10 text-lg font-semibold text-ink outline-none transition [appearance:textfield] focus:border-navy focus:ring-2 focus:ring-navy/10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-4">₫</span>
 </div>
 {amount && parseInt(amount) >= 10000 && (
 <p className="mt-1.5 text-xs text-ink-3">{fmt(parseInt(amount))}</p>
 )}
 </div>

 <div className="grid grid-cols-3 gap-2">
 {QUICK.map((amt) => (
 <button key={amt} type="button" onClick={() => setAmount(String(amt))}
 className={`rounded border px-2 py-2 text-xs font-semibold transition-colors ${
 amount === String(amt) ? 'border-navy bg-navy text-on-blue' : 'border-rim text-ink-2 hover:border-navy hover:text-navy'
 }`}>
 {fmt(amt).replace('₫', '').trim()}
 </button>
 ))}
 </div>

 {error && (
 <div className="flex items-center gap-2 rounded bg-fail-subtle px-3 py-2.5 text-xs text-fail">
 <AlertCircle size={14} className="shrink-0" />{error}
 </div>
 )}

 <p className="text-xs leading-relaxed text-ink-4">
 After submitting, you will receive a VietQR code. Transfer the exact amount with the reference code to complete your deposit.
 </p>

 <div className="flex gap-3 pt-1">
 <Button type="button" variant="ghost" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
 <Button type="submit" variant="primary" size="md" className="flex-1"
 disabled={loading || !amount || parseInt(amount) < 10000}>
 {loading ? 'Processing...' : <>Proceed to Payment <ArrowRight size={14} /></>}
 </Button>
 </div>
 </form>
 )}

 {step === 2 && result && (
 <div className="space-y-4">
 <div className="rounded-md border border-rim bg-surface px-4 py-3 text-center">
 <p className="text-xs uppercase tracking-wider text-ink-3">Amount to transfer</p>
 <p className="tnum mt-1 font-serif text-2xl font-bold text-ink">{fmt(result.amount)}</p>
 </div>

 {result.qrUrl ? (
 <div className="flex flex-col items-center gap-2 rounded-md border border-rim bg-surface p-4">
 <img src={result.qrUrl} alt="VietQR Code" className="h-48 w-48 object-contain" />
 <span className="text-[11px] text-ink-4">Powered by VietQR</span>
 </div>
 ) : (
 <div className="rounded bg-warn-subtle px-3 py-2.5 text-xs text-warn">
 QR code not available. Please use the reference code below for manual transfer.
 </div>
 )}

 <div>
 <p className="mb-1.5 text-xs font-medium text-ink-3">Reference Code (include in transfer description)</p>
 <div className="flex items-center gap-2 rounded border border-rim bg-surface-input px-3 py-2.5">
 <code className="flex-1 truncate text-sm font-semibold text-ink">{result.referenceCode}</code>
 <button type="button" onClick={handleCopy}
 className="flex shrink-0 items-center gap-1 rounded border border-rim-hi px-2.5 py-1 text-xs font-medium text-ink-2 transition-colors hover:border-navy hover:text-navy">
 {copied ? <><CheckCircle size={13} className="text-ok" /> Copied!</> : <><Copy size={13} /> Copy</>}
 </button>
 </div>
 </div>

 <div className="flex items-start gap-2 rounded bg-ok-subtle px-3 py-2.5 text-xs leading-relaxed text-ok">
 <CheckCircle size={14} className="mt-0.5 shrink-0" />
 Your deposit will be credited after admin verification. This usually takes a few hours.
 </div>

 <Button type="button" variant="primary" size="md" className="w-full" onClick={onClose}>Done</Button>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
