import { useEffect, useState, useCallback } from 'react';
import {
  Shield, CheckCircle2, Clock, Wallet, ClipboardList, Plus, FlagTriangleRight,
} from 'lucide-react';
import { getMyHorses } from '@/api/horseOwnerApi';
import { getMyRaceRegistrations } from '@/api/raceHorseApi';
import { getBalance } from '@/api/walletApi';
import { useAuth } from '@/context/AuthContext';
import DashboardHero from '@/components/shared/DashboardHero';
import StatCard from '@/components/shared/StatCard';
import ActivityList, { type ActivityItem } from '@/components/shared/ActivityList';
import QuickActions from '@/components/shared/QuickActions';
import { FadeInStagger, FadeInItem } from '@/components/shared/FadeIn';
import Seo from '@/components/seo/Seo';
import type { Horse, RaceHorse, HorseStatus } from '@/types';

type FullRaceHorse = RaceHorse & { raceName?: string; registerAt?: string };

const fmt = (n: number | null | undefined) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';

const HORSE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active', RACING: 'Racing', FINISHED: 'Finished', INACTIVE: 'Resting', RETIRED: 'Retired',
};

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'fail' | 'neutral'> = {
  ACTIVE: 'ok', RACING: 'ok', FINISHED: 'neutral', INACTIVE: 'neutral', RETIRED: 'warn',
  APPROVED: 'ok', PENDING: 'warn', REJECTED: 'fail',
};

interface Counts {
  totalHorses?: number;
  approvedHorses?: number;
  pendingHorses?: number;
  balance?: number;
}

export default function HorseOwnerDashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Counts>({});
  const [errors, setErrors] = useState<Partial<Record<keyof Counts, string>>>({});
  const [loading, setLoading] = useState(true);

  const [horses, setHorses] = useState<Horse[]>([]);
  const [horsesLoading, setHorsesLoading] = useState(true);
  const [horsesError, setHorsesError] = useState('');

  const [registrations, setRegistrations] = useState<FullRaceHorse[]>([]);
  const [regLoading, setRegLoading] = useState(true);
  const [regError, setRegError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setHorsesLoading(true);
    setRegLoading(true);

    const [horsesR, regR, balR] = await Promise.allSettled([
      getMyHorses(),
      getMyRaceRegistrations(),
      getBalance(),
    ]);

    const next: Counts = {};
    const nextErr: Partial<Record<keyof Counts, string>> = {};

    if (horsesR.status === 'fulfilled') {
      const list = horsesR.value ?? [];
      setHorses(list);
      next.totalHorses = list.length;
      next.approvedHorses = list.filter((h) => (h.status as string) === 'ACTIVE').length;
      next.pendingHorses = list.filter((h) => (h.status as string) === 'INACTIVE').length;
    } else {
      nextErr.totalHorses = 'Failed to load';
      setHorsesError('Failed to load');
    }
    setHorsesLoading(false);

    if (regR.status === 'fulfilled') {
      setRegistrations((regR.value ?? []) as FullRaceHorse[]);
    } else {
      setRegError('Failed to load');
    }
    setRegLoading(false);

    if (balR.status === 'fulfilled') {
      const bal = balR.value as unknown as { balance?: number };
      next.balance = bal?.balance ?? (balR.value as unknown as number);
    } else nextErr.balance = 'Failed to load';

    setCounts(next);
    setErrors(nextErr);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // "Recent Activity" → newest first. Sort copies so the source arrays stay intact.
  const horseItems: ActivityItem[] = [...horses]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .map((h) => ({
      id: h.id,
      title: h.horseName,
      subtitle: h.breed ?? h.trainerName ?? 'No trainer assigned',
      meta: h.createdAt ? fmtDate(h.createdAt) : undefined,
      badge: { label: HORSE_STATUS_LABEL[h.status] ?? h.status, tone: STATUS_TONE[h.status as HorseStatus] ?? 'neutral' },
      to: `/horses/${h.id}`,
    }));

  const regItems: ActivityItem[] = [...registrations]
    .sort((a, b) => new Date(b.registerAt ?? 0).getTime() - new Date(a.registerAt ?? 0).getTime())
    .map((r) => ({
      id: r.id,
      title: r.horseName ?? `Horse #${r.horseId}`,
      // Race + jockey, so the row says at a glance where and with whom the horse rides.
      subtitle: [r.raceName ?? 'Race', r.jockeyName].filter(Boolean).join(' · '),
      meta: r.registerAt ? fmtDate(r.registerAt) : undefined,
      badge: { label: r.status, tone: STATUS_TONE[r.status] ?? 'neutral' },
      to: `/races/${r.raceId}`,
    }));

  return (
    <div>
      <Seo title="My Dashboard" description="Overview of your horses and race registrations." />
      <DashboardHero
        eyebrow="Horse Owner"
        title={`Welcome back, ${user?.fullName ?? user?.username ?? 'Owner'}`}
        subtitle="Here's an overview of your stable"
        initial={(user?.fullName ?? user?.username ?? 'O').charAt(0).toUpperCase()}
        avatarUrl={user?.avatarUrl}
      />

      <div className="px-8">
        <FadeInStagger className="relative z-10 -mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FadeInItem>
          <StatCard
            icon={Shield}
            label="My Horses"
            value={counts.totalHorses ?? 0}
            loading={loading}
            error={errors.totalHorses}
            hint="Total horses registered under your name"
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={CheckCircle2}
            label="Active Horses"
            value={counts.approvedHorses ?? 0}
            loading={loading}
            error={errors.totalHorses}
            hint="Ready to compete"
            tone="ok"
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={Clock}
            label="Resting Horses"
            value={counts.pendingHorses ?? 0}
            loading={loading}
            error={errors.totalHorses}
            hint="Marked inactive, not currently racing"
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={ClipboardList}
            label="Race Registrations"
            value={registrations.length}
            loading={regLoading}
            error={regError}
            hint="Horses entered into races"
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={Wallet}
            label="Wallet Balance"
            value={fmt(counts.balance)}
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
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Overview</p>
          <h2 className="font-serif text-lg font-bold text-ink">Recent Activity</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ActivityList
            icon={Shield}
            title="My Horses"
            items={horseItems}
            loading={horsesLoading}
            error={horsesError}
            emptyIcon={Shield}
            emptyLabel="No horses registered yet"
            viewAllTo="/horse-owner/horses"
          />
          <ActivityList
            icon={ClipboardList}
            title="Race Registrations"
            items={regItems}
            loading={regLoading}
            error={regError}
            emptyIcon={ClipboardList}
            emptyLabel="No race registrations yet"
            viewAllTo="/horse-owner/race-registrations"
          />
        </div>

        <QuickActions
          actions={[
            { icon: Plus, label: 'Register a Horse', description: 'Add a new horse to your stable', to: '/horse-owner/horses/new' },
            { icon: FlagTriangleRight, label: 'Register to Race', description: 'Enter one of your horses into a race', to: '/horse-owner/register-race' },
            { icon: ClipboardList, label: 'My Registrations', description: 'Track your race entry status', to: '/horse-owner/race-registrations' },
            { icon: Wallet, label: 'My Wallet', description: 'Deposit or withdraw funds', to: '/my-wallet' },
          ]}
        />
      </div>
    </div>
  );
}