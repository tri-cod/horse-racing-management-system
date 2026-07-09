import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, Crown } from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';
import { useLatestFinishedRace } from '@/hooks/useLatestFinishedRace';
import { useRaceResults, type NormalizedRaceResult } from '@/hooks/useRaceResults';

// Display order left-to-right: 2nd, 1st, 3rd — classic podium arrangement.
const PODIUM_ORDER = [2, 1, 3];

const PODIUM_STYLES: Record<number, { riser: string; riserHeight: string; numberCls: string; label: string; glow: string }> = {
  1: { riser: 'bg-gradient-to-b from-gold to-gold-hi', riserHeight: 'h-28', numberCls: 'text-on-gold', label: '1st', glow: 'shadow-[0_0_50px_-5px_rgba(198,161,75,0.5)]' },
  2: { riser: 'bg-gradient-to-b from-on-blue/35 to-on-blue/15', riserHeight: 'h-20', numberCls: 'text-on-blue', label: '2nd', glow: '' },
  3: { riser: 'bg-gradient-to-b from-[#a9713c] to-[#7a4f27]', riserHeight: 'h-14', numberCls: 'text-white', label: '3rd', glow: '' },
};

function PodiumStepSkeleton({ height }: { height: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0">
      <div className="mb-3 h-32 w-full animate-pulse rounded-md bg-on-blue/5" />
      <div className={`w-full animate-pulse rounded-t-sm bg-on-blue/10 ${height}`} />
    </div>
  );
}

function PodiumStep({ result }: { result: NormalizedRaceResult }) {
  const style = PODIUM_STYLES[result.position] ?? PODIUM_STYLES[3];
  const isWinner = result.position === 1;

  return (
    <div className="flex flex-1 flex-col items-center">
      {/* Info card */}
      <div className={`mb-3 flex w-full flex-col items-center gap-1.5 border px-4 py-6 text-center transition ${
        isWinner ? 'border-gold/30 bg-navy-deep' : 'border-on-blue/10 bg-navy-deep'
      }`}>
        {isWinner && <Crown size={18} className="mb-1 text-gold" strokeWidth={1.75} />}
        <h3 className={`font-serif font-bold uppercase leading-tight text-on-blue ${isWinner ? 'text-2xl' : 'text-lg'}`}>
          {result.horseName}
        </h3>
        <p className="text-xs text-on-blue/55">Ridden by {result.jockeyName}</p>
        {result.time && <p className="tnum text-xs text-on-blue/35">{result.time}</p>}
      </div>

      {/* Podium riser */}
      <div className={`flex w-full items-center justify-center rounded-t-sm ${style.riser} ${style.riserHeight} ${style.glow}`}>
        <span className={`font-serif text-4xl font-bold ${style.numberCls}`}>{result.position}</span>
      </div>
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
          <div className="mx-auto flex max-w-2xl items-end gap-4 sm:gap-6">
            <PodiumStepSkeleton height="h-20" />
            <PodiumStepSkeleton height="h-28" />
            <PodiumStepSkeleton height="h-14" />
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
            <div className="mx-auto flex max-w-2xl items-end gap-4 sm:gap-6">
              {ordered.map((result, idx) => (
                <Reveal key={result.id} delay={idx * 80} className="flex flex-1">
                  <PodiumStep result={result} />
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