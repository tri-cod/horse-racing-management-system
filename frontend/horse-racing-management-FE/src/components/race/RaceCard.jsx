import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Pencil, Lock } from 'lucide-react';
import RaceStatusBadge from './RaceStatusBadge';
import { updateRace } from '../../api/raceApi';
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
  const [closing, setClosing] = useState(false);

  const handleCloseRegistration = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Đóng đăng ký race "${race.raceName}"?`)) return;
    setClosing(true);
    try {
      await updateRace(race.id, {
        raceName: race.raceName,
        startTime: race.startTime,
        endTime: race.endTime,
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
      addToast(`Đã đóng đăng ký "${race.raceName}"!`, 'success');
      onRefetch?.();
    } catch (err) {
      addToast(err?.response?.data?.message ?? 'Không thể đóng đăng ký.', 'error');
    } finally {
      setClosing(false);
    }
  };

  const canClose = isAdmin && CLOSEABLE.includes(race.status);

  return (
    <div style={{ position: 'relative' }}>
      <Link
        to={status === 'COMPLETED' ? `/races/${race.id}/result` : `/races/${race.id}`}
        className="race-card"
      >
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
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '6px',
            zIndex: 2,
          }}
        >
          {canClose && (
            <button
              onClick={handleCloseRegistration}
              disabled={closing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: closing ? 'rgba(180,120,0,0.7)' : 'rgba(217,119,6,0.85)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '500',
                border: 'none',
                cursor: closing ? 'not-allowed' : 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Lock size={12} /> {closing ? '...' : 'Đóng ĐK'}
            </button>
          )}
          <Link
            to={`/admin/races/${race.id}/edit`}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(0,0,0,0.55)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '500',
              textDecoration: 'none',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Pencil size={12} /> Edit
          </Link>
        </div>
      )}
    </div>
  );
}