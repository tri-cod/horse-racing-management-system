import { useState, useEffect, useMemo } from 'react';
import { Trophy, Calendar, MapPin, ChevronDown, DollarSign, Search } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { getRaces } from '@/api/raceApi';
import RaceResultSection from '@/components/features/race/RaceResultSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Seo from '@/components/seo/Seo';
import type { Race } from '@/types';

const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtPrize = (n?: number) => n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : null;

const inputCls =
 'w-full border border-on-blue/20 bg-on-blue/5 rounded px-3 py-2.5 text-sm text-on-blue ' +
 'placeholder:text-on-blue/35 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/10';

function RaceResultCard({ race }: { race: Race }) {
 const [open, setOpen] = useState(false);
 const reduce = useReducedMotion();
 return (
 <div className="overflow-hidden rounded-md border border-rim bg-surface-raised transition-colors hover:border-rim-hi">
 <button
 type="button"
 onClick={() => setOpen((v) => !v)}
 className="flex w-full items-center gap-4 px-5 py-4 text-left"
 >
 {race.bannerImageurl ? (
 <img src={race.bannerImageurl} alt={race.raceName} loading="lazy"
 className="h-14 w-20 shrink-0 object-cover" />
 ) : (
 <div className="flex h-14 w-20 shrink-0 items-center justify-center bg-surface-overlay">
 <Trophy size={20} className="text-ink-4" />
 </div>
 )}

 <div className="min-w-0 flex-1">
 <h3 className="truncate text-base font-bold uppercase tracking-wide text-ink">{race.raceName}</h3>
 <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
 <span className="flex items-center gap-1"><Calendar size={12} className="text-ink-4" />{fmtDate(race.startTime)}</span>
 {race.location && <span className="flex items-center gap-1"><MapPin size={12} className="text-ink-4" />{race.location}</span>}
 {fmtPrize(race.totalprizepool) && (
 <span className="flex items-center gap-1 font-semibold text-gold"><DollarSign size={12} />{fmtPrize(race.totalprizepool)}</span>
 )}
 </div>
 </div>

 <div className={`shrink-0 text-ink-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
 <ChevronDown size={18} />
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
 <div className="relative min-h-screen overflow-hidden bg-navy">
 <Seo title="Race Results" description="View final standings and prize distribution for completed Royal Derby races." />

 {/* Diagonal gold stripe pattern */}
 <div className="pointer-events-none absolute inset-0" style={{
 backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(168,132,59,0.045) 28px, rgba(168,132,59,0.045) 29px)'
 }} />
 {/* Glow circles */}
 <div className="pointer-events-none absolute inset-0 overflow-hidden">
 <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gold/8 blur-3xl" />
 <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-on-blue/5 blur-3xl" />
 </div>

 <div className="relative z-10 mx-auto max-w-5xl px-6 py-10 lg:px-8">
 {!loading && races.length > 0 && (
 <div className="mb-6 border-b border-on-blue/15 pb-6">
 <div className="relative w-full sm:max-w-xs">
 <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-blue/40" />
 <label htmlFor="results-search" className="sr-only">Search by race name</label>
 <input id="results-search" type="text" placeholder="Search by race name..." value={search} onChange={(e) => setSearch(e.target.value)}
 className={`${inputCls} pl-9`} />
 </div>
 </div>
 )}

 {error && <p className="mb-6 bg-fail-subtle px-4 py-3 text-sm text-fail">{error}</p>}
 {loading ? <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
 : races.length === 0 ? (
 <div className="flex flex-col items-center gap-3 border border-on-blue/15 bg-on-blue/5 py-24 text-center">
 <Trophy size={40} className="text-on-blue/30" strokeWidth={1.5} />
 <p className="text-sm text-on-blue/50">No completed races yet.</p>
 </div>
 ) : filtered.length === 0 ? (
 <div className="flex flex-col items-center gap-3 border border-on-blue/15 bg-on-blue/5 py-24 text-center">
 <Search size={40} className="text-on-blue/30" strokeWidth={1.5} />
 <p className="text-sm text-on-blue/50">No matching races found.</p>
 </div>
 ) : <div className="space-y-4">{filtered.map((r) => <RaceResultCard key={r.id} race={r} />)}</div>}
 </div>
 </div>
 );
}
