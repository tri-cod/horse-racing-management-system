import Badge from '@/components/ui/Badge';
import type { Trainer } from '@/types';

const STATUS_VARIANT: Record<string, 'ocean' | 'neutral' | 'dark'> = {
  APPROVED: 'ocean', PENDING: 'neutral', REJECTED: 'dark',
};

const fmtVnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(n));

export default function TrainerProfileView({ profile, onToggleAvailability, toggling }: {
  profile: Trainer;
  /** When provided, the availability row becomes an inline switch — no need to enter Edit. */
  onToggleAvailability?: (next: boolean) => void;
  toggling?: boolean;
}) {
  const available = profile.isAvailable !== false;
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
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${available ? 'text-ok' : 'text-warn'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${available ? 'bg-ok' : 'bg-warn'}`} />
            {available ? 'Available' : 'Not available'}
          </span>
          {onToggleAvailability && (
            <button
              type="button"
              role="switch"
              aria-checked={available}
              disabled={toggling}
              onClick={() => onToggleAvailability(!available)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${available ? 'bg-ok' : 'bg-rim-hi'}`}
            >
              <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${available ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          )}
        </div>
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
