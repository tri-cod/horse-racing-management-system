/**
 * RaceDeleteConfirm.jsx — Delete race confirmation dialog
 * Props:
 *   race      race object to delete
 *   onClose   () => void
 *   onSuccess () => void — called after successful deletion
 */
import { useRaceDelete } from '../../hooks/useRace';
import '../../assets/css/race.css';

export function RaceDeleteConfirm({ race, onClose, onSuccess }) {
  const { loading, error, remove } = useRaceDelete();

  const handleConfirm = async () => {
    const ok = await remove(race.id);
    if (ok) onSuccess?.();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="race-modal-backdrop" onClick={handleBackdropClick}>
      <div className="race-modal race-modal--confirm">

        {/* Header */}
        <div className="race-modal__header">
          <h2 className="race-modal__title">Confirm Delete</h2>
          <button className="race-modal__close" onClick={onClose} aria-label="Close">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="race-modal__body">
          {error && <div className="race-alert race-alert--error">{error}</div>}

          {/* Warning icon */}
          <div className="race-confirm__icon-wrap">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <p className="race-confirm__title">Delete this race?</p>
          <p className="race-confirm__text">
            You are about to delete{' '}
            <strong className="race-confirm__name">"{race?.name}"</strong>.
            {' '}This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="race-modal__footer">
          <button className="race-btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="race-btn-danger" onClick={handleConfirm} disabled={loading}>
            {loading && <span className="race-spinner" />}
            {loading ? 'Deleting...' : 'Delete Race'}
          </button>
        </div>

      </div>
    </div>
  );
}
