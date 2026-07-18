import { useEffect, useState, useCallback } from 'react';
import { UserCog, Wallet, BadgeCheck, AlertCircle, Pencil, Users } from 'lucide-react';
import { getMyProfile, getJockeyList } from '@/api/jockeyApi';
import { getBalance } from '@/api/walletApi';
import { useAuth } from '@/context/AuthContext';
import DashboardHero from '@/components/shared/DashboardHero';
import StatCard from '@/components/shared/StatCard';
import ActivityList, { type ActivityItem } from '@/components/shared/ActivityList';
import QuickActions from '@/components/shared/QuickActions';
import { FadeInStagger, FadeInItem } from '@/components/shared/FadeIn';
import Seo from '@/components/seo/Seo';
import type { Jockey } from '@/types';

const fmt = (n: number | null | undefined) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

export default function JockeyDashboardPage() {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [experienceYear, setExperienceYear] = useState<number | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ profile?: string; balance?: string }>({});
  const [loading, setLoading] = useState(true);

  const [peers, setPeers] = useState<Jockey[]>([]);
  const [peersLoading, setPeersLoading] = useState(true);
  const [peersError, setPeersError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setPeersLoading(true);
    const [profileR, balR, peersR] = await Promise.allSettled([
      getMyProfile(), getBalance(), getJockeyList(),
    ]);
    const nextErr: { profile?: string; balance?: string } = {};

    if (profileR.status === 'fulfilled') {
      const p = profileR.value;
      setProfileName(p?.name ?? null);
      setProfileAvatarUrl(p?.avatarUrl ?? null);
      setExperienceYear(p?.experienceYear ?? null);
      setProfileComplete(!!(p?.dateOfBirth && p?.experienceYear != null));
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
      setPeers((peersR.value ?? []).filter((j) => j.userId !== user?.id && j.id !== undefined));
    } else {
      setPeersError('Failed to load');
    }
    setPeersLoading(false);

    setErrors(nextErr);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const peerItems: ActivityItem[] = peers.map((j) => ({
    id: j.id,
    title: j.name ?? j.fullName ?? 'Jockey',
    subtitle: j.experienceYear != null ? `${j.experienceYear} yrs experience` : 'Active jockey',
    badge: { label: 'Active', tone: 'ok' },
  }));

  const displayName = profileName ?? user?.fullName ?? user?.username ?? 'Jockey';

  return (
    <div>
      <Seo title="My Dashboard" description="Overview of your jockey profile." />
      <DashboardHero
        eyebrow="Jockey"
        title={`Welcome back, ${displayName}`}
        subtitle="Here's an overview of your profile"
        initial={displayName.charAt(0).toUpperCase()}
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
            value={experienceYear ?? '—'}
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

      <div className="px-8 pb-8 pt-8">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Community</p>
          <h2 className="font-serif text-lg font-bold text-ink">Fellow Jockeys</h2>
        </div>
        <ActivityList
          icon={Users}
          title="Active Jockeys"
          items={peerItems}
          loading={peersLoading}
          error={peersError}
          emptyIcon={Users}
          emptyLabel="No other jockeys listed yet"
        />

        <QuickActions
          actions={[
            { icon: Pencil, label: 'Edit Profile', description: 'Update your bio and experience', to: '/jockey/profile' },
            { icon: Wallet, label: 'My Wallet', description: 'Deposit or withdraw funds', to: '/my-wallet' },
          ]}
        />
      </div>
    </div>
  );
}
