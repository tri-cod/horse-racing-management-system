import { useNavigate } from 'react-router-dom';
import { PlusCircle, Rabbit } from 'lucide-react';
import { useMyHorses } from '../hooks/useMyHorses';
import HorseCard from '../components/horse-owner/HorseCard';
import '../assets/css/MyHorsesPage.css';

export default function MyHorsesPage() {
  const navigate = useNavigate();
  const { horses, loading, error, refetch } = useMyHorses();

  return (
    <div className="my-horses-page">
      <div className="my-horses-page__container">
        <div className="my-horses__header">
          <div>
            <p className="my-horses__subtitle">Manage Your Racehorses</p>
            <h1 className="my-horses__title">My Horses</h1>
          </div>
          <button
            type="button"
            className="my-horses__add-btn"
            onClick={() => navigate('/horse-owner/horses/new')}
          >
            <PlusCircle size={18} />
            <span>Register New Horse</span>
          </button>
        </div>

        {error && (
          <div className="my-horses__error-banner">
            <span>{error}</span>
            <button type="button" className="my-horses__retry-btn" onClick={refetch}>
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="my-horses__grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="horse-card horse-card--skeleton">
                <div className="my-horses__skeleton my-horses__skeleton-avatar" />
                <div className="my-horses__skeleton my-horses__skeleton-line" style={{ width: '70%' }} />
                <div className="my-horses__skeleton my-horses__skeleton-line" style={{ width: '50%' }} />
                <div className="my-horses__skeleton my-horses__skeleton-line" style={{ width: '40%' }} />
              </div>
            ))}
          </div>
        ) : horses.length === 0 ? (
          <div className="my-horses__empty">
            <Rabbit size={48} />
            <p className="my-horses__empty-title">You haven't registered any horses yet</p>
            <button
              type="button"
              className="my-horses__add-btn"
              onClick={() => navigate('/horse-owner/horses/new')}
            >
              <PlusCircle size={18} />
              <span>Register New Horse</span>
            </button>
          </div>
        ) : (
          <div className="my-horses__grid">
            {horses.map((horse) => (
              <HorseCard
                key={horse.id}
                horse={horse}
                onClick={() => navigate(`/horse-owner/horses/${horse.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
