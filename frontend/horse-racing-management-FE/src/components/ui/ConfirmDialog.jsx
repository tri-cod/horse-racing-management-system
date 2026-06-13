import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import '../../assets/css/ui/ConfirmDialog.css';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="confirm-dialog">
        <div className={`confirm-dialog__icon confirm-dialog__icon--${variant}`}>
          <AlertTriangle size={24} />
        </div>
        <h3 className="confirm-dialog__title">{title}</h3>
        {message && <p className="confirm-dialog__message">{message}</p>}
        <div className="confirm-dialog__actions">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'dark' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
