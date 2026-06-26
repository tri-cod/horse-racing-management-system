import { useNavigate } from 'react-router-dom';
import { PlusCircle, Rabbit } from 'lucide-react';
import { useMyHorses } from '../hooks/useMyHorses';
import HorseCard from '../components/horse-owner/HorseCard';
import DashboardPageHeader from '../components/rd/DashboardPageHeader';
import Seo from '../components/seo/Seo';
import '../assets/css/MyHorsesPage.css';
import '../assets/css/rd/workspace.css';

export default function MyHorsesPage() {
  const navigate = useNavigate();
  const { horses, loading, error, refetch } = useMyHorses();

  return (
    <div className="ws-page">
      <Seo title="My Horses" description="View and manage your registered racehorses." />
      <DashboardPageHeader
        eyebrow="Horse Owner"
        title="My Horses"
        subtitle={horses.length > 0 ? `${horses.length} registered horse${horses.length !== 1 ? 's' : ''}` : 'Manage your stable'}
        action={
          <button type="button" className="ui-btn ui-btn--dark ui-btn--sm" onClick={() => navigate('/horse-owner/horses/new')}>
            <PlusCircle size={15} /> Register New Horse
          </button>
        }
      />

      <div className="ws-body">
        {error && (
          <div className="ws-error">
            <span>{error}</span>
            <button type="button" onClick={refetch}>Try Again</button>
          </div>
        )}

        {loading ? (
          <div className="my-horses__grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="horse-card horse-card--skeleton">
                <div className="my-horses__skeleton my-horses__skeleton-avatar" />
                <div className="my-horses__skeleton my-horses__skeleton-line" style={{ width: '70%' }} />
                <div className="my-horses__skeleton my-horses__skeleton-line" style={{ width: '50%' }} />
              </div>
            ))}
          </div>
        ) : horses.length === 0 ? (
          <div className="ws-panel">
            <div className="ws-empty">
              <Rabbit size={40} className="ws-empty__icon" />
              <p className="ws-empty__title">No horses registered yet</p>
              <p>Register your first horse to start competing.</p>
              <button type="button" className="ui-btn ui-btn--primary ui-btn--md" onClick={() => navigate('/horse-owner/horses/new')}>
                <PlusCircle size={15} /> Register Horse
              </button>
            </div>
          </div>
        ) : (
          <div className="my-horses__grid">
            {horses.map((horse) => (
              <HorseCard key={horse.id} horse={horse} onClick={() => navigate(`/horse-owner/horses/${horse.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
