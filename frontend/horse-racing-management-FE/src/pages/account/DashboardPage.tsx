import { useEffect, useState, useCallback } from 'react';
import { Ticket, Wallet, Trophy, Clock, Flag, TrendingUp } from 'lucide-react';
import { getMyBets } from '@/api/betApi';
import { getBalance } from '@/api/walletApi';
import { useAuth } from '@/context/AuthContext';
import DashboardHero from '@/components/shared/DashboardHero';
import StatCard from '@/components/shared/StatCard';
import ActivityList, { type ActivityItem } from '@/components/shared/ActivityList';
import QuickActions from '@/components/shared/QuickActions';
import { FadeInStagger, FadeInItem } from '@/components/shared/FadeIn';
import Seo from '@/components/seo/Seo';
import type { BetResponse } from '@/types';

const fmt = (n: number | null | undefined) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'fail' | 'neutral'> = {
  WON: 'ok', PENDING: 'warn', LOST: 'fail', CANCELLED: 'neutral',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [bets, setBets] = useState<BetResponse[]>([]);
  const [betsLoading, setBetsLoading] = useState(true);
  const [betsError, setBetsError] = useState('');

  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState('');

  const load = useCallback(async () => {
    setBetsLoading(true);
    setBalanceLoading(true);

    const [betsR, balR] = await Promise.allSettled([getMyBets(), getBalance()]);

    if (betsR.status === 'fulfilled') setBets(betsR.value ?? []);
    else setBetsError('Failed to load');
    setBetsLoading(false);

    if (balR.status === 'fulfilled') {
      const bal = balR.value as unknown as { balance?: number };
      setBalance(bal?.balance ?? (balR.value as unknown as number));
    } else setBalanceError('Failed to load');
    setBalanceLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pendingBets = bets.filter((b) => b.status === 'PENDING').length;
  const wonBets = bets.filter((b) => b.status === 'WON').length;

  const recentBets: ActivityItem[] = [...bets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((b) => ({
      id: b.id,
      title: b.raceName ?? `Race #${b.raceId}`,
      subtitle: `${fmt(b.totalAmount)} · ${b.betItems?.length ?? 0} horse${(b.betItems?.length ?? 0) === 1 ? '' : 's'}`,
      meta: fmtDate(b.createdAt),
      badge: { label: b.status, tone: STATUS_TONE[b.status] ?? 'neutral' },
    }));

  return (
    <div>
      <Seo title="My Dashboard" description="Overview of your bets and wallet." />
      <DashboardHero
        eyebrow="Member"
        title={`Welcome back, ${user?.fullName ?? user?.username ?? 'Member'}`}
        subtitle="Here's an overview of your betting activity"
        initial={(user?.fullName ?? user?.username ?? 'M').charAt(0).toUpperCase()}
      />

      <div className="px-8">
        <FadeInStagger className="relative z-10 -mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FadeInItem>
          <StatCard
            icon={Ticket}
            label="Total Bets"
            value={bets.length}
            loading={betsLoading}
            error={betsError}
            hint="All bets you've placed"
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={Clock}
            label="Pending Bets"
            value={pendingBets}
            loading={betsLoading}
            error={betsError}
            hint="Awaiting race results"
            tone={!betsLoading && pendingBets > 0 ? 'warn' : 'default'}
          />
          </FadeInItem>
          <FadeInItem>
          <StatCard
            icon={Trophy}
            label="Won Bets"
            value={wonBets}
            loading={betsLoading}
            error={betsError}
            hint="Winning bets so far"
            tone={!betsLoading && wonBets > 0 ? 'ok' : 'default'}
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
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Betting</p>
          <h2 className="font-serif text-lg font-bold text-ink">Recent Bets</h2>
        </div>
        <ActivityList
          icon={Ticket}
          title="Recent Bets"
          items={recentBets}
          loading={betsLoading}
          error={betsError}
          emptyIcon={Ticket}
          emptyLabel="You haven't placed any bets yet"
          viewAllTo="/my-bets"
        />

        <QuickActions
          actions={[
            { icon: Flag, label: 'Browse Races', description: 'View upcoming and live races', to: '/races' },
            { icon: TrendingUp, label: 'Place a Bet', description: 'See current odds and place your bet', to: '/bet' },
            { icon: Ticket, label: 'My Bets', description: 'Track the status of your bets', to: '/my-bets' },
            { icon: Wallet, label: 'My Wallet', description: 'Deposit or withdraw funds', to: '/my-wallet' },
          ]}
        />
      </div>
    </div>
  );
}