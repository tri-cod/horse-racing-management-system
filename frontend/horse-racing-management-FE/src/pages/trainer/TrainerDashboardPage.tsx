import { useEffect, useState, useCallback } from 'react';
import { UserCog, Wallet, BadgeCheck, AlertCircle, Pencil, Users } from 'lucide-react';
import { getTrainerProfile, getTrainerList } from '@/api/trainerApi';
import { getBalance } from '@/api/walletApi';
import { useAuth } from '@/context/AuthContext';
import DashboardHero from '@/components/shared/DashboardHero';
import StatCard from '@/components/shared/StatCard';
import ActivityList, { type ActivityItem } from '@/components/shared/ActivityList';
import QuickActions from '@/components/shared/QuickActions';
import { FadeInStagger, FadeInItem } from '@/components/shared/FadeIn';
import TrainerStatsSection from '@/components/features/trainer/TrainerStatsSection';
import TrainerHorsesSection from '@/components/features/trainer/TrainerHorsesSection';
import Seo from '@/components/seo/Seo';
import type { Trainer } from '@/types';

const fmt = (n: number | null | undefined) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

export default function TrainerDashboardPage() {
  const { user } = useAuth();
  const [profileId, setProfileId] = useState<number | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [experienceYears, setExperienceYears] = useState<number | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ profile?: string; balance?: string }>({});
  const [loading, setLoading] = useState(true);

  const [peers, setPeers] = useState<Trainer[]>([]);
  const [peersLoading, setPeersLoading] = useState(true);
  const [peersError, setPeersError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setPeersLoading(true);
    const [profileR, balR, peersR] = await Promise.allSettled([
      getTrainerProfile(), getBalance(), getTrainerList(),
    ]);
    const nextErr: { profile?: string; balance?: string } = {};

    if (profileR.status === 'fulfilled') {
      const p = profileR.value;
      setProfileId(p?.id ?? null);
      setProfileAvatarUrl(p?.avatarUrl ?? null);
      setExperienceYears(p?.experienceYears ?? null);
      setProfileComplete(!!(p?.dateOfBirth && p?.experienceYears != null));
    } else {
      nextErr.profile = 'Failed to load';
    }

    if (balR.status === 'fulfilled') {
      const bal = balR.value as unknown as { balance?: number };
      setBalance(bal?.balance ?? (balR.value as unknown as number));
    } else {
      nextErr.balance = 'Failed to load';
    }

    if (peersR.status === 'fulfilled') {
      setPeers((peersR.value ?? []).filter((t) => t.userId !== user?.id && t.id !== undefined));
    } else {
      setPeersError('Failed to load');
    }
    setPeersLoading(false);

    setErrors(nextErr);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const peerItems: ActivityItem[] = peers.map((t) => ({
    id: t.id,
    title: t.name ?? t.fullName ?? 'Trainer',
    subtitle: t.specialization ?? (t.experienceYears != null ? `${t.experienceYears} yrs experience` : 'Active trainer'),
    badge: { label: 'Active', tone: 'ok' },
  }));

  return (
    <div>
      <Seo title="My Dashboard" description="Overview of your trainer profile." />
      <DashboardHero
        eyebrow="Trainer"
        title={`Welcome back, ${user?.fullName ?? user?.username ?? 'Trainer'}`}
        subtitle="Here's an overview of your profile"
        initial={(user?.fullName ?? user?.username ?? 'T').charAt(0).toUpperCase()}
        avatarUrl={profileAvatarUrl ?? user?.avatarUrl}
      />

      <div className="px-8">
        <FadeInStagger className="relative z-10 -mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FadeInItem>
          <StatCard
            icon={profileComplete ? BadgeCheck : AlertCircle}
            label="Profile Status"
            value={loading ? '' : profileComplete ? 'Complete' : 'Incomplete'}
            loading={loading}
            error={errors.profile}
            hint={profileComplete ? 'Visible to horse owners' : 'Complete your profile to appear in listings'}
            tone={loading ? 'default' : profileComplete ? 'ok' : 'warn'}
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={UserCog}
            label="Years of Experience"
            value={experienceYears ?? '—'}
            loading={loading}
            error={errors.profile}
            hint="As listed on your public profile"
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={Wallet}
            label="Wallet Balance"
            value={fmt(balance)}
            loading={loading}
            error={errors.balance}
            hint="Available for deposits & withdrawals"
            tone="gold"
          />
          </FadeInItem>
        </FadeInStagger>
      </div>

      {profileId != null && (
        <div className="space-y-6 px-8 pt-8">
          <div>
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Performance</p>
              <h2 className="font-serif text-lg font-bold text-ink">Your Track Record</h2>
            </div>
            <TrainerStatsSection trainerId={profileId} showRecentRaces={false} />
          </div>
          <div>
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Stable</p>
              <h2 className="font-serif text-lg font-bold text-ink">Horses You Train</h2>
            </div>
            <TrainerHorsesSection trainerId={profileId} />
          </div>
        </div>
      )}

      <div className="px-8 pb-8 pt-8">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Community</p>
          <h2 className="font-serif text-lg font-bold text-ink">Fellow Trainers</h2>
        </div>
        <ActivityList
          icon={Users}
          title="Active Trainers"
          items={peerItems}
          loading={peersLoading}
          error={peersError}
          emptyIcon={Users}
          emptyLabel="No other trainers listed yet"
        />

        <QuickActions
          actions={[
            { icon: Pencil, label: 'Edit Profile', description: 'Update your bio, experience and photo', to: '/trainer/profile' },
            { icon: Wallet, label: 'My Wallet', description: 'Deposit or withdraw funds', to: '/my-wallet' },
          ]}
        />
      </div>
    </div>
  );
}