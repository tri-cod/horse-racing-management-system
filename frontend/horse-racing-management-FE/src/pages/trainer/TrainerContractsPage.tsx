import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { getMyContractsAsTrainer } from '@/api/trainingContractApi';
import { getErrorMessage } from '@/utils/errors';
import { isAnyStatus, type TrainingContractStatus } from '@/utils/trainingContractStatus';
import EmptyState from '@/components/ui/EmptyState';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import TrainingContractsTable from '@/components/features/training-contract/TrainingContractsTable';
import type { TrainingContract } from '@/types';
// (accept/decline now live on the contract detail page)

type TabKey = 'PENDING' | 'ACTIVE' | 'CLOSED';

const TABS: { key: TabKey; label: string; statuses: TrainingContractStatus[]; emptyText: string }[] = [
  { key: 'PENDING', label: 'Requests', statuses: ['PENDING'], emptyText: 'No pending training requests.' },
  { key: 'ACTIVE', label: 'Active', statuses: ['ACTIVE'], emptyText: 'No active training contracts.' },
  { key: 'CLOSED', label: 'Closed', statuses: ['REJECTED', 'CANCELLED', 'COMPLETED'], emptyText: 'No closed contracts yet.' },
];

function TableSkeleton() {
  return (
    <div className="divide-y divide-rim border border-rim bg-surface-raised">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-overlay" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-40 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-surface-overlay" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TrainerContractsPage() {
  const [contracts, setContracts] = useState<TrainingContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('PENDING');

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      setContracts((await getMyContractsAsTrainer()) ?? []);
      setError('');
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Unable to load training contracts.'));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const tabCounts = useMemo(
    () => Object.fromEntries(
      TABS.map((t) => [t.key, contracts.filter((c) => isAnyStatus(c.status, t.statuses)).length]),
    ) as Record<TabKey, number>,
    [contracts],
  );
  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;
  const tabContracts = useMemo(
    () => contracts.filter((c) => isAnyStatus(c.status, activeTabConfig.statuses)),
    [contracts, activeTabConfig],
  );

  const pendingCount = tabCounts.PENDING;

  return (
    <div className="px-8 py-6">
      <Seo title="Training Contracts" description="Review and respond to training requests from horse owners." />
      <DashboardPageHeader
        eyebrow="Trainer"
        title="Training Contracts"
        subtitle={pendingCount > 0 ? `${pendingCount} awaiting your response` : 'Requests from horse owners'}
      />

      {error && (
        <div className="mb-5 flex items-center justify-between border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <button type="button" onClick={fetchContracts} className="font-semibold underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No training contracts yet"
          subtitle="When a horse owner sends you a training request, it will appear here."
        />
      ) : (
        <div className="overflow-hidden border border-rim bg-surface-raised">
          <div className="border-b border-rim px-5 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Contracts</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TABS.map((t) => {
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
          {tabContracts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Dumbbell size={20} className="text-ink-4" />
              <p className="text-sm text-ink-2">{activeTabConfig.emptyText}</p>
            </div>
          ) : (
            <TrainingContractsTable contracts={tabContracts} perspective="trainer" />
          )}
        </div>
      )}
    </div>
  );
}
