import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
 message: string;
 type?: ToastType;
 onClose: () => void;
}

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertCircle };
const STYLES = {
 success: 'bg-surface-raised border-ok/40 text-ok',
 error: 'bg-surface-raised border-fail/40 text-fail',
 warning: 'bg-surface-raised border-warn/40 text-warn',
};

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
 const Icon = ICONS[type];
 return (
 <div className={`flex items-center gap-3 border px-4 py-3 shadow-xl ${STYLES[type]}`} role="alert">
 <Icon size={18} className="shrink-0" />
 <span className="flex-1 text-sm text-ink-2">{message}</span>
 <button type="button" onClick={onClose} aria-label="Dismiss" className=" p-0.5 text-ink-4 hover:text-ink transition-colors">
 <X size={16} />
 </button>
 </div>
 );
}
