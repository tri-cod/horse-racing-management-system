import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useHorseForm } from '@/hooks/useHorseForm';
import HorseForm from '@/components/features/horse-owner/HorseForm';
import HorseCard from '@/components/features/horse-owner/HorseCard';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import Button from '@/components/ui/Button';
import type { Horse } from '@/types';

export default function HorseRegisterPage() {
  const navigate = useNavigate();
  const {
    form, errors, loading, apiError,
    avatarPreview, avatarFileName,
    handleChange, handleBlur,
    handleAvatarChange, handleAvatarRemove,
    handleSubmit,
  } = useHorseForm();

  /* Live preview horse object */
  const previewHorse = {
    id: 0,
    horseName: form.horseName?.trim() || 'Your Horse',
    breed: form.breed?.trim() || undefined,
    age: form.age ? Number(form.age) : undefined,
    weight: form.weight ? Number(form.weight) : undefined,
    gender: form.gender || undefined,
    avatarUrl: avatarPreview || undefined,
    status: (form.status as Horse['status']) || 'PENDING',
  } as Horse & { gender?: string };

  return (
    <div className="px-8 py-6">
      <Seo title="Register Horse" description="Register a new horse on Royal Derby." />

      <DashboardPageHeader
        eyebrow="Horse Owner"
        title="Register a Horse"
        subtitle="Add a new horse to your stable"
      />

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </button>

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
                {loading ? 'Registering…' : 'Register Horse'}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Preview sidebar ── */}
        <div>
          <div className="lg:sticky lg:top-6 space-y-4">

            {/* Live card preview */}
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

            {/* Quick tips */}
            <div className="border border-rim bg-surface-raised px-4 py-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-4">Before you submit</p>
              <ul className="space-y-2.5">
                {[
                  'Horse name must be unique across the platform.',
                  'A clear, well-lit photo helps your horse stand out.',
                  'Speed rating influences the odds set by the admin.',
                  'Assign a trainer from the horse detail page after registering.',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-ink-3">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/60" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
