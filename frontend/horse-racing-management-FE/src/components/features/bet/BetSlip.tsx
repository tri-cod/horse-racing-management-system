import { Link } from 'react-router-dom';
import { AlertCircle, X, Ticket } from 'lucide-react';
import type { Race } from '@/types';
import { NON_BETTABLE, fmtVnd, type HorseEntry, type Selection } from './betHelpers';

/* ── Bet Slip Panel ─────────────────────────────────────────────
   Right panel: dynamic list of horses with entered amounts.
   Shows a different message for each "can't bet" situation
   (guest, wrong role, no race selected, betting closed, no entries). */
export default function BetSlip({
  user, canBet, selectedRace, betHorses, selections, betTotal,
  betError, betLoading, onRemove, onClearAll, onSubmit,
}: {
  user: { role: string } | null;
  canBet: boolean;
  selectedRace: Race | null;
  betHorses: HorseEntry[];
  selections: Selection[];
  betTotal: number;
  betError: string;
  betLoading: boolean;
  onRemove: (id: number) => void;
  onClearAll: () => void;
  onSubmit: () => void;
}) {
  if (!user) return (
    <div className="overflow-hidden rounded-md border border-rim bg-surface-raised p-5">
      <p className="mb-4 text-sm text-ink-3">Sign in to place wagers on your favourite runners.</p>
      <Link to="/login"
        className="flex w-full items-center justify-center gap-2 bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-on-gold transition-all active:scale-[0.98] hover:bg-gold-hi">
        <Ticket size={14} /> Sign In to Bet
      </Link>
    </div>
  );

  if (!canBet) return (
    <div className="rounded-md border border-rim bg-surface-raised p-5">
      <div className="flex items-start gap-3">
        <AlertCircle size={15} className="mt-0.5 shrink-0 text-ink-4" strokeWidth={1.5} />
        <p className="text-sm text-ink-3">Betting is available for USER accounts only.</p>
      </div>
    </div>
  );

  if (!selectedRace) return (
    <div className="rounded-md border border-rim bg-surface-raised p-5">
      <p className="text-center text-sm text-ink-3">Select a race above to start betting.</p>
    </div>
  );

  if (NON_BETTABLE.has(selectedRace.status)) return (
    <div className="rounded-md border border-rim bg-surface-raised p-5">
      <div className="flex items-start gap-3">
        <AlertCircle size={15} className="mt-0.5 shrink-0 text-ink-4" strokeWidth={1.5} />
        <div>
          <p className="text-sm font-semibold text-ink-2">Betting Closed</p>
          <p className="mt-0.5 text-xs text-ink-4">This race is no longer accepting wagers.</p>
        </div>
      </div>
    </div>
  );

  if (betHorses.length === 0) return (
    <div className="rounded-md border border-rim bg-surface-raised p-5">
      <div className="flex items-start gap-3">
        <AlertCircle size={15} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} />
        <p className="text-sm text-ink-3">No confirmed entries yet. Odds will appear closer to post time.</p>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rim px-5 py-3.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-hi">Bet Slip</p>
          <p className="mt-0.5 text-xs text-ink-3">
            {selections.length === 0
              ? 'Enter a stake beside any runner'
              : `${selections.length} runner${selections.length !== 1 ? 's' : ''} selected`}
          </p>
        </div>
        {selections.length > 0 && (
          <button type="button" onClick={onClearAll}
            className="text-[10px] font-semibold uppercase tracking-wide text-ink-4 transition-colors hover:text-fail">
            Clear all
          </button>
        )}
      </div>

      {selections.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rim bg-surface-overlay">
            <Ticket size={18} className="text-ink-4" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-ink-3 leading-relaxed">
            Type a stake amount next to any runner on the left to add them here.
          </p>
        </div>
      ) : (
        <>
          {/* Selection cards */}
          <div className="divide-y divide-rim">
            {selections.map(({ horse, amount, payout }) => (
              <div key={horse.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-sm font-bold uppercase tracking-wide text-ink">
                      {horse.horseName}
                    </span>
                    <span className="shrink-0 tnum text-xs font-bold text-gold-hi">×{horse.odds}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <span className="tnum text-ink-3">{fmtVnd(amount)}</span>
                    <span className="text-ink-4">→</span>
                    <span className="tnum font-semibold text-gold-hi">{fmtVnd(payout)}</span>
                  </div>
                </div>
                <button type="button" onClick={() => onRemove(horse.id)}
                  className="mt-0.5 shrink-0 text-ink-4 transition-colors hover:text-fail">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-rim bg-surface-overlay/60 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-3">Total wagered</span>
              <span className="tnum font-bold text-ink">{fmtVnd(betTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-3">Max payout</span>
              <span className="tnum font-bold text-gold-hi">
                {fmtVnd(selections.reduce((s, s2) => s + s2.payout, 0))}
              </span>
            </div>

            {betError && (
              <div className="flex items-center gap-2 rounded bg-fail-subtle px-3 py-2 text-xs text-fail">
                <AlertCircle size={13} className="shrink-0" /> {betError}
              </div>
            )}

            <button
              type="button"
              onClick={onSubmit}
              disabled={betLoading || betTotal < 1000}
              className="flex w-full items-center justify-center gap-2 bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-on-gold transition-all hover:bg-gold-hi active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-rim disabled:text-ink-4">
              <Ticket size={14} />
              {betLoading ? 'Processing…' : 'Confirm Bet'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
