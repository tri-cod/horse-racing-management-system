import { useEffect, useState, useCallback } from 'react';
import {
  Users, ClipboardCheck, ArrowDownLeft, Landmark, BadgeDollarSign,
  Flag, UserPlus, Plus, TrendingUp,
} from 'lucide-react';
import { getUsers } from '@/api/adminApi';
import { getPendingHorses } from '@/api/raceHorseApi';
import { getPendingWithdraws, getPendingDeposits, getSystemBalance } from '@/api/walletApi';
import { getRaces } from '@/api/raceApi';
import { useAuth } from '@/context/AuthContext';
import DashboardHero from '@/components/shared/DashboardHero';
import StatCard from '@/components/shared/StatCard';
import ActivityList, { type ActivityItem } from '@/components/shared/ActivityList';
import QuickActions from '@/components/shared/QuickActions';
import { FadeInStagger, FadeInItem } from '@/components/shared/FadeIn';
import UserGrowthChart from '@/components/shared/UserGrowthChart';
import Seo from '@/components/seo/Seo';
import type { RaceHorse, PendingTransaction } from '@/types';

type FullRaceHorse = RaceHorse & { raceName?: string; registerAt?: string };

const fmt = (n: number | null | undefined) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';

interface Counts {
  users?: number;
  openRaces?: number;
  systemBalance?: number;
  pendingDeposits?: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Counts>({});
  const [userDates, setUserDates] = useState<(string | undefined)[]>([]);
  const [userDatesError, setUserDatesError] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof Counts, string>>>({});
  const [loading, setLoading] = useState(true);

  const [pendingHorses, setPendingHorses] = useState<FullRaceHorse[]>([]);
  const [horsesLoading, setHorsesLoading] = useState(true);
  const [horsesError, setHorsesError] = useState('');

  const [pendingWithdraws, setPendingWithdraws] = useState<PendingTransaction[]>([]);
  const [withdrawsLoading, setWithdrawsLoading] = useState(true);
  const [withdrawsError, setWithdrawsError] = useState('');

