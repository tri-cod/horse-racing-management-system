import { useEffect, useState, useCallback } from 'react';
import { PlayCircle, CalendarClock, Wallet } from 'lucide-react';
import { getRaces } from '@/api/raceApi';
import { getBalance } from '@/api/walletApi';
import { useAuth } from '@/context/AuthContext';
import DashboardHero from '@/components/shared/DashboardHero';
import StatCard from '@/components/shared/StatCard';
import ActivityList, { type ActivityItem } from '@/components/shared/ActivityList';
import { FadeInStagger, FadeInItem } from '@/components/shared/FadeIn';
import Seo from '@/components/seo/Seo';
import type { Race } from '@/types';
const fmt = (n: number | null | undefined) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export default function RefereeDashboardPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState('');
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [ongoing, setOngoing] = useState<Race[]>([]);
  const [ongoingLoading, setOngoingLoading] = useState(true);
  const [ongoingError, setOngoingError] = useState('');

  const [upcoming, setUpcoming] = useState<Race[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [upcomingError, setUpcomingError] = useState('');

  const load = useCallback(async () => {
    setOngoingLoading(true);
    setUpcomingLoading(true);
    setBalanceLoading(true);

    const [ongoingR, upcomingR, balR] = await Promise.allSettled([
      getRaces({ status: 'ONGOING', page: 0, size: 20 }),
      getRaces({ status: 'UPCOMING', page: 0, size: 20 }),
      getBalance(),
    ]);

    if (ongoingR.status === 'fulfilled') setOngoing(ongoingR.value?.content ?? []);
    else setOngoingError('Failed to load');
    setOngoingLoading(false);

    if (upcomingR.status === 'fulfilled') setUpcoming(upcomingR.value?.content ?? []);
    else setUpcomingError('Failed to load');
    setUpcomingLoading(false);

    if (balR.status === 'fulfilled') {
      const bal = balR.value as unknown as { balance?: number };
      setBalance(bal?.balance ?? (balR.value as unknown as number));
    } else setBalanceError('Failed to load');
    setBalanceLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const ongoingItems: ActivityItem[] = ongoing.map((r) => ({
    id: r.id,
    title: r.raceName,
    subtitle: [r.trackName, r.location].filter(Boolean).join(' · '),
    meta: fmtDateTime(r.startTime),
    badge: { label: 'Ongoing', tone: 'ok' },
  }));

  const upcomingItems: ActivityItem[] = upcoming.map((r) => ({
    id: r.id,
    title: r.raceName,
    subtitle: [r.trackName, r.location].filter(Boolean).join(' · '),
    meta: fmtDateTime(r.startTime),
    badge: { label: 'Upcoming', tone: 'neutral' },
  }));

  return (
    <div>
      <Seo title="My Dashboard" description="Overview of races you oversee." />
      <DashboardHero
        eyebrow="Referee"
        title={`Welcome back, ${user?.fullName ?? user?.username ?? 'Referee'}`}
        subtitle="Here's what needs your attention on the track"
        initial={(user?.fullName ?? user?.username ?? 'R').charAt(0).toUpperCase()}
        avatarUrl={user?.avatarUrl}
      />

      <div className="px-8">
        <FadeInStagger className="relative z-10 -mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FadeInItem>
          <StatCard
            icon={PlayCircle}
            label="Ongoing Races"
            value={ongoing.length}
            loading={ongoingLoading}
            error={ongoingError}
            hint="Currently running — awaiting results"
            tone={!ongoingLoading && ongoing.length > 0 ? 'ok' : 'default'}
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={CalendarClock}
            label="Upcoming Races"
            value={upcoming.length}
            loading={upcomingLoading}
            error={upcomingError}
            hint="Scheduled races not yet started"
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={Wallet}
            label="Wallet Balance"
            value={fmt(balance)}
            loading={balanceLoading}
            error={balanceError}
            hint="Available for deposits & withdrawals"
            tone="gold"
          />
          </FadeInItem>
        </FadeInStagger>
      </div>

      <div className="px-8 pb-8 pt-8">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Track Duty</p>
          <h2 className="font-serif text-lg font-bold text-ink">Race Schedule</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ActivityList
            icon={PlayCircle}
            title="Ongoing Races"
            items={ongoingItems}
            loading={ongoingLoading}
            error={ongoingError}
            emptyIcon={PlayCircle}
            emptyLabel="No races currently running"
            viewAllTo="/referee/races"
          />
          <ActivityList
            icon={CalendarClock}
            title="Upcoming Races"
            items={upcomingItems}
            loading={upcomingLoading}
            error={upcomingError}
            emptyIcon={CalendarClock}
            emptyLabel="No races scheduled"
            viewAllTo="/referee/races"
          />
        </div>
      </div>
    </div>
  );
}