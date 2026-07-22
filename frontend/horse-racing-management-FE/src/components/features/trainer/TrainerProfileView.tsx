import Badge from '@/components/ui/Badge';
import type { Trainer } from '@/types';

const STATUS_VARIANT: Record<string, 'ocean' | 'neutral' | 'dark'> = {
  APPROVED: 'ocean', PENDING: 'neutral', REJECTED: 'dark',
};

const fmtVnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(n));

export default function TrainerProfileView({ profile }: { profile: Trainer }) {
  return (
    <div className="divide-y divide-rim">
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-4">Approval Status</span>
        <Badge variant={STATUS_VARIANT[profile.status ?? ''] ?? 'neutral'} size="lg">
          {profile.status ?? 'Unknown'}
        </Badge>
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-4">Monthly Fee</span>
        <span className="tnum text-sm font-semibold text-ink">
          {profile.monthlyFee != null ? fmtVnd(profile.monthlyFee) : <span className="text-ink-4">Not set</span>}
        </span>
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-4">Specialization</span>
        <span className="text-sm font-medium text-ink">
          {profile.specialization?.trim() || <span className="text-ink-4">Not set</span>}
        </span>
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-4">Accepting New Horses</span>
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${profile.isAvailable === false ? 'text-warn' : 'text-ok'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${profile.isAvailable === false ? 'bg-warn' : 'bg-ok'}`} />
          {profile.isAvailable === false ? 'Not available' : 'Available'}
        </span>
      </div>

      {profile.description ? (
        <div className="px-6 py-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-4">About</p>
          <p className="max-w-prose text-sm leading-relaxed text-ink-2">{profile.description}</p>
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-ink-3">No bio added yet. Click Edit to add your story.</p>
        </div>
      )}
    </div>
  );
}
