import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { useMyRaceRegistrations } from '@/hooks/useMyRaceRegistrations';
import MyRegistrationsTable from '@/components/features/race-horse/MyRegistrationsTable';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';

function TableSkeleton() {
  return (
    <div className="overflow-hidden border border-rim bg-surface-raised">
      <div className="h-[60px] animate-pulse border-b border-rim bg-surface-overlay" />
      <div className="divide-y divide-rim">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-5 py-3.5">
            <div className="h-3.5 w-40 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3.5 w-24 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3.5 w-28 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3.5 w-8 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-surface-overlay" />
            <div className="ml-auto h-3.5 w-20 animate-pulse rounded-full bg-surface-overlay" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyRaceRegistrationsPage() {
  const { registrations, loading, error, refetch } = useMyRaceRegistrations();

  const approved = useMemo(() => registrations.filter((r) => r.status?.toLowerCase() === 'approved').length, [registrations]);
  const pending  = useMemo(() => registrations.filter((r) => r.status?.toLowerCase() === 'pending').length,  [registrations]);
  const rejected = useMemo(() => registrations.filter((r) => r.status?.toLowerCase() === 'rejected').length, [registrations]);

  return (
    <div className="px-8 py-6">
      <Seo title="Race Registrations" description="Track your horse race registration requests." />
      <DashboardPageHeader
        eyebrow="Horse Owner"
        title="Race Registrations"
        subtitle={pending > 0 ? `${pending} pending approval` : 'All registrations'}
      />

      {error && (
        <div className="mb-5 flex items-center justify-between border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <button type="button" onClick={() => refetch()} className="font-semibold underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <>
          {/* Stat strip skeleton */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[68px] animate-pulse border border-rim bg-surface-raised" />
            ))}
          </div>
          <TableSkeleton />
        </>
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No registrations yet"
          subtitle="You have no horse registrations awaiting approval."
          action={
            <Link to="/horse-owner/register-race">
              <Button variant="primary">Browse Races</Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Stat strip */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total',    value: registrations.length, cls: 'text-ink'  },
              { label: 'Approved', value: approved,             cls: 'text-ok'   },
              { label: 'Pending',  value: pending,              cls: 'text-warn'  },
              { label: 'Rejected', value: rejected,             cls: 'text-fail'  },
            ].map(({ label, value, cls }) => (
              <div key={label} className="border border-rim bg-surface-raised px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">{label}</p>
                <p className={`tnum mt-1 text-2xl font-bold ${cls}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div className="overflow-hidden border border-rim bg-surface-raised">
            <div className="border-b border-rim px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">History</p>
              <h2 className="mt-0.5 font-serif text-base font-bold text-ink">
                {registrations.length} Registration{registrations.length !== 1 ? 's' : ''}
              </h2>
            </div>
            <MyRegistrationsTable registrations={registrations} />
          </div>
        </>
      )}
    </div>
  );
}
