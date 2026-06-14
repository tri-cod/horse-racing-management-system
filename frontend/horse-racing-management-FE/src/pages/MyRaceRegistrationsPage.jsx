import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { useMyRaceRegistrations } from '../hooks/useMyRaceRegistrations';
import MyRegistrationsTable from '../components/race-horse/MyRegistrationsTable';
import PageHero from '../components/ui/PageHero';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import '../assets/css/MyRaceRegistrationsPage.css';

const STATUS_TABS = ['All', 'PENDING', 'APPROVED', 'REJECTED'];

export default function MyRaceRegistrationsPage() {
  const { registrations, loading, error, refetch } = useMyRaceRegistrations();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = useMemo(() => {
    if (activeTab === 'All') return registrations;
    return registrations.filter((r) => r.status === activeTab);
  }, [registrations, activeTab]);

  return (
    <div className="my-reg-page">
      <PageHero
        eyebrow="MY ACTIVITY"
        title="Race Registrations"
        subtitle="Track all your horses' race entries"
      />

      <div className="my-reg-page__content">
        <div className="my-reg-page__tabs">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={`my-reg-page__tab${activeTab === t ? ' my-reg-page__tab--active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="my-reg-page__error">
            <span>{error}</span>
            <button type="button" onClick={refetch}>Try again</button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Flag}
            title={activeTab === 'All' ? "No registrations yet" : `No ${activeTab.toLowerCase()} registrations`}
            subtitle={activeTab === 'All' ? "Register your horses for upcoming races to get started." : undefined}
            action={
              activeTab === 'All' && (
                <Link to="/races">
                  <Button variant="primary">Browse Races</Button>
                </Link>
              )
            }
          />
        ) : (
          <MyRegistrationsTable registrations={filtered} />
        )}
      </div>
    </div>
  );
}