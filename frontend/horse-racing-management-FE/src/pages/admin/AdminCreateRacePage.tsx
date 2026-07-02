import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRace } from '@/api/raceApi';
import { useToast } from '@/components/ui/ToastProvider';
import RaceForm from '@/components/features/race/RaceForm';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { CreateRacePayload, RaceStatus } from '@/types';

export default function AdminCreateRacePage() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload: CreateRacePayload & { status?: RaceStatus }) => {
    setLoading(true);
    try {
      await createRace(payload);
      addToast('Race created successfully!', 'success');
      navigate('/admin/races');
    } finally { setLoading(false); }
  };

  return (
    <div className="px-8 py-6">
      <Seo title="Create Race" />
      <DashboardPageHeader eyebrow="Admin" title="Create Race" subtitle="Set up a new race for the upcoming season" />

      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
          <div className="border-b border-rim px-6 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">New Race</p>
            <h2 className="mt-0.5 font-serif text-lg font-bold text-ink">Race Details</h2>
          </div>
          <div className="px-6 py-6">
            <RaceForm mode="create" onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
