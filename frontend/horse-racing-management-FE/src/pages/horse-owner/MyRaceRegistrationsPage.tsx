import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { useMyRaceRegistrations } from '@/hooks/useMyRaceRegistrations';
import MyRegistrationsTable from '@/components/features/race-horse/MyRegistrationsTable';
import AssignJockeyModal from '@/components/features/race-horse/AssignJockeyModal';
import WithdrawRaceHorseModal from '@/components/features/race-horse/WithdrawRaceHorseModal';
import { useToast } from '@/components/ui/ToastProvider';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import { isStatus, isAnyStatus, type RaceHorseStatusKey } from '@/utils/raceHorseStatus';
import type { RaceHorse } from '@/types';

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

const PENDING_STATUSES: RaceHorseStatusKey[] = ['PENDING_JOCKEY', 'PENDING_ADMIN', 'WITHDRAW_PENDING'];

// One table per stage of the registration lifecycle, filtered from the same list.
// REJECTED / WITHDRAWN / WITHDRAW_REJECTED get no tab: the backend hard-deletes
// those rows, so a tab for them would always be empty.
type RegTabKey = 'NEEDS_ATTENTION' | 'PENDING_ADMIN' | 'APPROVED' | 'WITHDRAW_PENDING' | 'FINISHED';

const REG_TABS: { key: RegTabKey; label: string; statuses: RaceHorseStatusKey[]; emptyText: string; actionLabel: string }[] = [
  // PENDING_JOCKEY (waiting on the jockey) and JOCKEY_REJECTED (jockey declined)
  // are the only states the owner must act on — assign or reassign a jockey.
  { key: 'NEEDS_ATTENTION', label: 'Awaiting Jockey', statuses: ['PENDING_JOCKEY', 'JOCKEY_REJECTED'], emptyText: 'No horses awaiting a jockey right now.', actionLabel: 'Actions' },
  { key: 'PENDING_ADMIN', label: 'Pending Approval', statuses: ['PENDING_ADMIN'], emptyText: 'No entries awaiting admin approval.', actionLabel: 'Actions' },
  { key: 'APPROVED', label: 'Approved', statuses: ['APPROVED'], emptyText: 'No approved horses yet.', actionLabel: 'Actions' },
  { key: 'WITHDRAW_PENDING', label: 'Withdrawal Requests', statuses: ['WITHDRAW_PENDING'], emptyText: 'No withdrawal requests.', actionLabel: 'Reason' },
  { key: 'FINISHED', label: 'Finished', statuses: ['FINISHED'], emptyText: 'No finished races yet.', actionLabel: 'Result' },
];

export default function MyRaceRegistrationsPage() {
  const { registrations, loading, error, refetch } = useMyRaceRegistrations();
  const addToast = useToast();
  const [assigning, setAssigning] = useState<RaceHorse | null>(null);
  const [withdrawing, setWithdrawing] = useState<RaceHorse | null>(null);
  const [activeTab, setActiveTab] = useState<RegTabKey>('NEEDS_ATTENTION');

 const approved = useMemo(() => registrations.filter((r) => isStatus(r.status, 'APPROVED')).length, [registrations]);
  const pending  = useMemo(() => registrations.filter((r) => isAnyStatus(r.status, PENDING_STATUSES)).length, [registrations]);
  const rejected = useMemo(() => registrations.filter((r) => isStatus(r.status, 'JOCKEY_REJECTED')).length, [registrations]);

  const tabCounts = useMemo(
    () => Object.fromEntries(
      REG_TABS.map((t) => [t.key, registrations.filter((r) => isAnyStatus(r.status, t.statuses)).length]),
    ) as Record<RegTabKey, number>,
    [registrations],
  );
  const activeTabConfig = REG_TABS.find((t) => t.key === activeTab)!;
  const tabEntries = useMemo(
    () => registrations.filter((r) => isAnyStatus(r.status, activeTabConfig.statuses)),
    [registrations, activeTabConfig],
  );

  const handleActionSuccess = (msg: string) => {
    addToast(msg, 'success');
    refetch();
  };

  return (
    <div className="px-8 py-6">
      <Seo title="Race Registrations" description="Track your horse race registration requests." />
      <DashboardPageHeader
        eyebrow="Horse Owner"
        title="Race Registrations"
        subtitle={pending > 0 ? `${pending} pending approval` : 'All registrations'}
      />

      <AssignJockeyModal raceHorse={assigning} onClose={() => setAssigning(null)} onSuccess={handleActionSuccess} />
      <WithdrawRaceHorseModal raceHorse={withdrawing} onClose={() => setWithdrawing(null)} onSuccess={handleActionSuccess} />

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
            <div className="border-b border-rim px-5 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">All Entries</p>
              {/* Tab bar — one lifecycle stage per tab, each with its own count. */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REG_TABS.map((t) => {
                  const active = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                        active ? 'border-gold text-ink' : 'border-transparent text-ink-3 hover:text-ink-2'
                      }`}
                    >
                      {t.label}
                      <span
                        className={`tnum inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold ${
                          active ? 'bg-gold/15 text-gold' : 'bg-surface-overlay text-ink-4'
                        }`}
                      >
                        {tabCounts[t.key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            {tabEntries.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Flag size={20} className="text-ink-4" />
                <p className="text-sm text-ink-2">{activeTabConfig.emptyText}</p>
              </div>
            ) : (
              <MyRegistrationsTable
                registrations={tabEntries}
                onAssignJockey={setAssigning}
                onWithdraw={setWithdrawing}
                actionLabel={activeTabConfig.actionLabel}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
