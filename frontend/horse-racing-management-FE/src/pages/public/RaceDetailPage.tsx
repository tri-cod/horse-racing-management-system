import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Flag, Ticket } from 'lucide-react';
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
import Button from '@/components/ui/Button';
import { assignLanes } from '@/utils/laneUtils';

const NON_BETTABLE = new Set(['FINISHED', 'CANCELLED', 'ONGOING']);

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

function fmtPrize(n?: number) {
  if (!n) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function PosBadge({ pos }: { pos: number }) {
  const gold = 'bg-gold text-on-gold';
  const silver = 'bg-on-blue/20 text-on-blue/70';
  const bronze = 'bg-amber-700/40 text-amber-300';
  const muted = 'bg-on-blue/10 text-on-blue/35';
  const cls = pos === 1 ? gold : pos === 2 ? silver : pos === 3 ? bronze : muted;
  return (
    <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${cls}`}>
      {pos}
    </span>
  );
}

function FinishedResults({ results }: { results: NormalizedRaceResult[] }) {
  return (
    <div className="bg-navy py-14">
      <Container>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/60">Race Results</p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-on-blue sm:text-4xl">Final Standings</h2>
          </div>
        </div>

        {results.length === 0 ? (
          <p className="text-sm text-on-blue/35">Official results not yet published.</p>
        ) : (
          <div className="overflow-hidden rounded-sm border border-on-blue/10">
            <div className="grid grid-cols-[2.5rem_1fr_1fr_auto] gap-4 border-b border-on-blue/10 bg-on-blue/5 px-5 py-2.5 sm:grid-cols-[2.5rem_1fr_1fr_1fr_auto]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-blue/35">Pos.</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-blue/35">Horse</span>
              <span className="hidden text-[10px] font-bold uppercase tracking-widest text-on-blue/35 sm:block">Jockey</span>
              <span className="hidden text-[10px] font-bold uppercase tracking-widest text-on-blue/35 sm:block">Time</span>
              <span className="text-right text-[10px] font-bold uppercase tracking-widest text-on-blue/35">Odds</span>
            </div>

            <div className="divide-y divide-on-blue/[0.07]">
              {results.map((r) => {
                const isFirst = r.position === 1;
                return (
                  <div key={r.id}
                    className={`grid grid-cols-[2.5rem_1fr_1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-on-blue/[0.05] sm:grid-cols-[2.5rem_1fr_1fr_1fr_auto] ${isFirst ? 'bg-gold/[0.04]' : ''}`}>
                    <PosBadge pos={r.position} />
                    <div>
                      <p className={`font-semibold leading-tight ${isFirst ? 'text-gold' : 'text-on-blue'}`}>
                        {r.horseName}
                      </p>
                      <p className="mt-0.5 text-xs text-on-blue/40 sm:hidden">{r.jockeyName}</p>
                    </div>
                    <span className="hidden text-sm text-on-blue/55 sm:block">{r.jockeyName}</span>
                    <span className="hidden tnum text-sm text-on-blue/35 sm:block">{r.time ?? '—'}</span>
                    <span className={`tnum text-right text-sm font-semibold ${isFirst ? 'text-gold' : r.odds != null ? 'text-on-blue/70' : 'text-on-blue/25'}`}>
                      {r.odds != null ? `×${Number(r.odds).toFixed(2)}` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

function RaceResultsSection({ raceId }: { raceId: number }) {
  const { results, loading } = useRaceResults(raceId);
  if (loading) return (
    <div className="flex items-center justify-center gap-2 bg-navy py-16 text-sm text-on-blue/40">
      <LoadingSpinner size="sm" /> Loading results…
    </div>
  );
  return <FinishedResults results={results} />;
}

export default function RaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const raceId = id ? Number(id) : undefined;
  const { user } = useAuth();
  const addToast = useToast();
  const [showBet, setShowBet] = useState(false);

  const { race, loading, error, refetch } = useRaceDetail(raceId);
  const { entries: raw, loading: entriesLoading } = useHorsesByRace(raceId);

  const entries = useMemo(() =>
    assignLanes(raw.filter((e) =>
      e.status?.toLowerCase() === 'approved' 
    ) as Parameters<typeof assignLanes>[0])
      .sort((a, b) => (a.odds ?? Infinity) - (b.odds ?? Infinity)),
    [raw]
  );
const bettableEntries = useMemo(() => entries.filter((e) => e.odds != null), [entries]);


  const canBet = user?.role === 'USER';
  const bettable = !!race && !NON_BETTABLE.has(race.status);
  const betReady = bettable && entries.length > 0;

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error) return (
    <Container className="py-24 text-center">
      <p className="text-sm text-ink-3">{error}</p>
      <Button variant="outline" className="mt-4" onClick={() => refetch()}>Try Again</Button>
    </Container>
  );

  if (!race) return (
    <Container className="py-24 text-center">
      <Flag size={32} className="mx-auto mb-3 text-ink-4" strokeWidth={1.5} />
      <p className="text-sm text-ink-3">Race not found.</p>
      <Link to="/races" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold">
        <ChevronLeft size={14} /> Back to Races
      </Link>
    </Container>
  );

  return (
    <div className="min-h-screen bg-surface">
      <Seo title={race.raceName} description={`${race.raceName} — ${race.location ?? 'Royal Derby'}`} type="article" />

      <Container className="py-8">
        <Link to="/races" className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3 hover:text-navy transition-colors">
          <ChevronLeft size={14} /> Back to Races
        </Link>

        <div className="overflow-hidden rounded-md border border-rim">
          {/* Banner */}
          <div className="relative h-56 overflow-hidden sm:h-72">
            {race.bannerImageurl
              ? <img src={race.bannerImageurl} alt={race.raceName} className="h-full w-full object-cover" />
              : <div className="h-full w-full bg-navy" />}
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
            <div className="absolute left-4 top-4">
              <RaceStatusBadge race={race} size="md" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-5 py-5">
              <h1 className="font-serif text-2xl font-bold uppercase text-on-blue sm:text-3xl">
                {race.raceName}
              </h1>
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

            {/* Bet CTA */}
            <div className="mt-4 flex items-center gap-3">
              {!user ? (
                <Link to="/login"
                  className="inline-flex items-center gap-1.5 bg-gold px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-gold transition-colors hover:bg-gold-hi">
                  <Ticket size={13} /> Sign In to Bet
                </Link>
              ) : canBet ? (
                <button type="button" disabled={!betReady} onClick={() => setShowBet(true)}
                  className="inline-flex items-center gap-1.5 bg-gold px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-gold transition-colors hover:bg-gold-hi disabled:cursor-not-allowed disabled:bg-rim disabled:text-ink-4">
                  <Ticket size={13} />
                  {betReady ? 'Place Bet' : bettable ? 'No Entries To Bet' : 'Betting Closed'}
                </button>
              ) : null}
            </div>
          </div>

          {/* Entries table */}
          {entriesLoading ? (
            <div className="flex justify-center bg-surface-raised py-12"><LoadingSpinner /></div>
          ) : entries.length === 0 ? (
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
                    <td className="py-4 pl-5 align-top">
                      <span className="tnum text-sm font-medium text-ink-4">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="py-4 pl-3 align-top">
                      <div className={`inline-flex h-10 w-10 items-center justify-center text-base font-bold ${laneClr(e.laneNumber ?? undefined)}`}>
                        {e.laneNumber ?? '—'}
                      </div>
                    </td>
                    <td className="py-4 pl-3 align-top">
                      <p className="text-base font-bold uppercase leading-tight tracking-wide text-ink">
                        {e.horseName}
                      </p>
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-ink-4">
                        Jockey: {e.jockeyName ?? '—'}
                      </p>
                    </td>
                    <td className="py-4 pr-5 text-right align-top">
                      <span className="tnum text-base font-bold text-ink">{e.odds}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Container>

      {race.status === 'FINISHED' && <RaceResultsSection raceId={race.id} />}

      {canBet && (
        <PlaceBetModal
          open={showBet}
          onClose={() => setShowBet(false)}
          race={race}
          raceHorses={bettableEntries}
          onSuccess={() => addToast('Bet placed successfully!', 'success')}
        />
      )}
    </div>
  );
}
