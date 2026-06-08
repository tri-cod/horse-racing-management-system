import { useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

/**
 * Toast notification đơn giản, tự ẩn sau `duration` ms.
 *
 * Props:
 *  - toast:    { id, tone: 'success' | 'error', message } | null
 *  - onClose:  callback đóng
 *  - duration: ms (default 3000)
 */
export default function Toast({ toast, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const Icon = toast.tone === 'error' ? AlertTriangle : CheckCircle;

  return (
    <div className={`au-toast au-toast--${toast.tone}`} role="status" aria-live="polite">
      <Icon size={18} className="au-toast__icon" />
      <span className="au-toast__message">{toast.message}</span>
      <button
        type="button"
        className="au-toast__close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
