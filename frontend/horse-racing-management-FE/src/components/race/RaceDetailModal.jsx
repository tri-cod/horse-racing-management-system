/**
 * RaceDetailModal.jsx — Race detail view modal
 * Props:
 *   race      race object from the list (used as immediate fallback)
 *   isAdmin   boolean — shows Edit button when true
 *   onClose   () => void
 *   onEdit    () => void — switches to edit form
 */
import { useRaceDetail } from '../../hooks/useRace';
import '../../assets/css/race.css';

const STATUS_LABELS = {
  UPCOMING:  'Upcoming',
  ONGOING:   'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-GB', {
      weekday: 'long',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'VND', maximumFractionDigits: 0,
  }).format(amount);
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export function RaceDetailModal({ race: racePreview, isAdmin, onClose, onEdit }) {
  /* Fetch fresh data by ID; fall back to preview while loading */
  const { race: fresh, loading, error } = useRaceDetail(racePreview?.id);
  const race = fresh ?? racePreview;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="race-modal-backdrop" onClick={handleBackdropClick}>
      <div className="race-modal race-modal--detail">

        {/* Header */}
        <div className="race-modal__header">
          <h2 className="race-modal__title">Race Details</h2>
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

          {/* Skeleton — only when no fallback data is available yet */}
          {loading && !racePreview && (
            <div className="race-detail-loading">
              <div className="race-skeleton race-detail-skeleton__line" />
              <div className="race-skeleton race-detail-skeleton__line" />
              <div className="race-skeleton race-detail-skeleton__line" />
              <div className="race-skeleton race-detail-skeleton__line" />
            </div>
          )}

          {race && (
            <>
              <p className="race-detail__name">{race.name}</p>
              <div className="race-detail__header-row">
                <span className={`race-status-badge race-status-badge--${race.status}`}>
                  {STATUS_LABELS[race.status] || race.status}
                </span>
                <span className="race-detail__id">ID: #{race.id}</span>
              </div>

              <div className="race-detail__grid">

                <div className="race-detail__divider" />

                <div className="race-detail__item">
                  <span className="race-detail__label">Location</span>
                  <span className="race-detail__value">{race.location || '—'}</span>
                </div>

                <div className="race-detail__item">
                  <span className="race-detail__label">Race Date</span>
                  <span className="race-detail__value">{formatDate(race.raceDate)}</span>
                </div>

                <div className="race-detail__item">
                  <span className="race-detail__label">Distance</span>
                  <span className="race-detail__value">
                    {race.distance ? `${race.distance} meters` : '—'}
                  </span>
                </div>

                <div className="race-detail__item">
                  <span className="race-detail__label">Max Horses</span>
                  <span className="race-detail__value">
                    {race.maxHorses != null ? `${race.maxHorses} horses` : '—'}
                  </span>
                </div>

                <div className="race-detail__item race-detail__item--full">
                  <span className="race-detail__label">Total Prize Pool</span>
                  <span className="race-detail__value race-detail__value--prize">
                    {formatCurrency(race.prizePool)}
                  </span>
                </div>

                {race.description && (
                  <>
                    <div className="race-detail__divider" />
                    <div className="race-detail__item race-detail__item--full">
                      <span className="race-detail__label">Description</span>
                      <span className="race-detail__value">{race.description}</span>
                    </div>
                  </>
                )}

              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="race-modal__footer">
          <button className="race-btn-cancel" onClick={onClose}>Close</button>
          {isAdmin && (
            <button className="race-btn-submit" onClick={onEdit}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
