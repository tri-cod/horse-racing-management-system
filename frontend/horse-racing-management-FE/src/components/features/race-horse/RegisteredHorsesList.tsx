import { useState } from 'react';
import { Check, X, Users } from 'lucide-react';
import { useHorsesByRace } from '@/hooks/useHorsesByRace';
import { approveRaceHorse, rejectRaceHorse } from '@/api/raceHorseApi';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { assignLanes } from '@/utils/laneUtils';

interface RegisteredHorsesListProps {
  raceId: number;
  isAdmin?: boolean;
  onToast?: (msg: string, type?: 'success' | 'error') => void;
}

interface ConfirmState { id: number; action: 'approve' | 'reject'; name?: string }

export default function RegisteredHorsesList({ raceId, isAdmin, onToast }: RegisteredHorsesListProps) {
  const { entries: allEntries, loading, error, refetch } = useHorsesByRace(raceId);
  const entries = assignLanes(
    allEntries.filter((e) => e.status?.toLowerCase() === 'approved') as Parameters<typeof assignLanes>[0],
  );
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.action === 'approve') { await approveRaceHorse(confirm.id); onToast?.('Horse approved.'); }
      else { await rejectRaceHorse(confirm.id); onToast?.('Horse rejected.'); }
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      onToast?.(err.response?.data?.message ?? 'Action failed.', 'error');
    } finally { setActionLoading(false); setConfirm(null); }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="h-6 w-6 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3.5 w-32 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3.5 w-24 animate-pulse rounded-full bg-surface-overlay" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-fail">{error}</p>;
  }

  if (!entries.length) {
    return <EmptyState icon={Users} title="No horses registered" subtitle="No approved horses for this race yet." />;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-rim">
              {['Lane', 'Horse', 'Jockey', ...(isAdmin ? ['Actions'] : [])].map((h) => (
                <th key={h} className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rim">
            {entries.map((e) => (
              <tr key={e.id} className="transition-colors hover:bg-surface-overlay/30">
                <td className="py-2.5 pr-4">
                  <span className="tnum inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy/10 text-xs font-bold text-navy">
                    {e.laneNumber ?? '—'}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-sm font-semibold text-ink">{e.horseName}</td>
                <td className="py-2.5 pr-4 text-sm text-ink-3">{e.jockeyName ?? '—'}</td>
                {isAdmin && (
                  <td className="py-2.5">
                    {e.status === 'PENDING' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="Approve"
                          onClick={() => setConfirm({ id: e.id, action: 'approve', name: e.horseName })}
                          className="flex h-7 w-7 items-center justify-center rounded border border-ok/30 bg-ok-subtle text-ok transition-colors hover:bg-ok/20"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          type="button"
                          title="Reject"
                          onClick={() => setConfirm({ id: e.id, action: 'reject', name: e.horseName })}
                          className="flex h-7 w-7 items-center justify-center rounded border border-fail/30 bg-fail-subtle text-fail transition-colors hover:bg-fail/20"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        loading={actionLoading}
        title={confirm?.action === 'approve' ? 'Approve Horse?' : 'Reject Horse?'}
        message={`Are you sure you want to ${confirm?.action} "${confirm?.name}"?`}
        confirmLabel={confirm?.action === 'approve' ? 'Approve' : 'Reject'}
        variant={confirm?.action === 'approve' ? 'primary' : 'danger'}
      />
    </>
  );
}
