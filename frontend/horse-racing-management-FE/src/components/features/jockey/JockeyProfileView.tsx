import Badge from '@/components/ui/Badge';
import { calculateAge } from '@/utils/age';
import type { Jockey } from '@/types';

const STATUS_VARIANT: Record<string, 'ocean' | 'neutral' | 'dark'> = {
  APPROVED: 'ocean', PENDING: 'neutral', REJECTED: 'dark', ACTIVE: 'ocean',
};

export default function JockeyProfileView({ profile }: { profile: Jockey }) {
  const hasStats = profile.totalRaces != null || profile.totalWins != null || profile.winRate != null;
  const age = calculateAge(profile.dateOfBirth);

  return (
    <div className="divide-y divide-rim">
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-4">Approval Status</span>
        <Badge variant={STATUS_VARIANT[profile.status ?? ''] ?? 'neutral'} size="lg">
          {profile.status ?? 'Unknown'}
        </Badge>
      </div>

      {(profile.experienceYear != null || age != null) && (
        <div className="grid grid-cols-2 divide-x divide-rim px-6 py-5 text-center">
          <div>
            <p className="tnum text-2xl font-bold text-ink">{profile.experienceYear ?? '—'}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-4">Yrs Experience</p>
          </div>
          <div>
            <p className="tnum text-2xl font-bold text-ink">{age ?? '—'}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-4">Age</p>
          </div>
        </div>
      )}

      {hasStats && (
        <div className="grid grid-cols-3 divide-x divide-rim px-6 py-5 text-center">
          <div>
            <p className="tnum text-2xl font-bold text-ink">{profile.totalRaces ?? '—'}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-4">Races</p>
          </div>
          <div>
            <p className="tnum text-2xl font-bold text-ink">{profile.totalWins ?? '—'}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-4">Wins</p>
          </div>
          <div>
            <p className="tnum text-2xl font-bold text-gold">{profile.winRate != null ? `${profile.winRate.toFixed(0)}%` : '—'}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-4">Win Rate</p>
          </div>
        </div>
      )}

      {profile.description ? (
        <div className="px-6 py-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-4">About</p>
          <p className="max-w-prose text-justify text-sm leading-relaxed text-ink-2">{profile.description}</p>
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-ink-3">No bio added yet. Click Edit to add your story.</p>
        </div>
      )}
    </div>
  );
}
