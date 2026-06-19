import { AlertTriangle, X } from 'lucide-react';

export default function HorseDeleteModal({ horseName, onClose, onConfirm, loading, error }) {
  return (
    <div className="horse-modal__overlay" onClick={onClose}>
      <div className="horse-modal horse-modal--confirm" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="horse-modal__header">
          <h2 className="horse-modal__title">Delete Horse</h2>
          <button type="button" className="horse-modal__close-btn" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="horse-modal__confirm-body">
          <div className="horse-modal__confirm-icon">
            <AlertTriangle size={40} />
          </div>
          <p className="horse-modal__confirm-text">
            Are you sure you want to delete <strong>{horseName}</strong>?
            <br />
            This action <strong>cannot be undone</strong>.
          </p>
          {error && <div className="horse-modal__error-banner">{error}</div>}
        </div>

        {/* Footer */}
        <div className="horse-modal__footer">
          <button
            type="button"
            className="horse-modal__btn horse-modal__btn--cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="horse-modal__btn horse-modal__btn--delete"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
