import { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { reportInspectionIssue } from '@/api/refereeApi';
import { useRaceInspection } from '@/hooks/useRaceInspection';
import { getErrorMessage } from '@/utils/errors';
import Button from '@/components/ui/Button';
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
}: {
  race: Race;
  onClose: () => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const { inspection, loading, error, refetch } = useRaceInspection(race.id);
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [issueType, setIssueType] = useState<InspectionIssueType>('WRONG_JOCKEY');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

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
          </div>
          <button type="button" onClick={onClose} className="text-ink-4 transition-colors hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-xs text-ink-3">{race.raceName}</p>

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
              <div
                className={`flex items-center gap-2 border px-4 py-3 text-sm font-semibold ${
                  inspection.readyToRace
                    ? 'border-ok/30 bg-ok-subtle text-ok'
                    : 'border-fail/30 bg-fail-subtle text-fail'
                }`}
              >
                {inspection.readyToRace ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                {inspection.readyToRace ? 'Ready to race — no issues found.' : `${inspection.issues.length} issue(s) found.`}
              </div>

              <div className="flex flex-col gap-3">
                {inspection.horses.map((h) => (
                  <div key={h.raceHorseId} className="border border-rim px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-ink">{h.horseName}</p>
                        <p className="text-xs text-ink-3">
                          Jockey: {h.jockeyName ?? '—'}
                          {h.odds != null && ` · Odds: ${h.odds}`}
                        </p>
                      </div>
                      {reportingId !== h.raceHorseId && (
                        <Button variant="outline" size="sm" onClick={() => startReport(h.raceHorseId)}>
                          Report Issue
                        </Button>
                      )}
                    </div>

                    {h.warnings.length > 0 && (
                      <ul className="mt-2 space-y-1">
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
        </div>
      </div>
    </div>
  );
}
