import type { Race } from '@/types';
import { NON_BETTABLE, fmtDate } from './betHelpers';

/* ── Race Selector Card ────────────────────────────────────────────
   One card in the horizontal race strip at the top of the board.
   Clicking it selects that race; the gold top bar marks bettable races. */
export default function RaceSelectorCard({ race, selected, onClick }: {
  race: Race;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`group relative shrink-0 w-52 overflow-hidden rounded-md text-left transition-all duration-200 active:scale-[0.98] ${
        selected
          ? 'bg-gold/5 shadow-lg shadow-gold/15'
          : 'bg-surface-raised shadow-card hover:bg-surface-overlay/60 hover:shadow-md'
      }`}>
      <div className={`h-0.5 w-full ${!NON_BETTABLE.has(race.status) ? 'bg-gold' : 'bg-rim'}`} />
      <div className="p-3.5">
        <p className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-ink group-hover:text-gold transition-colors">
          {race.raceName}
        </p>
        <p className="flex items-center gap-2 text-[11px] tabular-nums text-ink-4">
          {fmtDate(race.startTime)}
          {race.status === 'FINISHED' && (
            <span className="text-[9px] font-semibold uppercase tracking-wide text-ink-3">Finished</span>
          )}
        </p>
      </div>
    </button>
  );
}
