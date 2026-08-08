import { useEffect, useState } from 'react';
import { X, Scale, RefreshCw, Sparkles, Info } from 'lucide-react';
import { setRaceHandicap } from '@/api/refereeApi';
import { useRaceHandicap } from '@/hooks/useRaceHandicap';
import { getErrorMessage } from '@/utils/errors';
import Button from '@/components/ui/Button';
import type { Race } from '@/types';

interface HandicapModalProps {
  race: Race;
  onClose: () => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

// Ngựa yếu nhất (speedRating thấp nhất trong race) luôn có handicap = 0 — là mốc chuẩn,
// không bị "chấp" gì cả. Các ngựa mạnh hơn chấp thêm giây tương ứng.
export default function HandicapModal({ race, onClose, onToast }: HandicapModalProps) {
  const { handicap, loading, error, refetch } = useRaceHandicap(race.id);
  const [values, setValues] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  // Nạp lại form mỗi khi data mới về (mở modal / refetch sau khi lưu)
  useEffect(() => {
    if (!handicap) return;
    const init: Record<number, string> = {};
    handicap.horses.forEach((h) => { init[h.raceHorseId] = String(h.handicapSeconds ?? 0); });
    setValues(init);
  }, [handicap]);

  const setValue = (raceHorseId: number, value: string) =>
    setValues((prev) => ({ ...prev, [raceHorseId]: value }));

  const applyAllSuggested = () => {
    if (!handicap) return;
    const next: Record<number, string> = {};
    handicap.horses.forEach((h) => { next[h.raceHorseId] = String(h.suggestedHandicapSeconds ?? 0); });
    setValues(next);
  };

  const applySuggested = (raceHorseId: number, suggested: number) =>
    setValue(raceHorseId, String(suggested ?? 0));

  const handleSave = async () => {
    if (!handicap) return;
    setSaving(true);
    try {
      await setRaceHandicap({
        raceId: race.id,
        handicaps: handicap.horses.map((h) => ({
          raceHorseId: h.raceHorseId,
          handicapSeconds: Number(values[h.raceHorseId]) || 0,
        })),
      });
      onToast('Handicap saved!', 'success');
      refetch();
    } catch (e: unknown) {
      onToast(getErrorMessage(e, 'Failed to save handicap.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-24 border border-rim bg-surface px-2 py-1.5 text-sm text-ink text-right tnum outline-none focus:border-gold/50 disabled:opacity-50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-rim bg-surface-raised"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-rim bg-surface-raised px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Race Control</p>
            <h2 className="font-serif text-lg font-bold text-ink">Handicap</h2>
            <p className="mt-0.5 text-xs text-ink-3">{race.raceName}</p>
          </div>
          <button type="button" onClick={onClose} className="text-ink-4 transition-colors hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {loading && (
            <div className="flex items-center gap-2 py-8 text-sm text-ink-3">
              <RefreshCw size={14} className="animate-spin" /> Loading…
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-between gap-3 border border-fail/30 bg-fail-subtle px-4 py-3 text-sm text-fail">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
            </div>
          )}

          {!loading && !error && handicap && (
            <>
              <div className="flex items-start gap-2 border border-rim bg-surface-overlay/50 px-4 py-3 text-xs text-ink-3">
                <Info size={14} className="mt-0.5 shrink-0 text-ink-4" />
                <span>
                  Horses with a higher Speed Rating give up time to weaker horses so the race stays fair.
                  The weakest horse in this race is the baseline (0s). Adjust any value by hand if needed.
                </span>
              </div>

              {!handicap.editable && (
                <div className="border border-warn/30 bg-warn-subtle px-4 py-3 text-sm font-semibold text-warn">
                  This race is {handicap.raceStatus} — handicap can only be edited while OPEN_BETTING.
                </div>
              )}

              {handicap.editable && (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={applyAllSuggested}>
                    <Sparkles size={12} /> Apply All Suggested
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {handicap.horses.map((h) => (
                  <div
                    key={h.raceHorseId}
                    className="flex flex-wrap items-center gap-3 border border-rim px-4 py-3"
                  >
                    {h.horseAvatarUrl ? (
                      <img
                        src={h.horseAvatarUrl}
                        alt={h.horseName}
                        className="h-11 w-11 shrink-0 rounded border border-rim object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-rim bg-surface-overlay font-serif text-sm font-bold text-ink-4">
                        {h.horseName?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink">{h.horseName}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-3">
                        {h.breed && <span>{h.breed}</span>}
                        {h.speedRating != null && (
                          <span className="font-semibold text-gold">Speed {h.speedRating}</span>
                        )}
                        <span>Jockey: {h.jockeyName ?? '—'}</span>
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-4">Suggested</p>
                        <button
                          type="button"
                          disabled={!handicap.editable}
                          onClick={() => applySuggested(h.raceHorseId, h.suggestedHandicapSeconds)}
                          className="tnum text-sm font-semibold text-ink-2 underline decoration-dotted underline-offset-2 transition-colors hover:text-gold-hi disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
                          title="Click to use this value"
                        >
                          +{(h.suggestedHandicapSeconds ?? 0).toFixed(2)}s
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-4">Handicap (s)</p>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="120"
                          disabled={!handicap.editable}
                          className={field}
                          value={values[h.raceHorseId] ?? '0'}
                          onChange={(e) => setValue(h.raceHorseId, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {handicap.horses.length === 0 && (
                  <p className="py-4 text-center text-xs text-ink-4">No approved horses to handicap.</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-rim px-5 py-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {handicap?.editable && (
            <Button onClick={handleSave} disabled={saving || handicap.horses.length === 0}>
              <Scale size={14} /> {saving ? 'Saving…' : 'Save Handicap'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
