import Badge from '@/components/ui/Badge';
import type { Trainer } from '@/types';

const STATUS_VARIANT: Record<string, 'ocean' | 'neutral' | 'dark'> = {
  APPROVED: 'ocean', PENDING: 'neutral', REJECTED: 'dark',
};

export default function TrainerProfileView({ profile }: { profile: Trainer }) {
  return (
    <div className="divide-y divide-rim">
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-4">Approval Status</span>
        <Badge variant={STATUS_VARIANT[profile.status ?? ''] ?? 'neutral'} size="lg">
          {profile.status ?? 'Unknown'}
        </Badge>
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
