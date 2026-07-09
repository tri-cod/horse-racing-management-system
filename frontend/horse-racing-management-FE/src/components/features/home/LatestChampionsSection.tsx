import { Link } from 'react-router-dom';
import { Trophy, ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';
import { useLatestFinishedRace } from '@/hooks/useLatestFinishedRace';
import { useRaceResults, type NormalizedRaceResult } from '@/hooks/useRaceResults';

// Display order left-to-right: 2nd, 1st, 3rd — classic podium arrangement.
const PODIUM_ORDER = [2, 1, 3];

const PODIUM_STYLES: Record<number, { badge: string; lift: string; label: string }> = {
  1: { badge: 'bg-gold text-on-gold', lift: 'sm:-translate-y-6', label: '1st' },
  2: { badge: 'bg-on-blue/25 text-on-blue', lift: 'sm:translate-y-0', label: '2nd' },
  3: { badge: 'bg-[#8a5a2b] text-white', lift: 'sm:translate-y-3', label: '3rd' },
};

function PodiumCardSkeleton() {
  return <div className="h-48 animate-pulse rounded-md bg-on-blue/5" aria-hidden="true" />;
}

function PodiumCard({ result }: { result: NormalizedRaceResult }) {
  const style = PODIUM_STYLES[result.position] ?? PODIUM_STYLES[3];
  return (
    <div className={`flex flex-col items-center gap-3 border border-on-blue/10 bg-navy-deep px-5 py-8 text-center transition ${style.lift}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${style.badge}`}>
        {style.label}
      </span>
      <h3 className="font-serif text-xl font-bold uppercase leading-tight text-on-blue">{result.horseName}</h3>
      <p className="text-xs text-on-blue/55">Ridden by {result.jockeyName}</p>
      {result.time && <p className="tnum text-xs text-on-blue/40">{result.time}</p>}
    </div>
  );
}

export default function LatestChampionsSection() {
  const { race, loading: raceLoading } = useLatestFinishedRace();
  const { results, loading: resultsLoading } = useRaceResults(race?.id);

  const podium = results.filter((r) => r.position >= 1 && r.position <= 3);
  const ordered = PODIUM_ORDER
    .map((pos) => podium.find((r) => r.position === pos))
    .filter((r): r is NormalizedRaceResult => !!r);

  const loading = raceLoading || (!!race && resultsLoading);

  return (
    <section className="bg-navy py-32">
      <Container>
        <SectionHeader
          eyebrow="Latest Champions"
          title="Recent Winner's Circle"
          subtitle={race ? `Podium finishers from ${race.raceName}.` : 'No race has finished yet this season.'}
          invert
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => <PodiumCardSkeleton key={i} />)}
          </div>
        ) : ordered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border border-on-blue/10 bg-navy-deep py-20 text-center">
            <Trophy size={36} strokeWidth={1.5} className="text-on-blue/25" />
            <p className="text-on-blue/50">No results have been recorded this season yet.<br />The first race is still waiting to be run.</p>
            <Link to="/races" className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-hi transition-colors">
              View Upcoming Races <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 items-end gap-6 sm:grid-cols-3">
              {ordered.map((result, idx) => (
                <Reveal key={result.id} delay={idx * 80}>
                  <PodiumCard result={result} />
                </Reveal>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link to="/results" className="inline-flex items-center gap-2 border border-on-blue/25 px-6 py-2.5 text-sm font-medium text-on-blue/80 hover:border-gold hover:text-gold transition-colors">
                View All Results <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}