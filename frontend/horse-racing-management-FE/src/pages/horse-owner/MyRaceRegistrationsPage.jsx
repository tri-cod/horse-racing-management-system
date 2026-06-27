import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { useMyRaceRegistrations } from '../../hooks/queries/useMyRaceRegistrations';
import MyRegistrationsTable from '../../components/race-horse/MyRegistrationsTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import DashboardPageHeader from '../../components/shared/DashboardPageHeader';
import Seo from '../../components/seo/Seo';
import '../../assets/css/MyRaceRegistrationsPage.css';
import '../../assets/css/shared/workspace.css';

export default function MyRaceRegistrationsPage() {
  const { registrations, loading, error, refetch } = useMyRaceRegistrations();

  const pending = useMemo(
    () => registrations.filter((r) => r.status?.toLowerCase() === 'pending'),
    [registrations]
  );

  return (
    <div className="ws-page">
      <Seo title="Race Registrations" description="Track your horse race registration requests." />
      <DashboardPageHeader
        eyebrow="Horse Owner"
        title="Race Registrations"
        subtitle={`${pending.length} pending approval`}
      />

      <div className="ws-body">
        {error && <div className="ws-error"><span>{error}</span><button type="button" onClick={refetch}>Try again</button></div>}

        {loading ? <LoadingSpinner /> : pending.length === 0 ? (
          <div className="ws-panel">
            <EmptyState
              icon={Flag}
              title="No pending registrations"
              subtitle="You have no horse registrations awaiting approval."
              action={<Link to="/races"><Button variant="primary">Browse Races</Button></Link>}
            />
          </div>
        ) : (
          <div className="ws-panel">
            <div className="ws-panel__body ws-panel__body--flush">
              <MyRegistrationsTable registrations={pending} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
