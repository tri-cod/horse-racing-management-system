import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';
import { useSeasonStats } from '@/hooks/useSeasonStats';

function fmtMoney(n: number) {
  if (n <= 0) return '$0';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function SeasonStatsSection() {
  const { stats, loading } = useSeasonStats();

  const items = [
    { label: 'Races This Season', value: stats.totalRaces },
    { label: 'Horses Registered', value: stats.totalHorses },
    { label: 'Active Jockeys', value: stats.totalJockeys },
    { label: 'Prize Pool Awarded', value: fmtMoney(stats.totalPrizePool) },
  ];

  return (
    <section className="bg-surface-raised py-32">
      <Container>
        <SectionHeader
          eyebrow="Season 2026"
          title="The Numbers So Far"
          subtitle="A quick snapshot of everything moving through Royal Derby this season."
        />

        <div className="grid grid-cols-2 divide-y divide-rim border border-rim sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {items.map((item, idx) => (
            <Reveal key={item.label} delay={idx * 80} className="flex flex-col items-center gap-1 px-4 py-8 text-center">
              {loading ? (
                <div className="h-9 w-16 animate-pulse rounded bg-surface-overlay" />
              ) : (
                <span className="tnum font-serif text-4xl font-bold text-ink">{item.value}</span>
              )}
              <span className="text-xs font-medium uppercase tracking-wide text-ink-3">{item.label}</span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}