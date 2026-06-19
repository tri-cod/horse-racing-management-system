import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Pencil, Lock, Trash2 } from 'lucide-react';
import RaceStatusBadge from './RaceStatusBadge';
import { updateRace, deleteRace } from '../../api/raceApi';
import { useToast } from '../ui/ToastProvider';
import '../../assets/css/race/RaceCard.css';
import { computeRaceStatus } from '../../utils/raceStatus.js';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPrize(amount) {
  if (!amount) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

const CLOSEABLE = ['UPCOMING', 'OPEN_REGISTRATION'];

export default function RaceCard({ race, isAdmin, onRefetch }) {
  const status = computeRaceStatus(race);
  const addToast = useToast();
  const [closing, setClosing]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCloseRegistration = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Close registration for race "${race.raceName}"?`)) return;
    setClosing(true);
    try {
      await updateRace(race.id, {
        raceName: race.raceName,
        startTime: race.startTime,
        trackName: race.trackName,
        trackCondition: race.trackCondition,
        surfaceType: race.surfaceType,
        totalprizepool: race.totalprizepool,
        distance: race.distance,
        location: race.location,
        capacity: race.capacity,
        bannerImageurl: race.bannerImageurl,
        registrationDeadline: race.registrationDeadline,
        refereeId: race.refereeId ?? null,
        status: 'CLOSED_REGISTRATION',
      });
      addToast(`Registration closed for "${race.raceName}"!`, 'success');
      onRefetch?.();
    } catch (err) {
      addToast(err?.response?.data?.message ?? 'Failed to close registration.', 'error');
    } finally {
      setClosing(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete race "${race.raceName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteRace(race.id);
      addToast(`Race "${race.raceName}" deleted.`, 'success');
      onRefetch?.();
    } catch (err) {
      addToast(err?.response?.data?.message ?? 'Failed to delete race.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const canClose = isAdmin && CLOSEABLE.includes(race.status);

  return (
    <div className={`race-card-wrap${isAdmin ? ' race-card-wrap--admin' : ''}`}>
      <Link to={`/races/${race.id}`} className="race-card">
        <div className="race-card__banner">
          {status === 'COMPLETED' && (
            <div className="race-card__result-overlay">
              <span>View Result</span>
            </div>
          )}
          {race.bannerImageurl ? (
            <img src={race.bannerImageurl} alt={race.raceName} className="race-card__banner-img" />
          ) : (
            <div className="race-card__banner-placeholder" />
          )}
          <div className="race-card__status">
            <RaceStatusBadge race={race} />
          </div>
        </div>
        <div className="race-card__body">
          <h3 className="race-card__title">{race.raceName}</h3>
          <div className="race-card__meta">
            <span className="race-card__meta-item">
              <Calendar size={14} />
              {formatDate(race.startTime)}
            </span>
            <span className="race-card__meta-item">
              <MapPin size={14} />
              {race.location}
            </span>
          </div>
          {race.totalprizepool && (
            <div className="race-card__prize">{formatPrize(race.totalprizepool)}</div>
          )}
        </div>
      </Link>

      {isAdmin && (
        <div className="race-card__admin-overlay">
          <div className="race-card__admin-actions">
            {canClose && (
              <button
                type="button"
                className="race-card__admin-btn race-card__admin-btn--close"
                onClick={handleCloseRegistration}
                disabled={closing}
              >
                <Lock size={14} />
                {closing ? '...' : 'Close Reg'}
              </button>
            )}
            <Link
              to={`/admin/races/${race.id}/edit`}
              className="race-card__admin-btn race-card__admin-btn--edit"
              onClick={(e) => e.stopPropagation()}
            >
              <Pencil size={14} /> Edit
            </Link>
            <button
              type="button"
              className="race-card__admin-btn race-card__admin-btn--delete"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 size={14} />
              {deleting ? '...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
