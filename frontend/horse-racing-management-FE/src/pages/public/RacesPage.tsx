import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flag, Calendar, Ticket } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useRaces } from '@/hooks/useRaces';
import { useRaceDetail } from '@/hooks/useRaceDetail';
import { useHorsesByRace } from '@/hooks/useHorsesByRace';
import { useRaceResults, type NormalizedRaceResult } from '@/hooks/useRaceResults';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastProvider';
import RaceStatusBadge from '@/components/features/race/RaceStatusBadge';
import PlaceBetModal from '@/components/features/bet/PlaceBetModal';
import Container from '@/components/ui/Container';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Seo from '@/components/seo/Seo';
import { assignLanes } from '@/utils/laneUtils';
import type { Race } from '@/types';

/* ── Helpers ─────────────────────────────────────────────────────────── */
function toDateStr(d: Date) { return d.toISOString().slice(0, 10); }

function fmtPrize(n?: number) {
  if (!n) return null;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

/* ── Lane post-position colors (traditional racing) ─────────────────── */
const LANE_CLR: Record<number, string> = {
  1: 'bg-red-600 text-white',
  2: 'bg-white text-gray-900 border-2 border-gray-300',
  3: 'bg-sky-600 text-white',
  4: 'bg-yellow-400 text-black',
  5: 'bg-green-700 text-white',
  6: 'bg-orange-500 text-white',
  7: 'bg-pink-500 text-white',
  8: 'bg-purple-700 text-white',
  9: 'bg-teal-600 text-white',
};
function laneClr(n?: number) {
  if (!n) return 'bg-surface-overlay text-ink-3';
  return LANE_CLR[n] ?? 'bg-navy text-on-blue';
}

/* ── Mini Calendar ───────────────────────────────────────────────────── */
const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface CalendarProps {
  raceDates: Set<string>;
  selected: string | null;
  onSelect: (d: string) => void;
}

function MiniCalendar({ raceDates, selected, onSelect }: CalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const todayStr = toDateStr(today);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-md border border-rim bg-surface-raised overflow-hidden">
      {/* Month header */}
      <div className="flex items-center justify-between bg-navy px-4 py-3">
        <button onClick={prevMonth}
          className="flex h-7 w-7 items-center justify-center text-on-blue/60 hover:bg-on-blue/10 hover:text-on-blue transition-colors">
          <ChevronLeft size={15} />
        </button>
        <span className="tnum text-sm font-bold text-on-blue">
          {MONTHS[month].toUpperCase()} {year}
        </span>
        <button onClick={nextMonth}
          className="flex h-7 w-7 items-center justify-center text-on-blue/60 hover:bg-on-blue/10 hover:text-on-blue transition-colors">
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Week day labels */}
      <div className="grid grid-cols-7 border-b border-rim bg-surface-overlay">
        {WEEK_DAYS.map(d => (
          <div key={d} className="py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-ink-4">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0 px-2 pt-2 pb-0">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasRace = raceDates.has(dStr);
          const isToday = dStr === todayStr;
          const isSel = dStr === selected;

          return (
            <button key={i} onClick={() => onSelect(dStr)}
              className={`relative flex flex-col items-center justify-center py-1.5 text-sm transition-colors hover:bg-surface-overlay ${
                isSel ? 'bg-navy text-on-blue font-bold' :
                isToday ? 'font-bold text-navy' :
                hasRace ? 'font-bold text-ink' :
                'text-ink-4'
              }`}>
              <span>{day}</span>
              {/* Dot below today */}
              {isToday && !isSel && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-gold" />
              )}
              {/* Race indicator */}
              {hasRace && !isSel && !isToday && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-navy/40" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Position badge — matches home page Leaderboard ─────────────────── */
function PosBadge({ pos }: { pos: number }) {
  const gold   = 'text-gold-hi';
  const silver = 'text-ink-2';
  const bronze = 'text-[#a8703f]';
  const muted  = 'text-ink-3';
  const cls = pos === 1 ? gold : pos === 2 ? silver : pos === 3 ? bronze : muted;
  return (
    <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center text-2xl font-bold ${cls}`}>
      {pos}
    </span>
  );
}

/* ── Finished Race Results ──────────────────────────────────────────── */
function FinishedResults({ results }: { results: NormalizedRaceResult[] }) {
  return (
    <div className="bg-surface-overlay py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header row */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-hi">Race Results</p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-ink sm:text-4xl">Final Standings</h2>
          </div>
        </div>

        {results.length === 0 ? (
          <p className="text-sm text-ink-4">Official results not yet published.</p>
        ) : (
          <div className="overflow-hidden rounded-sm border border-rim bg-surface-raised">
            {/* Table header */}
            <div className="grid grid-cols-[2.5rem_1fr_1fr_auto] gap-4 border-b border-rim bg-surface-overlay px-5 py-2.5 sm:grid-cols-[2.5rem_1fr_1fr_1fr_auto]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-3">Rank</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-3">Horse</span>
              <span className="hidden text-[10px] font-bold uppercase tracking-widest text-ink-3 sm:block">Jockey</span>
              <span className="hidden text-[10px] font-bold uppercase tracking-widest text-ink-3 sm:block">Time</span>
              <span className="text-right text-[10px] font-bold uppercase tracking-widest text-ink-3">Odds</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-rim">
              {results.map((r) => {
                const isFirst = r.position === 1;
                return (
                  <div key={r.id}
                    className={`grid grid-cols-[2.5rem_1fr_1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-gold/5 sm:grid-cols-[2.5rem_1fr_1fr_1fr_auto] ${isFirst ? 'bg-gold/[0.06]' : ''}`}>
                    <PosBadge pos={r.position} />
                    <div>
                      <p className={`font-semibold leading-tight ${isFirst ? 'text-gold-hi' : 'text-ink'}`}>
                        {r.horseName}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-3 sm:hidden">{r.jockeyName}</p>
                    </div>
                    <span className="hidden text-sm text-ink-2 sm:block">{r.jockeyName}</span>
                    <span className="hidden tnum text-sm text-ink-3 sm:block">{r.time ?? '—'}</span>
                    <span className={`tnum text-right text-sm font-semibold ${isFirst ? 'text-gold-hi' : r.odds != null ? 'text-ink-2' : 'text-ink-4'}`}>
                      {r.odds != null ? `×${Number(r.odds).toFixed(2)}` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Race Detail Panel ───────────────────────────────────────────────── */
function RaceDetailPanel({ raceId }: { raceId: number }) {
  const { race, loading: rl } = useRaceDetail(raceId);
  const { entries: raw, loading: el } = useHorsesByRace(raceId);

  const entries = useMemo(() =>
    assignLanes(raw.filter(e =>
      e.status?.toLowerCase() === 'approved'
    ) as Parameters<typeof assignLanes>[0])
      .sort((a, b) => (a.odds ?? Infinity) - (b.odds ?? Infinity)),
    [raw]
  );

  if (rl || el) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (!race) return null;

  return (
    <div className="overflow-hidden rounded-md border border-rim">

      {/* Banner — race name overlaid at bottom */}
      <div className="relative h-56 overflow-hidden sm:h-64">
        {race.bannerImageurl
          ? <img src={race.bannerImageurl} alt={race.raceName} className="h-full w-full object-cover" />
          : <div className="h-full w-full bg-navy" />}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 py-5">
          <h2 className="font-serif text-2xl font-bold uppercase text-on-blue sm:text-3xl">
            {race.raceName}
          </h2>
        </div>
      </div>

      {/* Distance / Surface strip */}
      <div className="grid grid-cols-2 divide-x divide-on-blue/20 bg-navy">
        <div className="px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-blue/50">Distance:</p>
          <p className="tnum mt-0.5 text-sm font-bold uppercase text-on-blue">{race.distance ?? '—'}</p>
        </div>
        <div className="px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-blue/50">Surface:</p>
          <p className="mt-0.5 text-sm font-bold uppercase text-on-blue">{race.surfaceType ?? '—'}</p>
        </div>
      </div>

      {/* Race details */}
      <div className="border-b border-rim bg-surface-raised px-5 py-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
          {race.totalprizepool && (
            <div><span className="text-ink-4">Prize Pool: </span>
              <span className="font-medium text-ink">{fmtPrize(race.totalprizepool)}</span></div>
          )}
          {race.trackCondition && (
            <div><span className="text-ink-4">Condition: </span>
              <span className="font-medium text-ink">{race.trackCondition}</span></div>
          )}
          {race.trackName && (
            <div><span className="text-ink-4">Track: </span>
              <span className="font-medium text-ink">{race.trackName}</span></div>
          )}
          {race.capacity && (
            <div><span className="text-ink-4">Capacity: </span>
              <span className="font-medium text-ink">{race.capacity} horses</span></div>
          )}
          {race.location && (
            <div className="col-span-2"><span className="text-ink-4">Location: </span>
              <span className="font-medium text-ink">{race.location}</span></div>
          )}
        </div>
        <div className="mt-3"><RaceStatusBadge race={race} size="sm" /></div>
      </div>

      {/* Entries table */}
      {entries.length === 0 ? (
        <div className="bg-surface-raised px-5 py-12 text-center">
          <p className="text-sm text-ink-3">No approved entries yet.</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-y border-rim bg-surface-overlay">
              <th className="py-2.5 pl-5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-4 w-10">PG</th>
              <th className="py-2.5 pl-3 text-left text-[10px] font-bold uppercase tracking-wider text-ink-4 w-14">PP</th>
              <th className="py-2.5 pl-3 text-left text-[10px] font-bold uppercase tracking-wider text-ink-4">Horse / Connections</th>
              <th className="py-2.5 pr-5 text-right text-[10px] font-bold uppercase tracking-wider text-ink-4">M/L</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, idx) => (
              <tr key={e.id}
                className={`border-b border-rim transition-colors hover:bg-surface-overlay/60 ${idx % 2 === 0 ? 'bg-surface-raised' : 'bg-surface'}`}>
                {/* Program number */}
                <td className="py-4 pl-5 align-top">
                  <span className="tnum text-sm font-medium text-ink-4">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </td>
                {/* Post position badge */}
                <td className="py-4 pl-3 align-top">
                  <div className={`inline-flex h-10 w-10 items-center justify-center text-base font-bold ${laneClr(e.laneNumber ?? undefined)}`}>
                    {e.laneNumber ?? '—'}
                  </div>
                </td>
                {/* Horse name + connections */}
                <td className="py-4 pl-3 align-top">
                  <p className="text-base font-bold uppercase leading-tight tracking-wide text-ink">
                    {e.horseName}
                  </p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-ink-4">
                    Jockey: {e.jockeyName ?? '—'}
                  </p>
                </td>
                {/* Morning line odds */}
                <td className="py-4 pr-5 text-right align-top">
                  <span className="tnum text-base font-bold text-ink">{e.odds}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>

  );
}

/* ── Race Results Section (full-width, outside grid) ────────────────── */
function RaceResultsSection({ raceId }: { raceId: number }) {
  const { results, loading } = useRaceResults(raceId);
  if (loading) return (
    <div className="flex items-center justify-center gap-2 bg-navy py-16 text-sm text-on-blue/40">
      <LoadingSpinner size="sm" /> Loading results…
    </div>
  );
  return <FinishedResults results={results} />;
}

/* ── Main Page ───────────────────────────────────────────────────────── */
export default function RacesPage({ bettingMode = false }: { bettingMode?: boolean }) {
  const { races, loading } = useRaces({ page: 0, size: 200 });
  const { user } = useAuth();
  const addToast = useToast();
  const [showBet, setShowBet] = useState(false);
  const [searchParams] = useSearchParams();

  /* Map date → races on that date */
  const racesPerDate = useMemo(() => {
    const map: Record<string, Race[]> = {};
    races.forEach((r) => {
      if (!r.startTime) return;
      const k = new Date(r.startTime).toISOString().slice(0, 10);
      if (!map[k]) map[k] = [];
      map[k].push(r);
    });
    return map;
  }, [races]);

  const raceDates = useMemo(() => new Set(Object.keys(racesPerDate)), [racesPerDate]);

  const [selectedDate, setSelectedDate] = useState<string | null>(
    searchParams.get('date') ?? toDateStr(new Date())
  );
  const [selectedRaceIdx, setSelectedRaceIdx] = useState(0);

  const racesOnDay = selectedDate ? (racesPerDate[selectedDate] ?? []) : [];
  const selectedRace = racesOnDay[selectedRaceIdx] ?? null;

  const handleSelectDate = (d: string) => {
    setSelectedDate(d);
    setSelectedRaceIdx(0);
  };

  const { entries: rawBetHorses } = useHorsesByRace(selectedRace?.id);
  const betHorses = useMemo(() =>
    assignLanes(rawBetHorses.filter((e) =>
      e.status?.toLowerCase() === 'approved' && e.odds != null
    ) as Parameters<typeof assignLanes>[0]),
    [rawBetHorses]
  );

  const canBet = !user || user.role === 'USER';
  const NON_BETTABLE = new Set(['FINISHED', 'CANCELLED', 'ONGOING']);
  const raceIsBettable = !selectedRace || !NON_BETTABLE.has(selectedRace.status);
  const betReady = !!selectedRace && raceIsBettable && betHorses.length > 0;

  return (
    <div className="min-h-screen bg-surface">
      <Seo title="Race Schedule" description="Browse upcoming and past horse races on Royal Derby." />

      <Container className="py-8">
        {loading ? (
          <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">

            {/* ── LEFT: Race info + entries ────────────────────── */}
            <div>
              {!selectedDate ? (
                /* No date selected */
                <div className="flex flex-col items-center justify-center gap-4 border border-rim bg-surface-raised py-24 text-center">
                  <Calendar size={40} className="text-ink-4" strokeWidth={1.5} />
                  <div>
                    <p className="font-semibold text-ink">Select a race day</p>
                    <p className="mt-1 text-sm text-ink-3">Choose a highlighted date from the calendar to view races.</p>
                  </div>
                </div>
              ) : racesOnDay.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 border border-rim bg-surface-raised py-24 text-center">
                  <Flag size={32} className="text-ink-4" strokeWidth={1.5} />
                  <p className="text-sm text-ink-3">No races scheduled on this day.</p>
                </div>
              ) : (
                <div>
                  {/* Race tabs (if multiple races same day) */}
                  {racesOnDay.length > 1 && (
                    <div className="mb-5 flex gap-1 overflow-x-auto">
                      {racesOnDay.map((r, i) => (
                        <button key={r.id} onClick={() => setSelectedRaceIdx(i)}
                          className={`shrink-0 px-4 py-2 text-sm font-semibold transition-colors ${
                            i === selectedRaceIdx
                              ? 'bg-navy text-on-blue'
                              : 'border border-rim text-ink-3 hover:border-navy hover:text-navy'
                          }`}>
                          Race {i + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Race detail */}
                  {selectedRace && <RaceDetailPanel raceId={selectedRace.id} />}
                </div>
              )}
            </div>

            {/* ── RIGHT: Sidebar — single card with gold accents ── */}
            <div className="self-start sticky top-8">
              <div className="overflow-hidden rounded-md border border-rim">
                {/* Gold top accent */}
                <div className="h-1 bg-gradient-to-r from-gold via-gold-hi to-gold" />
                {/* Navy header + diagonal pattern */}
                <div className="relative overflow-hidden bg-navy px-5 py-4">
                  <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(168,132,59,0.06) 12px, rgba(168,132,59,0.06) 13px)" }} />
                  <p className="relative text-[10px] font-semibold uppercase tracking-widest text-on-blue/40">Racing Information For</p>
                  <p className="relative font-serif text-lg font-bold text-on-blue">Royal Derby.</p>
                </div>

                {/* Gold divider with label */}
                <div className="flex items-center gap-3 border-b border-rim bg-surface-raised px-5 py-2">
                  <div className="h-px flex-1 bg-gold/30" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Select Date</span>
                  <div className="h-px flex-1 bg-gold/30" />
                </div>
                {/* Calendar */}
                <MiniCalendar raceDates={raceDates} selected={selectedDate} onSelect={handleSelectDate} />
                {/* Action buttons */}
                <div className="border-t border-rim">
                  <Link to="/results"
                    className="flex w-full items-center justify-center border-b border-rim bg-navy py-3.5 text-xs font-bold uppercase tracking-widest text-on-blue hover:bg-navy-hi transition-colors">
                    Results &amp; Replays
                  </Link>
                  {bettingMode ? (
                    canBet && (
                      !user ? (
                        <Link to="/login"
                          className="flex w-full items-center justify-center gap-1.5 bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-on-gold hover:bg-gold-hi transition-colors">
                          <Ticket size={13} /> Sign In To Bet
                        </Link>
                      ) : (
                        <button type="button" disabled={!betReady} onClick={() => setShowBet(true)}
                          className="flex w-full items-center justify-center gap-1.5 bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-on-gold transition-colors hover:bg-gold-hi disabled:cursor-not-allowed disabled:bg-rim disabled:text-ink-4">
                          <Ticket size={13} />
                          {betReady
                            ? 'Bet Now'
                            : selectedRace && NON_BETTABLE.has(selectedRace.status)
                              ? 'Betting Closed'
                              : 'No Entries To Bet'}
                        </button>
                      )
                    )
                  ) : (
                    <Link to="/bet"
                      className="flex w-full items-center justify-center gap-1.5 bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-on-gold hover:bg-gold-hi transition-colors">
                      <Ticket size={13} /> Bet Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>

      {/* ── Full-width results section — below grid ─────── */}
      {!loading && selectedRace?.status === 'FINISHED' && (
        <RaceResultsSection raceId={selectedRace.id} />
      )}

      {bettingMode && selectedRace && (
        <PlaceBetModal
          open={showBet}
          onClose={() => setShowBet(false)}
          race={selectedRace}
          raceHorses={betHorses}
          onSuccess={() => addToast('Bet placed successfully!', 'success')}
        />
      )}
    </div>
  );
}
