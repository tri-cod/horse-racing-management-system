import { useState } from 'react';
import { Flag } from 'lucide-react';
import { useRaces } from '@/hooks/useRaces';
import RaceCard from '@/components/features/race/RaceCard';
import RaceFilterTabs from '@/components/features/race/RaceFilterTabs';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';

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

export default function AdminRaceListPage() {
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(0);
  const { races, loading, error, refetch } = useRaces({ page: 0, size: 100 });

  const filtered = activeTab ? races.filter((r) => r.status === activeTab) : races;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="px-8 py-6">
      <Seo title="Admin - Races" />
      <DashboardPageHeader
        eyebrow="Admin"
        title="Race Management"
        subtitle={`${races.length} total races`}
      />

      <div className="mb-5">
        <RaceFilterTabs active={activeTab} onChange={(v) => { setActiveTab(v); setPage(0); }} />
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
          {paginated.map((r) => <RaceCard key={r.id} race={r} isAdmin onRefetch={refetch} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
