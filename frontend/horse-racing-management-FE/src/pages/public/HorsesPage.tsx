import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Rabbit } from 'lucide-react';
import { useHorses } from '@/hooks/useHorses';
import HorseCard from '@/components/features/horse-directory/HorseCard';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import Seo from '@/components/seo/Seo';

const inputCls =
  'w-full border border-rim bg-surface-input rounded px-3 py-2.5 text-sm text-ink ' +
  'placeholder:text-ink-4 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/10';

export default function HorsesPage() {
  const { horses, loading, error, refetch } = useHorses();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    const list = kw ? horses.filter((h) => h.horseName.toLowerCase().includes(kw)) : horses;
    return [...list].sort((a, b) => a.horseId - b.horseId);
  }, [horses, search]);

  return (
    <div className="min-h-screen bg-surface">
      <Seo title="Horses" description="Discover the horses racing across the Royal Derby system." />

      <Container className="py-10">
        {/* Toolbar */}
        <Reveal distance={-20}>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
              <label htmlFor="horses-search" className="sr-only">Search by horse name</label>
              <input id="horses-search" type="text" placeholder="Search by horse name..." value={search} onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} pl-9`} />
            </div>
            <p className="text-sm text-ink-3 whitespace-nowrap">{filtered.length} / {horses.length} horses</p>
          </div>
        </Reveal>

        {error && (
          <div className="mb-8 flex items-center justify-between gap-4 border border-fail/30 bg-fail-subtle px-5 py-4 text-sm text-fail">
            <span>{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}
              className="!border-fail !text-fail hover:!bg-fail/10">Try Again</Button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex h-[340px] animate-pulse flex-col justify-between rounded-md bg-surface-overlay p-6">
                <div className="space-y-2">
                  <div className="h-3 w-1/3 rounded bg-rim" />
                  <div className="h-6 w-2/3 rounded bg-rim" />
                </div>
                <div className="h-8 w-10 rounded bg-rim" />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && horses.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-md border border-rim bg-surface-overlay py-24 text-center">
            <Rabbit size={40} className="text-ink-4" strokeWidth={1.5} />
            <p className="text-sm text-ink-3">No horses available at the moment.</p>
          </div>
        )}

        {!loading && !error && horses.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-md border border-rim bg-surface-overlay py-24 text-center">
            <Search size={40} className="text-ink-4" strokeWidth={1.5} />
            <p className="text-sm text-ink-3">No matching horses found.</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setSearch('')}
              className="!border-rim-hi !text-ink-2 hover:!bg-surface-overlay">
              Clear Search
            </Button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {filtered.map((h, i) => (
              <Reveal key={h.horseId} distance={-24} delay={Math.floor(i / 2) * 90}>
                <HorseCard horse={h} index={i} onClick={() => navigate(`/horses/${h.horseId}`)} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}