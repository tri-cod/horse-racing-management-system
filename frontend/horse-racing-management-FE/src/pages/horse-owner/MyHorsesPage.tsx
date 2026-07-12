import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useMyHorses } from '@/hooks/useMyHorses';
import HorseCard from '@/components/features/horse-owner/HorseCard';
import Button from '@/components/ui/Button';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';

/* Skeleton card for loading state */
function HorseCardSkeleton() {
  return (
    <div className="overflow-hidden border border-rim bg-surface-raised">
      <div className="h-48 animate-pulse bg-surface-overlay" />
      <div className="p-4">
        <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-surface-overlay" />
        <div className="mb-4 h-3 w-1/2 animate-pulse rounded bg-surface-overlay" />
        <div className="border-t border-rim pt-3">
          <div className="h-3 w-2/3 animate-pulse rounded bg-surface-overlay" />
        </div>
      </div>
    </div>
  );
}

export default function MyHorsesPage() {
  const navigate = useNavigate();
  const { horses, loading, error, refetch } = useMyHorses();

  const active = horses.filter((h) => h.status === 'ACTIVE').length;
  const other  = horses.length - active;

  return (
    <div className="px-8 py-6">
      <Seo title="My Horses" description="Manage your registered horses on Royal Derby." />

      <DashboardPageHeader
        eyebrow="Horse Owner"
        title="My Horses"
        action={
          <Button variant="primary" onClick={() => navigate('/horse-owner/horses/new')}>
            <Plus size={15} /> Register Horse
          </Button>
        }
      />

      {/* Stat strip */}
      {!loading && horses.length > 0 && (
        <div className="mb-6 flex items-center gap-6">
          <div className="flex items-baseline gap-1.5">
            <span className="tnum text-2xl font-bold text-ink">{horses.length}</span>
            <span className="text-xs text-ink-3">total</span>
          </div>
          <div className="h-5 w-px bg-rim" />
          <div className="flex items-baseline gap-1.5">
            <span className="tnum text-sm font-semibold text-ok">{active}</span>
            <span className="text-xs text-ink-3">active</span>
          </div>
          {other > 0 && (
            <>
              <div className="h-5 w-px bg-rim" />
              <div className="flex items-baseline gap-1.5">
                <span className="tnum text-sm font-semibold text-ink-3">{other}</span>
                <span className="text-xs text-ink-3">inactive</span>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center justify-between rounded border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <button type="button" onClick={() => refetch()} className="font-semibold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <HorseCardSkeleton key={i} />)}
        </div>
      ) : horses.length === 0 ? (
        /* Premium empty state */
        <div className="flex flex-col items-center justify-center bg-navy/5 px-8 py-20 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-rim bg-surface-raised">
            <span className="font-serif text-3xl font-bold text-ink-4">H</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-ink">No horses yet</h2>
          <p className="mt-2 max-w-xs text-sm text-ink-3">
            Register your first horse to your stable and begin competing on Royal Derby.
          </p>
          <button
            type="button"
            onClick={() => navigate('/horse-owner/horses/new')}
            className="mt-8 flex items-center gap-2 bg-navy px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-blue transition-colors hover:bg-navy-deep"
          >
            <Plus size={13} /> Register a Horse
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {horses.map((h) => (
            <HorseCard key={h.id} horse={h} onClick={() => navigate(`/horse-owner/horses/${h.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
