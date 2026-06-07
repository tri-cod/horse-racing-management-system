// Module: Race Horse — Registration detail modal
import '../../assets/css/raceHorse.css';

const STATUS_LABELS = {
  PENDING:  'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function InfoRow({ label, value }) {
  return (
    <div className="rh-detail__item">
      <span className="rh-detail__label">{label}</span>
      <span className="rh-detail__value">{value || '—'}</span>
    </div>
  );
}

export function DetailModal({ item, onClose, onApprove, onReject, isAdmin }) {
  if (!item) return null;

  const canAct = isAdmin && item.status === 'PENDING';

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="rh-modal-overlay" onClick={handleBackdropClick}>
      <div className="rh-modal rh-modal--lg">

        {/* Header */}
        <div className="rh-modal__header">
          <h2 className="rh-modal__title">Registration Details</h2>
          <button className="rh-modal__close" onClick={onClose} aria-label="Close">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="rh-modal__body">

          {/* Title row */}
          <p className="rh-detail__name">{item.horseName}</p>
          <div className="rh-detail__header-row">
            <span className={`rh-status rh-status--${item.status}`}>
              {STATUS_LABELS[item.status] || item.status}
            </span>
            <span className="rh-detail__reg-id">Registration #{item.id}</span>
          </div>

          {/* Race Information section */}
          <p className="rh-detail__section-title">Race Information</p>
          <div className="rh-detail__grid">
            <InfoRow label="Race"           value={item.raceName} />
            <InfoRow label="Registered At"  value={formatDate(item.registerAt)} />
            <InfoRow label="Race ID"        value={item.raceId} />
            <InfoRow label="Lane Number"    value={item.laneNumber} />
            <InfoRow label="Start Position" value={item.startPosition} />
          </div>

          {/* Horse & Jockey section */}
          <p className="rh-detail__section-title">Horse &amp; Jockey</p>
          <div className="rh-detail__grid">
            <InfoRow label="Horse Name" value={item.horseName} />
            <InfoRow label="Jockey"     value={item.jockeyName} />
            <InfoRow label="Horse ID"   value={item.horseId} />
            <InfoRow label="Jockey ID"  value={item.jockeyId} />
          </div>

        </div>

        {/* Footer */}
        <div className="rh-modal__footer">
          <button className="rh-btn-cancel" onClick={onClose}>Close</button>
          {canAct && (
            <>
              <button className="rh-btn-reject" onClick={() => onReject(item)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Reject
              </button>
              <button className="rh-btn-approve" onClick={() => onApprove(item)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Approve
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
