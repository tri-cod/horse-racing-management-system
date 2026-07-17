import { useState } from 'react';
import { Flag } from 'lucide-react';
import { useRaces } from '@/hooks/useRaces';
import RaceCard from '@/components/features/race/RaceCard';
import RaceFilterTabs, { STATUSES_FOR_TAB } from '@/components/features/race/RaceFilterTabs';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';

function RaceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="overflow-hidden border border-rim bg-surface-raised">
          <div className="h-40 animate-pulse bg-surface-overlay" />
          <div className="space-y-2 px-4 py-4">
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3 w-2/5 animate-pulse rounded-full bg-surface-overlay" />
          </div>
          <div className="flex gap-1 border-t border-rim px-3 py-2">
            <div className="h-6 w-20 animate-pulse rounded bg-surface-overlay" />
            <div className="h-6 w-14 animate-pulse rounded bg-surface-overlay" />
            <div className="h-6 w-16 animate-pulse rounded bg-surface-overlay" />
          </div>
        </div>
      ))}
    </div>
  );
}

const PAGE_SIZE = 9;

export default function RacesPanel() {
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(0);
  const { races, loading, error, refetch } = useRaces({ page: 0, size: 100 });

  // "Upcoming" covers more than the literal UPCOMING status — a race open (or
  // closed) for registration, or open for betting, is still upcoming. Match the
  // tab against its whole status set (defined in RaceFilterTabs) instead of one
  // exact string, which is why the Upcoming tab was previously coming up empty.
  const filtered = activeTab
    ? races.filter((r) => (STATUSES_FOR_TAB[activeTab] ?? []).includes(r.status))
    : races;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <RaceFilterTabs active={activeTab} onChange={(v) => { setActiveTab(v); setPage(0); }} />
        <p className="shrink-0 text-sm text-ink-3">{races.length} total races</p>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between rounded border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <button type="button" onClick={() => refetch()} className="font-semibold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <RaceGridSkeleton />
      ) : paginated.length === 0 ? (
        <EmptyState icon={Flag} title="No races found" subtitle="Try a different status filter." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((r) => <RaceCard key={r.id} race={r} isAdmin />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </>
  );
}