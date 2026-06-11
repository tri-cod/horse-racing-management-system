import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import '../../assets/css/ui/Toast.css';

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertCircle,
};

export default function Toast({ message, type = 'success', onClose }) {
  const Icon = ICONS[type] || CheckCircle;
  return (
    <div className={`toast toast--${type}`} role="alert">
      <Icon size={18} className="toast__icon" />
      <span className="toast__message">{message}</span>
      <button type="button" className="toast__close" onClick={onClose} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}