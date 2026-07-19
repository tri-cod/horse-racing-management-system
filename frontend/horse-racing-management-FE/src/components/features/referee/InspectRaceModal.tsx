import { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw, Flag } from 'lucide-react';
import { reportInspectionIssue, verifyHorse } from '@/api/refereeApi';
import { useRaceInspection } from '@/hooks/useRaceInspection';
import { getErrorMessage } from '@/utils/errors';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { InspectionIssueType, Race } from '@/types';

const ISSUE_TYPES: { value: InspectionIssueType; label: string }[] = [
  { value: 'WRONG_HORSE', label: 'Wrong Horse (disqualifies)' },
  { value: 'HORSE_UNFIT', label: 'Horse Unfit (disqualifies)' },
  { value: 'WRONG_JOCKEY', label: 'Wrong Jockey (warning)' },
  { value: 'EQUIPMENT_ISSUE', label: 'Equipment Issue (warning)' },
];

export default function InspectRaceModal({
  race,
  onClose,
  onToast,
  onStartRace,
}: {
  race: Race;
  onClose: () => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
  /** Only passed while the race is OPEN_BETTING — lets the referee start right after a clean inspection. */
  onStartRace?: (raceId: number) => Promise<void>;
}) {
  const { inspection, loading, error, refetch } = useRaceInspection(race.id);
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [issueType, setIssueType] = useState<InspectionIssueType>('WRONG_JOCKEY');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [verifyingAll, setVerifyingAll] = useState(false);

  const handleVerify = async (raceHorseId: number, verified: boolean) => {
    setVerifyingId(raceHorseId);
    try {
      await verifyHorse({ raceHorseId, verified });
      refetch();
    } catch (e: unknown) {
      onToast(getErrorMessage(e, 'Failed to update verification.'), 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  // Only bulk-ticks horses with nothing wrong besides "hasn't been looked at yet" —
  // a horse with a real automated warning (no jockey, missing odds, ...) still needs
  // the referee's eyes on it individually, so it's excluded from the bulk action.
  const checkableHorses = (inspection?.horses ?? []).filter(
    (h) => !h.verified && !h.reported && h.warnings.every((w) => w.includes('Not yet checked')),
  );

  const handleVerifyAll = async () => {
    if (checkableHorses.length === 0) return;
    setVerifyingAll(true);
    try {
      await Promise.all(checkableHorses.map((h) => verifyHorse({ raceHorseId: h.raceHorseId, verified: true })));
      onToast(`Marked ${checkableHorses.length} horse(s) OK.`, 'success');
      refetch();
    } catch (e: unknown) {
      onToast(getErrorMessage(e, 'Failed to check all horses.'), 'error');
    } finally {
      setVerifyingAll(false);
    }
  };

  const handleStart = async () => {
    if (!onStartRace) return;
    setStarting(true);
    try {
      await onStartRace(race.id);
      onClose();
    } catch {
      // Parent already surfaced the error via toast — just keep the modal open to retry.
    } finally {
      setStarting(false);
    }
  };

  const startReport = (raceHorseId: number) => {
    setReportingId(raceHorseId);
    setIssueType('WRONG_JOCKEY');
    setDescription('');
  };

  const submitReport = async () => {
    if (reportingId == null || !description.trim()) return;
    setSaving(true);
    try {
      await reportInspectionIssue({
        raceHorseId: reportingId,
        issueType,
        description: description.trim(),
      });
      onToast('Issue reported.', 'success');
      setReportingId(null);
      refetch();
    } catch (e: unknown) {
      onToast(getErrorMessage(e, 'Failed to report issue.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full border border-rim bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold/50 disabled:opacity-50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-rim bg-surface-raised"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-rim bg-surface-raised px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Race Control</p>
            <h2 className="font-serif text-lg font-bold text-ink">Pre-race Inspection</h2>
            <p className="mt-0.5 text-xs text-ink-3">{race.raceName}</p>
          </div>
          <button type="button" onClick={onClose} className="text-ink-4 transition-colors hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {loading && (
            <div className="flex items-center gap-2 py-8 text-sm text-ink-3">
              <RefreshCw size={14} className="animate-spin" /> Inspecting…
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-between gap-3 border border-fail/30 bg-fail-subtle px-4 py-3 text-sm text-fail">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
            </div>
          )}

          {!loading && !error && inspection && (
            <>
              {/* Ready is calm green; not-ready-yet is a routine amber "in progress" tone,
                  not a red alarm — it's the normal state while checks are still pending. */}
              <div
                className={`flex flex-wrap items-center justify-between gap-3 border px-4 py-3 text-sm font-semibold ${
                  inspection.readyToRace
                    ? 'border-ok/30 bg-ok-subtle text-ok'
                    : 'border-warn/30 bg-warn-subtle text-warn'
                }`}
              >
                <span className="flex items-center gap-2">
                  {inspection.readyToRace ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {inspection.readyToRace ? 'Ready to race — no issues found.' : `${inspection.issues.length} horse(s) still need checking.`}
                </span>
                {checkableHorses.length > 0 && (
                  <Button size="sm" disabled={verifyingAll} onClick={handleVerifyAll}>
                    {verifyingAll ? 'Checking…' : `Check All (${checkableHorses.length})`}
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {inspection.horses.map((h) => (
                  <div key={h.raceHorseId} className="border border-rim px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        {h.horseAvatarUrl ? (
                          <img
                            src={h.horseAvatarUrl}
                            alt={h.horseName}
                            className="h-14 w-14 shrink-0 rounded border border-rim object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-rim bg-surface-overlay font-serif text-sm font-bold text-ink-4">
                            {h.horseName?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-ink">{h.horseName}</p>
                            {h.verified && (
                              <Badge variant="ocean" size="sm">
                                <CheckCircle2 size={10} /> Verified
                              </Badge>
                            )}
                            {h.reported && !h.verified && (
                              <Badge variant="neutral" size="sm">
                                <Flag size={10} /> Reported
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-3">
                            {h.breed && <span>{h.breed}</span>}
                            {h.age != null && <span>Age {h.age}</span>}
                            {h.gender && <span>{h.gender}</span>}
                            {h.weight != null && <span>{h.weight}kg</span>}
                            {h.speedRating != null && <span>Speed {h.speedRating}</span>}
                            {h.historyRank && <span className="font-semibold text-gold">{h.historyRank}</span>}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-3">
                            {h.jockeyAvatarUrl && (
                              <img src={h.jockeyAvatarUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
                            )}
                            Jockey: {h.jockeyName ?? '—'}
                            {h.odds != null && ` · Odds: ${h.odds}`}
                          </p>
                        </div>
                      </div>

                      {reportingId !== h.raceHorseId && (
                        <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:w-56">
                          <button
                            type="button"
                            disabled={verifyingId === h.raceHorseId}
                            onClick={() => handleVerify(h.raceHorseId, !h.verified)}
                            className={`inline-flex items-center justify-center gap-1.5 border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                              h.verified
                                ? 'border-ok/40 bg-ok-subtle text-ok hover:bg-ok/20'
                                : 'border-rim-hi text-ink-2 hover:bg-surface-overlay'
                            }`}
                          >
                            {verifyingId === h.raceHorseId ? '…' : h.verified ? 'Undo' : 'Mark OK'}
                          </button>
                          <button
                            type="button"
                            onClick={() => startReport(h.raceHorseId)}
                            className="inline-flex items-center justify-center gap-1.5 border border-rim-hi px-3 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-fail/30 hover:bg-fail-subtle hover:text-fail"
                          >
                            Report Issue
                          </button>
                        </div>
                      )}
                    </div>

                    {h.warnings.length > 0 && (
                      <ul className="mt-2.5 space-y-1 border-t border-rim pt-2.5">
                        {h.warnings.map((w, i) => (
                          <li key={i} className="text-xs text-fail">{w}</li>
                        ))}
                      </ul>
                    )}

                    {reportingId === h.raceHorseId && (
                      <div className="mt-3 space-y-3 border-t border-rim pt-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-ink-2">Issue Type</label>
                          <select
                            className={field}
                            value={issueType}
                            onChange={(e) => setIssueType(e.target.value as InspectionIssueType)}
                          >
                            {ISSUE_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-ink-2">Description</label>
                          <textarea
                            rows={2}
                            maxLength={255}
                            className={field}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setReportingId(null)}>Cancel</Button>
                          <Button size="sm" onClick={submitReport} disabled={saving || !description.trim()}>
                            {saving ? 'Submitting…' : 'Submit'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {inspection.horses.length === 0 && (
                  <p className="py-4 text-center text-xs text-ink-4">No approved horses to inspect.</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-rim px-5 py-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {onStartRace && (
            <Button
              onClick={handleStart}
              disabled={!inspection?.readyToRace || starting}
              title={!inspection?.readyToRace ? 'Resolve all issues before starting the race' : undefined}
            >
              {starting ? 'Starting…' : 'Start Race'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
