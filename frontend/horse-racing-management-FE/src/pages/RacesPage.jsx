import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Flag } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useRaces } from '../hooks/useRaces';
import { useNow } from '../hooks/useNow';
import { computeRaceStatus } from '../utils/raceStatus';
import RaceCard from '../components/race/RaceCard';
import RaceFilterTabs from '../components/race/RaceFilterTabs';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import '../assets/css/RacesPage.css';

export default function RacesPage() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(0);
  const now = useNow(60_000);

  const { races, totalPages, loading, error, refetch } = useRaces({ page, size: 9 });

  const filtered = activeTab
    ? races.filter((r) => computeRaceStatus(r, now) === activeTab)
    : races;

  const handleTabChange = (val) => {
    setActiveTab(val);
    setPage(0);
  };

  return (
    <div className="races-page">
      <section className="races-page__hero">
        <div className="races-page__hero-inner">
          <span className="eyebrow races-page__eyebrow">ROYAL DERBY</span>
          <h1 className="races-page__hero-title">Race Schedule</h1>
          <p className="races-page__hero-subtitle">
            Follow every race from qualification to the final lap
          </p>
          {user?.role === 'ADMIN' && (
            <Link to="/admin/races/create">
              <Button variant="primary" size="md">
                <Plus size={16} />
                Create Race
              </Button>
            </Link>
          )}
        </div>
      </section>

      <div className="races-page__content">
        <div className="races-page__toolbar">
          <RaceFilterTabs active={activeTab} onChange={handleTabChange} />
        </div>

        {error && (
          <div className="races-page__error">
            <span>{error}</span>
            <button type="button" onClick={refetch}>Try again</button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="No races found"
            subtitle="Check back soon for upcoming events."
          />
        ) : (
          <div className="races-page__grid">
            {filtered.map((r) => <RaceCard key={r.id} race={r} />)}
          </div>
        )}

        {!activeTab && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}