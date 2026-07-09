import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, ClipboardCheck, ChevronRight, ArrowLeft, Flag } from 'lucide-react';
import { getPendingHorses, approveRaceHorse, rejectRaceHorse } from '@/api/raceHorseApi';
import { useToast } from '@/components/ui/ToastProvider';
import EmptyState from '@/components/ui/EmptyState';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { RaceHorse } from '@/types';

type FullRaceHorse = RaceHorse & { raceName?: string; registerAt?: string };

interface RaceGroup {
  raceId: number;
  raceName: string;
  entries: FullRaceHorse[];
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden border border-rim bg-surface-raised">
      <div className="border-b border-rim bg-surface-overlay px-5 py-3">
        <div className="flex gap-8">
          {[120, 100, 90, 80, 80].map((w, i) => (
            <div key={i} className="h-3 animate-pulse rounded-full bg-surface-input" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-rim">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-surface-overlay" />
              <div className="h-3.5 w-28 animate-pulse rounded-full bg-surface-overlay" />
            </div>
            <div className="h-3.5 w-24 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3.5 w-20 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3.5 w-28 animate-pulse rounded-full bg-surface-overlay" />
            <div className="flex gap-2">
              <div className="h-7 w-20 animate-pulse rounded bg-surface-overlay" />
              <div className="h-7 w-16 animate-pulse rounded bg-surface-overlay" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RaceListSkeleton() {
  return (
    <div className="divide-y divide-rim border border-rim bg-surface-raised">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between px-5 py-4">
          <div className="h-4 w-48 animate-pulse rounded-full bg-surface-overlay" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-surface-overlay" />
        </div>
      ))}
    </div>
  );
}

export default function AdminApproveHorsesPage() {
  const addToast = useToast();
  const [horses, setHorses] = useState<FullRaceHorse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true); setError(null);
    try { const data = await getPendingHorses(); setHorses((data ?? []) as FullRaceHorse[]); }
    catch { setError('Unable to load list. Please try again.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  // Group pending entries by race so admin picks a race before seeing its list.
  const raceGroups: RaceGroup[] = useMemo(() => {
    const map = new Map<number, RaceGroup>();
    horses.forEach((rh) => {
      const existing = map.get(rh.raceId);
      if (existing) existing.entries.push(rh);
      else map.set(rh.raceId, { raceId: rh.raceId, raceName: rh.raceName ?? `Race #${rh.raceId}`, entries: [rh] });
    });
    return Array.from(map.values()).sort((a, b) => b.entries.length - a.entries.length);
  }, [horses]);

  const selectedGroup = raceGroups.find((g) => g.raceId === selectedRaceId) ?? null;

  // If the race we were viewing no longer has any pending entries (all resolved), bounce back to the race list.
  useEffect(() => {
    if (selectedRaceId !== null && !loading && !selectedGroup) setSelectedRaceId(null);
  }, [selectedRaceId, loading, selectedGroup]);

  const handleApprove = async (rh: FullRaceHorse) => {
    setActionLoading(rh.id);
    try {
      await approveRaceHorse(rh.id);
      addToast(`"${rh.horseName}" approved`, 'success');
      setHorses((prev) => prev.filter((h) => h.id !== rh.id));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Approval failed.', 'error');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (rh: FullRaceHorse) => {
    setActionLoading(rh.id);
    try {
      await rejectRaceHorse(rh.id);
      addToast(`"${rh.horseName}" rejected`, 'success');
      setHorses((prev) => prev.filter((h) => h.id !== rh.id));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Rejection failed.', 'error');
    } finally { setActionLoading(null); }
  };

  return (
    <div className="px-8 py-6">
      <Seo title="Approve Horses" />
      <DashboardPageHeader
        eyebrow="Admin"
        title="Approve Horse Registrations"
        subtitle={
          loading
            ? 'Loading…'
            : selectedGroup
              ? `${selectedGroup.entries.length} pending in ${selectedGroup.raceName}`
              : `${horses.length} pending across ${raceGroups.length} race${raceGroups.length === 1 ? '' : 's'}`
        }
      />

      {error && (
        <div className="mb-5 flex items-center justify-between border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <button type="button" onClick={fetchPending} className="font-semibold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        selectedRaceId === null ? <RaceListSkeleton /> : <TableSkeleton />
      ) : horses.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No pending registrations"
          subtitle="All horse registrations have been reviewed."
        />
      ) : selectedRaceId === null || !selectedGroup ? (
        /* ── Step 1: pick a race ─────────────────────────────────────── */
        <div className="divide-y divide-rim border border-rim bg-surface-raised">
          {raceGroups.map((group) => (
            <button
              key={group.raceId}
              type="button"
              onClick={() => setSelectedRaceId(group.raceId)}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface-overlay/60"
            >
              <div className="flex items-center gap-3">
                <Flag size={14} className="text-gold" />
                <span className="font-serif text-base font-bold text-ink">{group.raceName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold">
                  {group.entries.length} pending
                </span>
                <ChevronRight size={16} className="text-ink-4" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* ── Step 2: registration list for the selected race ───────────── */
        <div>
          <button
            type="button"
            onClick={() => setSelectedRaceId(null)}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-gold transition-colors"
          >
            <ArrowLeft size={14} /> Back to races
          </button>

          <div className="overflow-hidden border border-rim bg-surface-raised">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-rim bg-surface-overlay">
                    {['Horse', 'Jockey', 'Registered', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rim">
                  {selectedGroup.entries.map((rh) => {
                    const isLoading = actionLoading === rh.id;
                    const initial = rh.horseName?.charAt(0)?.toUpperCase() ?? '?';
                    return (
                      <tr key={rh.id} className="transition-colors hover:bg-surface-overlay/40">
                        {/* Horse */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {rh.horseAvatarUrl ? (
                              <img src={rh.horseAvatarUrl} alt={rh.horseName} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-sm font-bold text-navy">
                                {initial}
                              </div>
                            )}
                            <span className="font-serif text-sm font-bold text-ink">{rh.horseName ?? '—'}</span>
                          </div>
                        </td>
                        {/* Jockey */}
                        <td className="px-5 py-3.5 text-sm text-ink-2">
                          {rh.jockeyName ?? '—'}
                        </td>
                        {/* Date */}
                        <td className="tnum px-5 py-3.5 text-sm text-ink-3">
                          {fmtDate(rh.registerAt)}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleApprove(rh)}
                              className="inline-flex items-center gap-1.5 border border-ok/30 bg-ok-subtle px-3 py-1.5 text-xs font-semibold text-ok transition-colors hover:bg-ok/20 disabled:opacity-50"
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleReject(rh)}
                              className="inline-flex items-center gap-1.5 border border-fail/30 bg-fail-subtle px-3 py-1.5 text-xs font-semibold text-fail transition-colors hover:bg-fail/20 disabled:opacity-50"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}