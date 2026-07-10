import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { useJockeys } from '@/hooks/useJockeys';
import JockeyCard from '@/components/features/jockey/JockeyCard';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Seo from '@/components/seo/Seo';

const inputCls =
  'w-full border border-rim bg-surface-input rounded px-3 py-2.5 text-sm text-ink ' +
  'placeholder:text-ink-4 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/10';

export default function JockeysPage() {
  const { jockeys, loading, error, refetch } = useJockeys();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return kw ? jockeys.filter((j) => j.name.toLowerCase().includes(kw)) : jockeys;
  }, [jockeys, search]);

  return (
    <div className="min-h-screen bg-surface">
      <Seo title="Jockeys" description="Discover the talented riders competing across the Royal Derby system." />

      <Container className="py-10">
        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-4 border-b border-rim pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
            <label htmlFor="jockeys-search" className="sr-only">Search by jockey name</label>
            <input id="jockeys-search" type="text" placeholder="Search by jockey name..." value={search} onChange={(e) => setSearch(e.target.value)}
              className={`${inputCls} pl-9`} />
          </div>
          <p className="text-sm text-ink-3 whitespace-nowrap">{filtered.length} / {jockeys.length} jockeys</p>
        </div>

        {error && (
          <div className="mb-8 flex items-center justify-between gap-4 border border-fail/30 bg-fail-subtle px-5 py-4 text-sm text-fail">
            <span>{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}
              className="!border-fail !text-fail hover:!bg-fail/10">Try Again</Button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex h-48 animate-pulse flex-col justify-between rounded-md bg-surface-overlay p-5">
                <div className="space-y-2">
                  <div className="h-3 w-1/3 rounded bg-rim" />
                  <div className="h-6 w-2/3 rounded bg-rim" />
                </div>
                <div className="h-8 w-10 rounded bg-rim" />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && jockeys.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-md border border-rim bg-surface-overlay py-24 text-center">
            <Users size={40} className="text-ink-4" strokeWidth={1.5} />
            <p className="text-sm text-ink-3">No active jockeys at the moment.</p>
          </div>
        )}

        {!loading && !error && jockeys.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-md border border-rim bg-surface-overlay py-24 text-center">
            <Search size={40} className="text-ink-4" strokeWidth={1.5} />
            <p className="text-sm text-ink-3">No matching jockeys found.</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setSearch('')}
              className="!border-rim-hi !text-ink-2 hover:!bg-surface-overlay">
              Clear Search
            </Button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((j, i) => <JockeyCard key={j.id} jockey={j} index={i} onClick={() => navigate(`/jockeys/${j.id}`)} />)}
          </div>
        )}
      </Container>
    </div>
  );
}
