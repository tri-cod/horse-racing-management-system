import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Search } from 'lucide-react';
import { useMyHorses } from '@/hooks/useMyHorses';
import { deleteHorse } from '@/api/horseOwnerApi';
import { useToast } from '@/components/ui/ToastProvider';
import HorseStatusBadge from '@/components/features/horse-owner/HorseStatusBadge';
import Button from '@/components/ui/Button';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import { getErrorMessage } from '@/utils/errors';
import type { Horse, HorseStatus } from '@/types';

/* Shared column ratio for the horses table — MUST stay identical between the
 * header row and each data row, or columns will visibly drift out of alignment. */
const HORSES_GRID_COLS = '2fr_1.1fr_0.8fr_0.6fr_0.7fr_0.9fr_120px';

const STATUS_TABS: { value: HorseStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RACING', label: 'Racing' },
  { value: 'FINISHED', label: 'Finished' },
  { value: 'INACTIVE', label: 'Resting' },
  { value: 'RETIRED', label: 'Retired' },
];

const inputCls =
  'w-full border border-rim bg-surface-input rounded px-3 py-2.5 text-sm text-ink ' +
  'placeholder:text-ink-4 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/10';

function TableSkeleton() {
  return (
    <div className="divide-y divide-rim border border-rim bg-surface-raised">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-overlay" />
          <div className="h-3.5 w-40 animate-pulse rounded-full bg-surface-overlay" />
          <div className="ml-auto h-3.5 w-16 animate-pulse rounded-full bg-surface-overlay" />
        </div>
      ))}
    </div>
  );
}

export default function MyHorsesPage() {
  const navigate = useNavigate();
  const addToast = useToast();
  const { horses, loading, error, refetch } = useMyHorses();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [breedFilter, setBreedFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<HorseStatus | ''>('');

  const active = horses.filter((h) => h.status === 'ACTIVE').length;
  const other  = horses.length - active;

  const breeds = useMemo(
    () => [...new Set(horses.map((h) => h.breed).filter((b): b is string => !!b))].sort(),
    [horses],
  );

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return horses.filter((h) =>
      (!kw || h.horseName.toLowerCase().includes(kw)) &&
      (!breedFilter || h.breed === breedFilter) &&
      (!statusFilter || h.status === statusFilter),
    );
  }, [horses, search, breedFilter, statusFilter]);

  const clearFilters = () => { setSearch(''); setBreedFilter(''); setStatusFilter(''); };

  const handleDelete = async (horse: Horse) => {
    if (!window.confirm(`Delete "${horse.horseName}"? This cannot be undone.`)) return;
    setDeletingId(horse.id);
    try {
      await deleteHorse(horse.id);
      addToast(`"${horse.horseName}" deleted.`, 'success');
      refetch();
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Failed to delete horse.'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

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

      {/* Toolbar — search, breed filter, status filter */}
      {!loading && horses.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 border-b border-rim pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
              <label htmlFor="horses-search" className="sr-only">Search by horse name</label>
              <input
                id="horses-search" type="text" placeholder="Search by horse name..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} pl-9`}
              />
            </div>

            <label htmlFor="breed-filter" className="sr-only">Filter by breed</label>
            <select
              id="breed-filter" value={breedFilter} onChange={(e) => setBreedFilter(e.target.value)}
              className={`${inputCls} w-auto`}
            >
              <option value="">All Breeds</option>
              {breeds.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            <div className="flex gap-1 border border-rim bg-surface-raised p-1" role="tablist">
              {STATUS_TABS.map((t) => (
                <button
                  key={t.value}
                  role="tab"
                  aria-selected={statusFilter === t.value}
                  type="button"
                  onClick={() => setStatusFilter(t.value)}
                  className={`shrink-0 px-3 py-1.5 text-sm font-medium transition-colors ${
                    statusFilter === t.value ? 'bg-gold text-on-gold' : 'text-ink-3 hover:bg-surface-overlay hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-ink-3 whitespace-nowrap">{filtered.length} / {horses.length} horses</p>
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
        <TableSkeleton />
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
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border border-rim bg-surface-overlay py-24 text-center">
          <Search size={40} className="text-ink-4" strokeWidth={1.5} />
          <p className="text-sm text-ink-3">No matching horses found.</p>
          <Button variant="ghost" size="sm" onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <div className="overflow-hidden border border-rim bg-surface-raised">
          {/* Column headers */}
          <div
            className="grid items-center gap-4 border-b border-rim bg-surface-overlay px-5 py-2.5"
            style={{ gridTemplateColumns: HORSES_GRID_COLS.split('_').join(' ') }}
          >
            {['Horse', 'Breed', 'Gender', 'Age', 'Speed', 'Status', 'Action'].map((h) => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                {h}
              </span>
            ))}
          </div>

          <div className="divide-y divide-rim">
            {filtered.map((h) => {
              const initial = h.horseName?.charAt(0)?.toUpperCase() ?? '?';
              const isDeleting = deletingId === h.id;

              return (
                <div
                  key={h.id}
                  className="grid items-center gap-4 px-5 py-3 transition-colors hover:bg-surface-overlay/40"
                  style={{ gridTemplateColumns: HORSES_GRID_COLS.split('_').join(' ') }}
                >
                  {/* Horse */}
                  <button
                    type="button"
                    onClick={() => navigate(`/horse-owner/horses/${h.id}`)}
                    className="flex min-w-0 items-center gap-2.5 text-left"
                  >
                    {h.avatarUrl ? (
                      <img src={h.avatarUrl} alt={h.horseName} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-xs font-bold text-navy">
                        {initial}
                      </div>
                    )}
                    <span className="truncate font-serif text-sm font-bold text-ink hover:text-navy">
                      {h.horseName}
                    </span>
                  </button>

                  {/* Breed */}
                  <span className="truncate text-sm text-ink-2">{h.breed ?? '—'}</span>

                  {/* Gender */}
                  <span className="truncate text-sm text-ink-2">{h.gender ?? '—'}</span>

                  {/* Age */}
                  <span className="tnum text-sm text-ink-2">{h.age != null ? `${h.age} yrs` : '—'}</span>

                  {/* Speed */}
                  <span className="tnum text-sm text-ink-2">{h.speedRating ?? '—'}</span>

                  {/* Status — justify-self-start keeps the pill hugging its text instead of
                      stretching to fill the grid column (grid items stretch by default). */}
                  <div className="justify-self-start">
                    <HorseStatusBadge status={h.status} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-5">
                    <button
                      type="button"
                      title="View"
                      onClick={() => navigate(`/horse-owner/horses/${h.id}`)}
                      className="flex h-7 w-7 items-center justify-center border border-rim text-ink-3 transition-colors hover:border-rim-hi hover:text-ink"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => navigate(`/horse-owner/horses/${h.id}/edit`)}
                      className="flex h-7 w-7 items-center justify-center border border-rim text-ink-3 transition-colors hover:border-gold hover:text-gold"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      disabled={isDeleting}
                      onClick={() => handleDelete(h)}
                      className="flex h-7 w-7 items-center justify-center border border-rim text-ink-3 transition-colors hover:border-fail hover:text-fail disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
