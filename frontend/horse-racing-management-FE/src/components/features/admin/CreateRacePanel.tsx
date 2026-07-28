import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRace } from '@/api/raceApi';
import { useToast } from '@/components/ui/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import RaceForm from '@/components/features/race/RaceForm';
import type { CreateRacePayload, RaceStatus } from '@/types';

type PendingPayload = CreateRacePayload & { status?: RaceStatus };

export default function CreateRacePanel() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [loading, setLoading] = useState(false);
  // RaceForm's own submit only stages the payload — the actual create call
  // waits behind the confirm dialog below.
  const [pendingPayload, setPendingPayload] = useState<PendingPayload | null>(null);

  const handleStage = async (payload: PendingPayload) => {
    setPendingPayload(payload);
  };

  const handleConfirmCreate = async () => {
    if (!pendingPayload) return;
    setLoading(true);
    try {
      await createRace(pendingPayload);
      addToast('Race created successfully!', 'success');
      navigate('/admin/races');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to create race.', 'error');
    } finally {
      setLoading(false);
      setPendingPayload(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
        <div className="border-b border-rim px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">New Race</p>
          <h2 className="mt-0.5 font-serif text-lg font-bold text-ink">Race Details</h2>
        </div>
        <div className="px-8 py-8">
          <RaceForm mode="create" onSubmit={handleStage} loading={loading} />
        </div>
      </div>

      <ConfirmDialog
        open={pendingPayload != null}
        onClose={() => setPendingPayload(null)}
        onConfirm={handleConfirmCreate}
        loading={loading}
        title="Create This Race?"
        message={pendingPayload ? `Create "${pendingPayload.raceName}"? It will be published and open for registration right away.` : undefined}
        confirmLabel="Create Race"
        variant="primary"
      />
    </div>
  );
}