  const [pendingDeposits, setPendingDeposits] = useState<PendingTransaction[]>([]);
  const [depositsLoading, setDepositsLoading] = useState(true);
  const [depositsError, setDepositsError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setHorsesLoading(true);
    setWithdrawsLoading(true);
    setDepositsLoading(true);

    const results = await Promise.allSettled([
      getUsers({ page: 0, size: 500 }),
      getPendingHorses(),
      getPendingWithdraws(),
      getPendingDeposits(),
      getRaces({ status: 'OPEN_REGISTRATION', page: 0, size: 1 }),
      getSystemBalance(),
    ]);

    const [usersR, horsesR, withdrawsR, depositsR, racesR, balanceR] = results;
    const next: Counts = {};
    const nextErr: Partial<Record<keyof Counts, string>> = {};

    if (usersR.status === 'fulfilled') {
      next.users = usersR.value?.totalElements ?? 0;
      setUserDates((usersR.value?.content ?? []).map((u) => u.createdAt));
    } else {
      nextErr.users = 'Failed to load';
      setUserDatesError('Failed to load');
    }

    if (horsesR.status === 'fulfilled') {
      setPendingHorses((horsesR.value ?? []) as FullRaceHorse[]);
    } else setHorsesError('Failed to load');
    setHorsesLoading(false);

    if (withdrawsR.status === 'fulfilled') {
      setPendingWithdraws(withdrawsR.value ?? []);
    } else setWithdrawsError('Failed to load');
    setWithdrawsLoading(false);

    if (depositsR.status === 'fulfilled') {
      const depositsOnly = (depositsR.value ?? []).filter((d) => d.requestType === 'DEPOSIT');
      setPendingDeposits(depositsOnly);
      next.pendingDeposits = depositsOnly.length;
    } else {
      setDepositsError('Failed to load');
      nextErr.pendingDeposits = 'Failed to load';
    }
    setDepositsLoading(false);

    if (racesR.status === 'fulfilled') next.openRaces = racesR.value?.totalElements ?? 0;
    else nextErr.openRaces = 'Failed to load';

    if (balanceR.status === 'fulfilled') {
      const bal = balanceR.value as unknown as { balance?: number };
      next.systemBalance = bal?.balance ?? (balanceR.value as unknown as number);
    } else nextErr.systemBalance = 'Failed to load';

    setCounts(next);
    setErrors(nextErr);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const horseItems: ActivityItem[] = pendingHorses.map((h) => ({
    id: h.id,
    title: h.horseName ?? `Horse #${h.horseId}`,
    subtitle: h.raceName ?? 'Race registration',
    meta: h.registerAt ? fmtDate(h.registerAt) : undefined,
    badge: { label: 'Pending', tone: 'warn' },
  }));

  const withdrawItems: ActivityItem[] = pendingWithdraws.map((w) => ({
    id: w.id,
    title: w.user?.fullName ?? w.user?.username ?? 'Unknown user',
    subtitle: fmt(w.amount),
    meta: w.createdAt ? fmtDate(w.createdAt) : undefined,
    badge: { label: 'Pending', tone: 'warn' },
  }));

  const depositItems: ActivityItem[] = pendingDeposits.map((d) => ({
    id: d.id,
    title: d.user?.fullName ?? d.user?.username ?? 'Unknown user',
    subtitle: fmt(d.amount),
    meta: d.createdAt ? fmtDate(d.createdAt) : undefined,
    badge: { label: 'Pending', tone: 'warn' },
  }));

  return (
    <div>
      <Seo title="Admin Dashboard" description="Overview of Royal Derby platform activity." />
      <DashboardHero
        eyebrow="Admin"
        title={`Welcome back, ${user?.fullName ?? user?.username ?? 'Admin'}`}
        subtitle="Here's what's happening across the platform today"
        initial={(user?.fullName ?? user?.username ?? 'A').charAt(0).toUpperCase()}
        avatarUrl={user?.avatarUrl}
      />

      <div className="px-8">
        <FadeInStagger className="relative z-10 -mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FadeInItem>
          <StatCard
            icon={Users}
            label="Total Users"
            value={counts.users ?? 0}
            loading={loading}
            error={errors.users}
            hint="Registered accounts on the platform"
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={ClipboardCheck}
            label="Pending Horse Approvals"
            value={horsesLoading ? 0 : pendingHorses.length}
            loading={horsesLoading}
            error={horsesError}
            hint="Awaiting review before racing"
            tone={!horsesLoading && pendingHorses.length > 0 ? 'warn' : 'default'}
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={Flag}
            label="Open Races"
            value={counts.openRaces ?? 0}
            loading={loading}
            error={errors.openRaces}
            hint="Currently accepting registrations"
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={ArrowDownLeft}
            label="Pending Withdrawals"
            value={withdrawsLoading ? 0 : pendingWithdraws.length}
            loading={withdrawsLoading}
            error={withdrawsError}
            hint="Bank transfers awaiting approval"
            tone={!withdrawsLoading && pendingWithdraws.length > 0 ? 'warn' : 'default'}
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={BadgeDollarSign}
            label="Pending Deposits"
            value={counts.pendingDeposits ?? 0}
            loading={loading}
            error={errors.pendingDeposits}
            hint="VietQR transfers awaiting verification"
            tone={!loading && (counts.pendingDeposits ?? 0) > 0 ? 'warn' : 'default'}
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={Landmark}
            label="System Balance"
            value={fmt(counts.systemBalance)}
            loading={loading}
            error={errors.systemBalance}
            hint="Total funds held by Royal Derby"
            tone="gold"
          />
          </FadeInItem>
        </FadeInStagger>
      </div>

      <div className="px-8 pb-8 pt-8">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Trend</p>
          <h2 className="font-serif text-lg font-bold text-ink">Platform Growth</h2>
        </div>
        <UserGrowthChart createdDates={userDates} loading={loading} error={userDatesError} />
      </div>

      <div className="px-8 pb-8">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Attention Needed</p>
          <h2 className="font-serif text-lg font-bold text-ink">Recent Activity</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ActivityList
            icon={ClipboardCheck}
            title="Pending Horse Approvals"
            items={horseItems}
            loading={horsesLoading}
            error={horsesError}
            emptyIcon={ClipboardCheck}
            emptyLabel="No pending horse approvals"
            viewAllTo="/admin/approve-horses"
          />
          <ActivityList
            icon={BadgeDollarSign}
            title="Pending Deposits"
            items={depositItems}
            loading={depositsLoading}
            error={depositsError}
            emptyIcon={BadgeDollarSign}
            emptyLabel="No pending deposits"
            viewAllTo="/admin/wallet?tab=deposits"
          />
          <ActivityList
            icon={ArrowDownLeft}
            title="Pending Withdrawals"
            items={withdrawItems}
            loading={withdrawsLoading}
            error={withdrawsError}
            emptyIcon={ArrowDownLeft}
            emptyLabel="No pending withdrawals"
            viewAllTo="/admin/wallet"
          />
        </div>

        <QuickActions
          actions={[
            { icon: UserPlus, label: 'Manage Users', description: 'Change roles and account status', to: '/admin/users' },
            { icon: Plus, label: 'Create Race', description: 'Set up a new race event', to: '/admin/races/create' },
            { icon: ClipboardCheck, label: 'Approve Horses', description: 'Review pending horse registrations', to: '/admin/approve-horses' },
            { icon: TrendingUp, label: 'Set Odds', description: 'Update morning-line odds for a race', to: '/admin/set-odds' },
            { icon: BadgeDollarSign, label: 'Deposit Requests', description: 'Verify VietQR deposit transfers', to: '/admin/wallet?tab=deposits' },
            { icon: Landmark, label: 'System Wallet', description: 'Review balance and withdrawal requests', to: '/admin/wallet' },
          ]}
        />
      </div>
    </div>
  );
}