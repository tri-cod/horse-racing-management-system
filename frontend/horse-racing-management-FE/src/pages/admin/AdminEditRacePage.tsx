import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { updateRace } from '@/api/raceApi';
import { useRaceDetail } from '@/hooks/useRaceDetail';
import { useToast } from '@/components/ui/ToastProvider';
import RaceForm from '@/components/features/race/RaceForm';
import Button from '@/components/ui/Button';

function FormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden border border-rim bg-surface-raised">
        <div className="h-[68px] animate-pulse border-b border-rim bg-surface-overlay" />
        <div className="px-6 py-6 space-y-6">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-surface-overlay" />
                  <div className="h-2.5 w-16 animate-pulse rounded-full bg-surface-overlay" />
                </div>
                {i < 3 && <div className="mx-2 h-px flex-1 animate-pulse bg-surface-overlay" />}
              </div>
            ))}
          </div>
          {/* Fields */}
          <div className="space-y-4 border border-rim p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-24 animate-pulse rounded-full bg-surface-overlay" />
                <div className="h-9 w-full animate-pulse rounded bg-surface-overlay" />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <div className="h-10 w-28 animate-pulse rounded bg-surface-overlay" />
          </div>
        </div>
      </div>
    </div>
  );
}
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { CreateRacePayload, RaceStatus } from '@/types';

export default function AdminEditRacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useToast();
  const { race, loading, error, refetch } = useRaceDetail(id ? Number(id) : undefined);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (payload: CreateRacePayload & { status?: RaceStatus }) => {
    setSaving(true);
    try {
      await updateRace(Number(id), payload);
      addToast('Race updated successfully!', 'success');
      navigate('/admin/races');
    } finally { setSaving(false); }
  };

  return (
    <div className="px-8 py-6">
      <Seo title="Edit Race" />
      <DashboardPageHeader
        eyebrow="Admin"
        title="Edit Race"
        subtitle={race?.raceName ?? 'Loading…'}
      />

      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} /> Back to Races
        </button>
        {id && (
          <Link
            to={`/admin/races/${id}`}
            className="flex items-center gap-1.5 text-sm font-medium text-navy transition-colors hover:text-navy-hi"
          >
            <Eye size={15} /> View Race Detail
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between rounded border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {loading ? (
        <FormSkeleton />
      ) : race && (
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
            <div className="border-b border-rim px-6 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Edit Entry</p>
              <h2 className="mt-0.5 font-serif text-lg font-bold text-ink">Race Details</h2>
            </div>
            <div className="px-6 py-6">
              <RaceForm
                mode="edit"
                initialValues={race as Parameters<typeof RaceForm>[0]['initialValues']}
                onSubmit={handleSubmit}
                loading={saving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}