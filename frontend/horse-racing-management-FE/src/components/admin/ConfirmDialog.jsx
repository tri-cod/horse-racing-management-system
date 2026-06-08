import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Dialog xác nhận hành động (dùng cho cả khoá và mở khoá).
 *
 * Props:
 *  - open:        có hiện hay không
 *  - title:       tiêu đề
 *  - message:     mô tả ngắn, có thể là ReactNode
 *  - confirmText: nhãn nút xác nhận
 *  - tone:        'danger' | 'primary'  (đổi màu nút xác nhận)
 *  - submitting:  đang chờ API
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText  = 'Cancel',
  tone        = 'primary',
  submitting,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = prev;
    };
  }, [open, submitting, onClose]);

  if (!open) return null;

  return (
    <div
      className="au-modal__backdrop"
      onClick={() => { if (!submitting) onClose(); }}
    >
      <div
        className="au-modal au-modal--sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="au-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="au-modal__header">
          <h2 id="au-confirm-title" className="au-modal__title au-modal__title--with-icon">
            <span className={`au-modal__icon au-modal__icon--${tone}`}>
              <AlertTriangle size={18} />
            </span>
            {title}
          </h2>
          <button
            type="button"
            className="au-modal__close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </header>

        <div className="au-modal__body">
          <p className="au-modal__message">{message}</p>
        </div>

        <footer className="au-modal__footer">
          <button
            type="button"
            className="au-btn au-btn--ghost"
            onClick={onClose}
            disabled={submitting}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`au-btn au-btn--${tone}`}
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? 'Processing…' : confirmText}
          </button>
        </footer>
      </div>
    </div>
  );
}
