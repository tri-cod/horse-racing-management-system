// Module: Race Horse — Main page
// Route: /race-horse  (ProtectedRoute)
// Role logic:
//   ADMIN      → tabs: All Registrations | Pending Review | Processed
//   HORSE_OWNER → tabs: My Races + Register button
//   Other roles → tab: Race Horses (public list by race)
import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  useRaceHorseList,
  useMyRaceHorses,
  useRaceHorseAction,
} from '../hooks/useRaceHorse';
import { getAllRaces } from '../api/raceHorseApi';
import { RegisterModal }      from '../components/raceHorse/RegisterModal';
import { DetailModal }        from '../components/raceHorse/DetailModal';
import { ActionConfirmModal } from '../components/raceHorse/ActionConfirmModal';
import '../assets/css/raceHorse.css';

/* ── Constants ────────────────────────────────────────────────────────────── */
const STATUS_LABELS = {
  PENDING:  'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */
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

function extractList(res) {
  if (!res) return [];
  const raw = res?.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (raw?.content) return raw.content;
  return [];
}

/* ── Sub-components ───────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rh-card-skeleton">
      <div className="rh-card-skeleton__header" />
      <div className="rh-card-skeleton__body">
        <div className="rh-skeleton rh-card-skeleton__line" />
        <div className="rh-skeleton rh-card-skeleton__line" />
        <div className="rh-skeleton rh-card-skeleton__line" />
        <div className="rh-skeleton rh-card-skeleton__line" />
      </div>
    </div>
  );
}

function SelectRacePrompt() {
  return (
    <div className="rh-select-prompt">
      <div className="rh-select-prompt__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      Select a race above to view its registered horses.
    </div>
  );
}

/* ── Registration Card ────────────────────────────────────────────────────── */
function RaceHorseCard({ item, onView, onApprove, onReject, isAdmin }) {
  const canAct = isAdmin && item.status === 'PENDING';

  return (
    <div className="rh-card">
      <div className="rh-card__header">
        <span className="rh-card__name">{item.horseName}</span>
        <span className={`rh-status rh-status--${item.status}`}>
          {STATUS_LABELS[item.status] || item.status}
        </span>
      </div>

      <div className="rh-card__body">
        <div className="rh-card__row">
          <svg className="rh-card__icon" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l18 18M10.5 10.677a2 2 0 102.823 2.823" />
            <path d="M7.362 7.561C5.68 8.74 4.28 10.42 3 12c2 2.667 6 6 9 6 1.444 0 2.83-.524 4.073-1.35M20.21 16.67C21.38 15.21 22.5 13.5 22.5 12c-2-2.667-6-6-9-6-.654 0-1.296.1-1.918.279" />
          </svg>
          <span>Race: <strong>{item.raceName || `#${item.raceId}`}</strong></span>
        </div>
        <div className="rh-card__row">
          <svg className="rh-card__icon" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          <span>Jockey: {item.jockeyName || '—'}</span>
        </div>
        <div className="rh-card__row">
          <svg className="rh-card__icon" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Registered: {formatDate(item.registerAt)}</span>
        </div>

        <div className="rh-card__meta">
          <div className="rh-card__meta-item">
            <span className="rh-card__meta-label">Lane</span>
            <span className="rh-card__meta-value">{item.laneNumber ?? '—'}</span>
          </div>
          <div className="rh-card__meta-item">
            <span className="rh-card__meta-label">Start Pos.</span>
            <span className="rh-card__meta-value">{item.startPosition ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="rh-card__footer">
        <button className="rh-card__btn rh-card__btn--view" onClick={() => onView(item)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Details
        </button>
        {canAct && (
          <>
            <button className="rh-card__btn rh-card__btn--approve" onClick={() => onApprove(item)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Approve
            </button>
            <button className="rh-card__btn rh-card__btn--reject" onClick={() => onReject(item)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Race selector dropdown ───────────────────────────────────────────────── */
function RaceSelector({ races, selectedRaceId, onChange, loading }) {
  return (
    <div className="rh-race-selector-wrap">
      <span className="rh-race-selector-label">Select Race:</span>
      <select
        className="rh-select"
        value={selectedRaceId}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        <option value="">— All Races —</option>
        {races.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function RaceHorsePage() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';
  const isOwner = user?.role === 'HORSE_OWNER';

  /* Default tab by role */
  const defaultTab = isAdmin ? 'pending' : isOwner ? 'my-races' : 'list';
  const [activeTab, setActiveTab] = useState(defaultTab);

  /* Race selector (shared across list/admin tabs) */
  const [races,          setRaces]          = useState([]);
  const [racesLoading,   setRacesLoading]   = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState('');

  /* Hooks */
  const { registrations, loading, error, fetchList } = useRaceHorseList();
  const { myRegistrations, loading: myLoading, error: myError, fetchMyRaces } = useMyRaceHorses();
  const { loading: actionLoading, error: actionError, handleApprove, handleReject } = useRaceHorseAction();

  /* Modal state: null | { type, item } */
  const [modal, setModal] = useState(null);
  // confirmModal: null | { action: 'approve'|'reject', item }
  const [confirmModal, setConfirmModal] = useState(null);

  /* Load all races for the selector (all statuses for admin; shown for list tab too) */
  useEffect(() => {
    const loadRaces = async () => {
      setRacesLoading(true);
      try {
        const res = await getAllRaces();
        setRaces(extractList(res));
      } catch {
        /* silently fail — selector just stays empty */
      } finally {
        setRacesLoading(false);
      }
    };
    loadRaces();
  }, []);

  /* Fetch registrations when race is selected */
  useEffect(() => {
    if (selectedRaceId) fetchList(selectedRaceId);
  }, [selectedRaceId, fetchList]);

  /* Filter list based on active admin sub-tab */
  const displayedRegistrations = useMemo(() => {
    if (activeTab === 'pending')   return registrations.filter((r) => r.status === 'PENDING');
    if (activeTab === 'processed') return registrations.filter((r) => r.status !== 'PENDING');
    return registrations;
  }, [registrations, activeTab]);

  /* Tab change: reset race selection when switching to list/admin tabs */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'my-races') {
      fetchMyRaces();
    }
  };

  /* ── Modal handlers ────────────────────────────────────────────────────── */
  const openDetail  = (item) => setModal({ type: 'detail', item });
  const openApprove = (item) => setConfirmModal({ action: 'approve', item });
  const openReject  = (item) => setConfirmModal({ action: 'reject',  item });
  const closeModal  = ()     => setModal(null);

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    const { action, item } = confirmModal;
    const ok = action === 'approve'
      ? await handleApprove(item.id)
      : await handleReject(item.id);
    if (ok) {
      setConfirmModal(null);
      closeModal();
      if (selectedRaceId) fetchList(selectedRaceId);
      if (activeTab === 'my-races') fetchMyRaces();
    }
  };

  /* ── Tab configuration ─────────────────────────────────────────────────── */
  const tabs = useMemo(() => {
    if (isAdmin) return [
      { id: 'list',      label: 'All Registrations' },
      { id: 'pending',   label: 'Pending Review' },
      { id: 'processed', label: 'Processed' },
    ];
    if (isOwner) return [
      { id: 'my-races', label: 'My Races' },
    ];
    return [
      { id: 'list', label: 'Race Horses' },
    ];
  }, [isAdmin, isOwner]);

  /* ── Render helpers ────────────────────────────────────────────────────── */
  const renderListContent = (items, listLoading, listError, showAdminActions) => {
    if (!selectedRaceId) return <SelectRacePrompt />;
    if (listLoading) return Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />);
    if (listError)  return <div className="rh-error">{listError}</div>;
    if (items.length === 0) return (
      <div className="rh-empty">
        <div className="rh-empty__icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 3l18 18M10.5 10.677a2 2 0 102.823 2.823" />
            <path d="M7.362 7.561C5.68 8.74 4.28 10.42 3 12c2 2.667 6 6 9 6 1.444 0 2.83-.524 4.073-1.35M20.21 16.67C21.38 15.21 22.5 13.5 22.5 12c-2-2.667-6-6-9-6-.654 0-1.296.1-1.918.279" />
          </svg>
        </div>
        <p className="rh-empty__title">No registrations found</p>
        <p className="rh-empty__desc">
          {activeTab === 'pending'
            ? 'No pending registrations for this race.'
            : activeTab === 'processed'
            ? 'No processed registrations for this race.'
            : 'No horses have been registered for this race.'}
        </p>
      </div>
    );
    return items.map((item) => (
      <RaceHorseCard
        key={item.id}
        item={item}
        onView={openDetail}
        onApprove={openApprove}
        onReject={openReject}
        isAdmin={showAdminActions}
      />
    ));
  };

  const renderMyRaces = () => {
    if (myLoading) return Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />);
    if (myError)   return <div className="rh-error">{myError}</div>;
    if (myRegistrations.length === 0) return (
      <div className="rh-empty">
        <div className="rh-empty__icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
          </svg>
        </div>
        <p className="rh-empty__title">No registrations yet</p>
        <p className="rh-empty__desc">
          You have not registered any horses for a race. Use the Register button above to get started.
        </p>
      </div>
    );
    return myRegistrations.map((item) => (
      <RaceHorseCard
        key={item.id}
        item={item}
        onView={openDetail}
        onApprove={openApprove}
        onReject={openReject}
        isAdmin={false}
      />
    ));
  };

  /* ── JSX ───────────────────────────────────────────────────────────────── */
  return (
    <div className="rh-page">

      {/* Hero */}
      <section className="rh-hero">
        <p className="rh-hero__eyebrow">Royal Derby</p>
        <h1 className="rh-hero__title">Race Horse Registrations</h1>
        <p className="rh-hero__subtitle">
          Manage horse registrations, track race entries, and review pending applications.
        </p>
      </section>

      {/* Tab bar */}
      <div className="rh-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`rh-tab-btn${activeTab === tab.id ? ' rh-tab-btn--active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}

        {/* Register button for HORSE_OWNER */}
        {isOwner && (
          <button
            className="rh-tab-register"
            onClick={() => setModal({ type: 'register' })}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Register Horse
          </button>
        )}
      </div>

      {/* Content */}
      <div className="rh-content">

        {/* Header row: title + race selector (for list/admin tabs) */}
        {(activeTab === 'list' || activeTab === 'pending' || activeTab === 'processed') && (
          <div className="rh-content__header">
            <h2 className="rh-content__title">
              {activeTab === 'pending'   ? 'Pending Review' :
               activeTab === 'processed' ? 'Processed'      : 'Race Horses'}
            </h2>
            <RaceSelector
              races={races}
              selectedRaceId={selectedRaceId}
              onChange={setSelectedRaceId}
              loading={racesLoading}
            />
          </div>
        )}

        {activeTab === 'my-races' && (
          <div className="rh-content__header">
            <h2 className="rh-content__title">My Registrations</h2>
          </div>
        )}

        {/* Admin error from actions */}
        {actionError && (
          <div className="rh-error">{actionError}</div>
        )}

        {/* Card grid */}
        <div className="rh-grid">
          {(activeTab === 'list' || activeTab === 'pending' || activeTab === 'processed') &&
            renderListContent(displayedRegistrations, loading, error, isAdmin)
          }
          {activeTab === 'my-races' && renderMyRaces()}
        </div>

      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {modal?.type === 'register' && (
        <RegisterModal
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            if (activeTab === 'my-races') fetchMyRaces();
          }}
        />
      )}

      {modal?.type === 'detail' && modal.item && (
        <DetailModal
          item={modal.item}
          isAdmin={isAdmin}
          onClose={closeModal}
          onApprove={openApprove}
          onReject={openReject}
        />
      )}

      {confirmModal && (
        <ActionConfirmModal
          action={confirmModal.action}
          itemName={confirmModal.item?.horseName}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmModal(null)}
          loading={actionLoading}
        />
      )}

    </div>
  );
}
