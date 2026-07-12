import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { getHorsesByRace, setRaceResult } from '@/api/refereeApi';
import { assignLanes } from '@/utils/laneUtils';
import { getErrorMessage } from '@/utils/errors';
import Modal from '@/components/ui/Modal';
import type { Race, RaceHorse } from '@/types';

interface Ranks { [raceHorseId: number]: { rank: string; completionTimeSeconds: string } }

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
  const [ranks, setRanks] = useState<Ranks>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getHorsesByRace(race.id);
        setHorses(assignLanes(data ?? []) as RaceHorse[]);
        const init: Ranks = {};
        (data ?? []).forEach((rh) => { init[rh.id] = { rank: '', completionTimeSeconds: '' }; });
        setRanks(init);
      } catch { setError('Unable to load horse list.'); }
      finally { setLoading(false); }
    })();
  }, [race.id]);

  const setField = (id: number, field: 'rank' | 'completionTimeSeconds', value: string) =>
    setRanks((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const validate = () => {
    const vals = horses.map((rh) => Number(ranks[rh.id]?.rank));
    if (vals.some((r) => !r || r < 1)) return 'Please enter a rank for every horse.';
    if (new Set(vals).size !== vals.length) return 'Ranks must be unique.';
    if (vals.some((r) => r > horses.length)) return `Rank must be between 1 and ${horses.length}.`;
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
          rank: Number(ranks[rh.id].rank),
          completionTimeSeconds: ranks[rh.id].completionTimeSeconds
            ? Number(ranks[rh.id].completionTimeSeconds)
            : null,
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
                Enter rank (1 = 1st place) and completion time for each horse.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-rim bg-surface-overlay">
                      {['Lane', 'Horse', 'Jockey', 'Rank *', 'Time'].map((h) => (
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
                            min={1}
                            max={horses.length}
                            placeholder="1"
                            value={ranks[rh.id]?.rank ?? ''}
                            onChange={(e) => setField(rh.id, 'rank', e.target.value)}
                            className={`${inputCls} w-16 text-center`}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="e.g. 92.45"
                            value={ranks[rh.id]?.completionTimeSeconds ?? ''}
                            onChange={(e) => setField(rh.id, 'completionTimeSeconds', e.target.value)}
                            className={`${inputCls} w-28`}
                          />
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
