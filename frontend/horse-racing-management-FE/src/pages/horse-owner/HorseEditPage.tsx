import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useHorseDetail } from '@/hooks/useHorseDetail';
import { useHorseForm } from '@/hooks/useHorseForm';
import HorseForm from '@/components/features/horse-owner/HorseForm';
import HorseCard from '@/components/features/horse-owner/HorseCard';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Horse } from '@/types';

function EditForm({ horse }: { horse: Horse }) {
  const navigate = useNavigate();
  const {
    form, errors, loading, apiError,
    avatarPreview, avatarFileName,
    handleChange, handleBlur,
    handleAvatarChange, handleAvatarRemove,
    handleSubmit,
  } = useHorseForm({ mode: 'edit', horseId: horse.id, initialValues: horse });

  /* Live preview horse object */
  const previewHorse = {
    ...horse,
    horseName: form.horseName?.trim() || 'Your Horse',
    breed: form.breed?.trim() || undefined,
    age: form.age ? Number(form.age) : undefined,
    weight: form.weight ? Number(form.weight) : undefined,
    gender: form.gender || undefined,
    avatarUrl: avatarPreview || undefined,
    status: (form.status as Horse['status']) || horse.status,
  } as Horse & { gender?: string };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_288px]">

      {/* ── Form card ── */}
      <div className="overflow-hidden border border-rim bg-surface-raised">
        <div className="border-b border-rim px-6 py-4">
          <h2 className="font-serif text-lg font-bold text-ink">Horse Details</h2>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6">
          <HorseForm
            form={form}
            errors={errors}
            loading={loading}
            avatarPreview={avatarPreview}
            avatarFileName={avatarFileName}
            handleChange={handleChange}
            handleBlur={handleBlur}
            handleAvatarChange={handleAvatarChange}
            handleAvatarRemove={handleAvatarRemove}
          />

          {apiError && (
            <div className="mt-6 rounded border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
              {apiError}
            </div>
          )}

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-rim pt-5">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* ── Preview sidebar ── */}
      <div>
        <div className="lg:sticky lg:top-6 space-y-4">
          <div className="overflow-hidden border border-rim bg-surface-raised">
            <div className="border-b border-rim px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Preview</p>
              <p className="mt-0.5 text-xs text-ink-3">Updates as you type</p>
            </div>
            <div className="p-3">
              <div className="pointer-events-none">
                <HorseCard horse={previewHorse} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function HorseEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { horse, loading, error, refetch } = useHorseDetail(id ? Number(id) : undefined);

  return (
    <div className="px-8 py-6">
      <Seo title="Edit Horse" description="Update your horse's details on Royal Derby." />

      <DashboardPageHeader
        eyebrow="Horse Owner"
        title="Edit Horse"
        subtitle={horse?.horseName ?? 'Loading…'}
      />

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {error && (
        <div className="mb-5 flex items-center justify-between rounded border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
      ) : horse && <EditForm horse={horse} />}
    </div>
  );
}
