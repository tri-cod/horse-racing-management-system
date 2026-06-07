/**
 * RacePage.jsx — Race listing & management page
 * Route: /races  (public — ADMIN sees create / edit / delete controls)
 */
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRaceList } from '../hooks/useRace';
import { RaceFormModal } from '../components/race/RaceFormModal';
import { RaceDetailModal } from '../components/race/RaceDetailModal';
import { RaceDeleteConfirm } from '../components/race/RaceDeleteConfirm';
import '../assets/css/race.css';

/* ── Constants ────────────────────────────────────────────────────────────── */
const STATUS_FILTERS = [
  { value: '',          label: 'All' },
  { value: 'UPCOMING',  label: 'Upcoming' },
  { value: 'ONGOING',   label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const STATUS_LABELS = {
  UPCOMING:  'Upcoming',
  ONGOING:   'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
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

function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'VND', maximumFractionDigits: 0,
  }).format(amount);
}

/* ── Sub-components ───────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  return (
    <span className={`race-status-badge race-status-badge--${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="race-card-skeleton">
      <div className="race-card-skeleton__header" />
      <div className="race-card-skeleton__body">
        <div className="race-skeleton race-card-skeleton__line" />
        <div className="race-skeleton race-card-skeleton__line" />
        <div className="race-skeleton race-card-skeleton__line" />
        <div className="race-skeleton race-card-skeleton__line" />
      </div>
    </div>
  );
}

function IconLocation() {
  return (
    <svg className="race-card__info-icon" width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg className="race-card__info-icon" width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconActivity() {
  return (
    <svg className="race-card__info-icon" width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function RacePage() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN' || user?.roles?.includes('ADMIN');

  const {
    races, loading, error, status, page, totalPages,
    setPage, handleStatusChange, refetch,
  } = useRaceList();

  /* Modal state */
  const [selectedRace, setSelectedRace] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'detail' | 'create' | 'edit' | 'delete'

  const openDetail = (race) => { setSelectedRace(race); setActiveModal('detail'); };
  const openCreate = ()     => { setSelectedRace(null); setActiveModal('create'); };
  const openEdit   = (race) => { setSelectedRace(race); setActiveModal('edit');   };
  const openDelete = (race) => { setSelectedRace(race); setActiveModal('delete'); };
  const closeModal = ()     => { setActiveModal(null);  setSelectedRace(null);    };

  const handleMutationSuccess = () => {
    closeModal();
    refetch();
  };

  const switchToEdit = () => setActiveModal('edit');

  return (
    <div className="race-page">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="race-hero">
        <p className="race-hero__eyebrow">Royal Derby</p>
        <h1 className="race-hero__title">Horse Racing Events</h1>
        <p className="race-hero__subtitle">
          Explore schedules and details for world-class horse racing events.
        </p>
      </section>

      {/* ── Main section ─────────────────────────────────────────────────── */}
      <section className="race-section">

        {/* Top bar: filters + create */}
        <div className="race-topbar">
          <div className="race-filters">
            {STATUS_FILTERS.map((opt) => (
              <button
                key={opt.value}
                className={`race-filter-pill${status === opt.value ? ' race-filter-pill--active' : ''}`}
                onClick={() => handleStatusChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {isAdmin && (
            <button className="race-btn-create" onClick={openCreate}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Race
            </button>
          )}
        </div>

        {/* Card grid */}
        <div className="race-grid">

          {loading && Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}

          {!loading && error && (
            <div className="race-error-state">{error}</div>
          )}

          {!loading && !error && races.length === 0 && (
            <div className="race-empty">
              <div className="race-empty__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 3l18 18M10.5 10.677a2 2 0 102.823 2.823" />
                  <path d="M7.362 7.561C5.68 8.74 4.279 10.42 3 12c2 2.667 6 6 9 6 1.444 0 2.83-.524 4.073-1.35M20.21 16.67C21.38 15.21 22.5 13.5 22.5 12c-2-2.667-6-6-9-6-.654 0-1.296.1-1.918.279" />
                </svg>
              </div>
              <p className="race-empty__title">No races found</p>
              <p className="race-empty__desc">
                {status
                  ? `No races found with status "${STATUS_LABELS[status]}".`
                  : 'No races have been created yet.'}
              </p>
            </div>
          )}

          {!loading && !error && races.map((race) => (
            <div key={race.id} className="race-card">
              <div className="race-card__header">
                <div className="race-card__badge-wrap">
                  <StatusBadge status={race.status} />
                </div>
                <h3 className="race-card__name">{race.name}</h3>
                <span className="race-card__id">#{race.id}</span>
              </div>

              <div className="race-card__body">
                <div className="race-card__info">
                  <div className="race-card__info-row">
                    <IconLocation />
                    <span>{race.location || '—'}</span>
                  </div>
                  <div className="race-card__info-row">
                    <IconCalendar />
                    <span>{formatDate(race.raceDate)}</span>
                  </div>
                  <div className="race-card__info-row">
                    <IconActivity />
                    <span>
                      {race.distance ? `${race.distance} m` : '—'}
                      {' · '}
                      Max {race.maxHorses ?? '—'} horses
                    </span>
                  </div>
                </div>

                <div className="race-card__prize">
                  <span className="race-card__prize-label">Prize Pool</span>
                  <span className="race-card__prize-value">{formatCurrency(race.prizePool)}</span>
                </div>

                <div className="race-card__actions">
                  <button
                    className="race-card__btn race-card__btn--view"
                    onClick={() => openDetail(race)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Details
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        className="race-card__btn race-card__btn--edit"
                        onClick={() => openEdit(race)}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        className="race-card__btn race-card__btn--delete"
                        onClick={() => openDelete(race)}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="race-pagination">
            <button
              className="race-pagination__btn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`race-pagination__btn${page === i ? ' race-pagination__btn--active' : ''}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="race-pagination__btn"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}

      </section>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {activeModal === 'detail' && selectedRace && (
        <RaceDetailModal
          race={selectedRace}
          isAdmin={isAdmin}
          onClose={closeModal}
          onEdit={switchToEdit}
        />
      )}

      {(activeModal === 'create' || activeModal === 'edit') && (
        <RaceFormModal
          mode={activeModal === 'edit' ? 'edit' : 'create'}
          initialData={activeModal === 'edit' ? selectedRace : null}
          onClose={closeModal}
          onSuccess={handleMutationSuccess}
        />
      )}

      {activeModal === 'delete' && selectedRace && (
        <RaceDeleteConfirm
          race={selectedRace}
          onClose={closeModal}
          onSuccess={handleMutationSuccess}
        />
      )}

    </div>
  );
}
