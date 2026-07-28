import { useState, useEffect } from 'react';
import type { Race } from '@/types';
import { fmtDate, fmtTime, fmtCountdown } from './betHelpers';

/* Re-render on the minute so the countdown never goes stale while someone sits
   on the board. A minute is fine granularity for a label that reads "2h 15m",
   and it avoids putting a per-second timer behind every card in the strip. */
function useMinuteTick() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/* ── Race Selector Card ────────────────────────────────────────────
   One card in the horizontal race strip at the top of the board.
   Post time and time-to-post carry the weight here: they are what decides
   which race someone bets on next. The name identifies it, the date only
   confirms it. Clicking selects the race. */
export default function RaceSelectorCard({ race, selected, onClick }: {
  race: Race;
  selected: boolean;
  onClick: () => void;
}) {
  const now = useMinuteTick();
  const countdown = fmtCountdown(race.startTime, now);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex w-56 shrink-0 flex-col gap-3 rounded-md border-2 p-4 text-left transition-all duration-200 active:scale-[0.98] ${
        selected
          ? 'border-gold bg-gold/10 shadow-lg shadow-gold/20'
          : 'border-rim bg-surface-raised shadow-card hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md'
      }`}
    >
      {/* Post time leads the card: it is the first thing scanned when picking a race. */}
      <span className="tnum text-lg font-bold leading-none text-ink">{fmtTime(race.startTime)}</span>

      <p className={`line-clamp-2 font-serif text-base font-bold leading-snug transition-colors ${
        selected ? 'text-gold-hi' : 'text-ink group-hover:text-gold-hi'
      }`}>
        {race.raceName}
      </p>

      {/* Pushed to the bottom so cards of differing name lengths still line up. */}
      <div className="mt-auto space-y-1">
        <p className="tnum text-[11px] text-ink-4">
          {fmtDate(race.startTime)}
          {race.distance ? <span className="mx-1.5 text-rim-hi">·</span> : null}
          {race.distance}
        </p>
        {countdown && (
          <p className="text-[11px] font-semibold text-gold-hi">{countdown}</p>
        )}
      </div>
    </button>
  );
}
