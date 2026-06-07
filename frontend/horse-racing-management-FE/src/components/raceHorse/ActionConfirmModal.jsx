// Module: Race Horse — Approve / Reject confirmation dialog
import '../../assets/css/raceHorse.css';

export function ActionConfirmModal({ action, itemName, onConfirm, onCancel, loading }) {
  const isApprove = action === 'approve';

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className="rh-modal-overlay" onClick={handleBackdropClick}>
      <div className="rh-modal rh-modal--sm">

        {/* Header */}
        <div className="rh-modal__header">
          <h2 className="rh-modal__title">
            {isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
          </h2>
          <button className="rh-modal__close" onClick={onCancel} aria-label="Close">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="rh-modal__body">

          {/* Icon */}
          <div className={`rh-confirm__icon-wrap rh-confirm__icon-wrap--${isApprove ? 'approve' : 'reject'}`}>
            {isApprove ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>

          <p className="rh-confirm__title">
            {isApprove ? 'Approve this registration?' : 'Reject this registration?'}
          </p>
          <p className="rh-confirm__text">
            You are about to{' '}
            <strong>{isApprove ? 'approve' : 'reject'}</strong> the registration of horse{' '}
            <strong className="rh-confirm__name">"{itemName}"</strong>.
            {!isApprove && ' This action cannot be undone.'}
          </p>

        </div>

        {/* Footer */}
        <div className="rh-modal__footer">
          <button className="rh-btn-cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          {isApprove ? (
            <button className="rh-btn-confirm-approve" onClick={onConfirm} disabled={loading}>
              {loading && <span className="rh-spinner" />}
              {loading ? 'Approving...' : 'Confirm Approval'}
            </button>
          ) : (
            <button className="rh-btn-confirm-reject" onClick={onConfirm} disabled={loading}>
              {loading && <span className="rh-spinner" />}
              {loading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
