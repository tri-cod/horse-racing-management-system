import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { useMyRaceRegistrations } from '../hooks/useMyRaceRegistrations';
import MyRegistrationsTable from '../components/race-horse/MyRegistrationsTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import '../assets/css/MyRaceRegistrationsPage.css';

export default function MyRaceRegistrationsPage() {
  const { registrations, loading, error, refetch } = useMyRaceRegistrations();

  const pending = useMemo(
    () => registrations.filter((r) => r.status?.toLowerCase() === 'pending'),
    [registrations]
  );

  return (
    <div className="my-reg-page">
      <div className="my-reg-page__content">
        {error && (
          <div className="my-reg-page__error">
            <span>{error}</span>
            <button type="button" onClick={refetch}>Try again</button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : pending.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="No pending registrations"
            subtitle="You have no horse registrations awaiting approval."
            action={
              <Link to="/races">
                <Button variant="primary">Browse Races</Button>
              </Link>
            }
          />
        ) : (
          <MyRegistrationsTable registrations={pending} />
        )}
      </div>
    </div>
  );
}
