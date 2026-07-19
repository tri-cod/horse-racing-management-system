import { useEffect, useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { getHorsesByRace, setRaceResult } from '@/api/refereeApi';
import { assignLanes } from '@/utils/laneUtils';
import { getErrorMessage } from '@/utils/errors';
import { isStatus } from '@/utils/raceHorseStatus';
import Modal from '@/components/ui/Modal';
import type { Race, RaceHorse } from '@/types';

interface Times { [raceHorseId: number]: string }

interface SetResultModalProps {
  race: Race;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SetResultModal({ race, onClose, onSuccess }: SetResultModalProps) {
  const [horses, setHorses] = useState<RaceHorse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [times, setTimes] = useState<Times>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getHorsesByRace(race.id);
        // Backend only accepts results for APPROVED entries — a horse that was withdrawn,
        // rejected, or disqualified isn't racing, so don't ask the referee to time it.
        const approved = (data ?? []).filter((rh) => isStatus(rh.status, 'APPROVED'));
        setHorses(assignLanes(approved) as RaceHorse[]);
        const init: Times = {};
        approved.forEach((rh) => { init[rh.id] = ''; });
        setTimes(init);
      } catch { setError('Unable to load horse list.'); }
      finally { setLoading(false); }
    })();
  }, [race.id]);

  const setTime = (id: number, value: string) =>
    setTimes((prev) => ({ ...prev, [id]: value }));

  // Rank is derived live from completion time — fastest (lowest) time = rank 1.
  // Ties keep the horses' original list order relative to each other.
  const ranks = useMemo(() => {
    const withTime = horses
      .map((rh) => ({ id: rh.id, seconds: Number(times[rh.id]) }))
      .filter((h) => times[h.id] !== '' && !isNaN(h.seconds) && h.seconds > 0)
      .sort((a, b) => a.seconds - b.seconds);
    const map: { [raceHorseId: number]: number } = {};
    withTime.forEach((h, i) => { map[h.id] = i + 1; });
    return map;
  }, [horses, times]);

  const validate = () => {
    const missing = horses.some((rh) => {
      const v = times[rh.id];
      return v === '' || v === undefined || isNaN(Number(v)) || Number(v) <= 0;
    });
    if (missing) return 'Please enter a valid completion time for every horse.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSubmitting(true); setError(null);
    try {
      await setRaceResult({
        raceId: race.id,
        results: horses.map((rh) => ({
          raceHorseId: rh.id,
          rank: ranks[rh.id],
          completionTimeSeconds: Number(times[rh.id]),
        })),
      });
      onSuccess();
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to save results.'));
    } finally { setSubmitting(false); }
  };

  const inputCls =
    'w-full border border-rim bg-surface-input px-3 py-1.5 text-sm text-ink outline-none ' +
    'placeholder:text-ink-4 focus:border-navy focus:ring-1 focus:ring-navy/10 transition-colors';

  const header = (
    <div>
      <div className="flex items-center gap-2">
        <Trophy size={14} className="text-gold" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Race Result</p>
      </div>
      <h2 className="mt-0.5 font-serif text-xl font-bold text-ink">{race.raceName}</h2>
    </div>
  );

  const footer = !loading && horses.length > 0 && (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="px-5 py-2 text-sm font-medium text-ink-3 transition-colors hover:text-ink disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-navy px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-blue transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Saving…' : 'Save Results'}
      </button>
    </div>
  );

  return (
    <Modal open onClose={onClose} title={header} backdrop="navy" size="xl" bodyClassName="px-6 py-5" footer={footer || undefined}>
      {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 py-2">
                  <div className="h-8 w-10 animate-pulse rounded bg-surface-overlay" />
                  <div className="h-8 flex-1 animate-pulse rounded bg-surface-overlay" />
                  <div className="h-8 w-32 animate-pulse rounded bg-surface-overlay" />
                  <div className="h-8 w-24 animate-pulse rounded bg-surface-overlay" />
                </div>
              ))}
            </div>
          ) : horses.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-3">No horses registered for this race.</p>
          ) : (
            <>
              <p className="mb-4 text-sm text-ink-3">
                Enter each horse&apos;s completion time — rank is calculated automatically (fastest time = 1st place).
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-rim bg-surface-overlay">
                      {['Lane', 'Horse', 'Jockey', 'Time (sec) *', 'Rank'].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rim">
                    {horses.map((rh) => (
                      <tr key={rh.id} className="transition-colors hover:bg-surface-overlay/30">
                        <td className="px-3 py-2.5">
                          <span className="tnum inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy/10 text-xs font-bold text-navy">
                            {rh.laneNumber ?? '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-sm font-semibold text-ink">{rh.horseName ?? '—'}</td>
                        <td className="px-3 py-2.5 text-sm text-ink-3">{rh.jockeyName ?? '—'}</td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="e.g. 92.45"
                            value={times[rh.id] ?? ''}
                            onChange={(e) => setTime(rh.id, e.target.value)}
                            className={`${inputCls} w-28`}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          {ranks[rh.id] ? (
                            <span className={`tnum inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              ranks[rh.id] === 1 ? 'bg-gold text-on-gold' : 'bg-surface-overlay text-ink-3'
                            }`}>
                              {ranks[rh.id]}
                            </span>
                          ) : (
                            <span className="text-xs text-ink-4">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
              {error}
            </div>
          )}
    </Modal>
  );
}
