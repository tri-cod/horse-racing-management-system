import { useState, useEffect, useMemo } from 'react';
import { Trophy, Calendar, MapPin, ChevronDown, Search } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { getRaces } from '@/api/raceApi';
import RaceResultSection from '@/components/features/race/RaceResultSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Container from '@/components/ui/Container';
import Seo from '@/components/seo/Seo';
import type { Race } from '@/types';

const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtPrize = (n?: number) => n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : null;

const inputCls =
 'w-full border border-rim bg-surface-input rounded px-3 py-2.5 text-sm text-ink ' +
 'placeholder:text-ink-4 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/10';

function RaceResultCard({ race }: { race: Race }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const prize = fmtPrize(race.totalprizepool);

  return (
    <div
      className={`overflow-hidden rounded-md border bg-surface-raised shadow-sm transition-all ${
        open ? 'border-gold/50 shadow-md' : 'border-rim hover:border-rim-hi hover:shadow-md'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-5 px-5 py-4 text-left"
      >
        {/* Thumbnail */}
        {race.bannerImageurl ? (
          <img src={race.bannerImageurl} alt={race.raceName} loading="lazy"
            className="h-16 w-24 shrink-0 rounded object-cover ring-1 ring-rim" />
        ) : (
          <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded bg-gradient-to-br from-navy to-navy-deep">
            <Trophy size={22} className="text-gold/70" strokeWidth={1.5} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-ok-subtle px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ok">Finished</span>
            {prize && <span className="tnum text-[11px] font-semibold text-gold">{prize} pool</span>}
          </div>
          <h3 className="mt-1 truncate font-serif text-lg font-bold uppercase leading-tight tracking-wide text-ink">{race.raceName}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
            <span className="flex items-center gap-1"><Calendar size={12} className="text-ink-4" />{fmtDate(race.startTime)}</span>
            {race.location && <span className="flex items-center gap-1"><MapPin size={12} className="text-ink-4" />{race.location}</span>}
          </div>
        </div>

        <div className={`shrink-0 rounded-full border p-1.5 transition-all duration-200 ${
          open ? 'rotate-180 border-gold text-gold' : 'border-rim text-ink-4'
        }`}>
          <ChevronDown size={16} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <RaceResultSection raceId={race.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RaceResultsPage() {
 const [races, setRaces] = useState<Race[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [search, setSearch] = useState('');

 useEffect(() => {
 getRaces({ status: 'FINISHED', size: 50 })
 .then((data) => {
 const items = data?.content ?? [];
 setRaces([...items].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
 })
 .catch(() => setError('Unable to load race results.'))
 .finally(() => setLoading(false));
 }, []);

 const filtered = useMemo(() => {
 const kw = search.trim().toLowerCase();
 return kw ? races.filter((r) => r.raceName.toLowerCase().includes(kw)) : races;
 }, [races, search]);

 return (
 <div className="min-h-screen bg-surface">
 <Seo title="Race Results" description="View final standings and prize distribution for completed Royal Derby races." />

 {/* Hero band - navy câu lạc bộ, đồng bộ với các trang public khác */}
 <section className="relative overflow-hidden bg-gradient-to-b from-navy to-navy-deep py-16">
 <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(217,188,118,0.14),transparent_55%)]" />
 <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(217,188,118,0.1),transparent_55%)]" />
 <Container className="relative z-10">
 <div className="flex items-center gap-4">
 <div className="h-px w-10 bg-gold" />
 <span className="eyebrow tracking-[0.2em] !text-gold">Royal Derby</span>
 </div>
 <h1 className="mt-4 flex items-center gap-3 font-serif text-4xl font-bold uppercase leading-tight text-on-blue sm:text-5xl">
 <Trophy size={34} className="shrink-0 text-gold" strokeWidth={1.5} />
 Race Results
 </h1>
 <p className="mt-3 max-w-xl text-on-blue/60">
 Final standings, finishing times and prize distribution for every completed race in the circuit.
 </p>
 </Container>
 </section>

 {/* Nền ivory phía dưới có vignette nhẹ */}
 <div className="relative bg-[radial-gradient(ellipse_at_top,var(--c-surface-overlay),var(--c-surface)_55%)]">
 <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
 {!loading && races.length > 0 && (
 <div className="mb-8 flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
 <div className="relative w-full sm:max-w-xs">
 <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
 <label htmlFor="results-search" className="sr-only">Search by race name</label>
 <input id="results-search" type="text" placeholder="Search by race name..." value={search} onChange={(e) => setSearch(e.target.value)}
 className={`${inputCls} pl-9`} />
 </div>
 <p className="text-sm text-ink-3 whitespace-nowrap">{filtered.length} / {races.length} races</p>
 </div>
 )}

 {error && <p className="mb-6 rounded bg-fail-subtle px-4 py-3 text-sm text-fail">{error}</p>}
 {loading ? <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
 : races.length === 0 ? (
 <div className="flex flex-col items-center gap-3 rounded-md border border-rim bg-surface-overlay py-24 text-center">
 <Trophy size={40} className="text-ink-4" strokeWidth={1.5} />
 <p className="text-sm text-ink-3">No completed races yet.</p>
 </div>
 ) : filtered.length === 0 ? (
 <div className="flex flex-col items-center gap-3 rounded-md border border-rim bg-surface-overlay py-24 text-center">
 <Search size={40} className="text-ink-4" strokeWidth={1.5} />
 <p className="text-sm text-ink-3">No matching races found.</p>
 </div>
 ) : <div className="space-y-4">{filtered.map((r) => <RaceResultCard key={r.id} race={r} />)}</div>}
 </div>
 </div>
 </div>
 );
}
