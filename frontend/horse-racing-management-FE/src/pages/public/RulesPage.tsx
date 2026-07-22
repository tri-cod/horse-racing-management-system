import { Link } from 'react-router-dom';
import { ClipboardList, ShieldCheck, Gavel, Coins, Trophy, ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Seo from '@/components/seo/Seo';
import Reveal from '@/components/ui/Reveal';

interface RuleSection {
  icon: typeof ClipboardList;
  title: string;
  points: string[];
}

const SECTIONS: RuleSection[] = [
  {
    icon: ClipboardList,
    title: 'Registration & Eligibility',
    points: [
      'A horse must have an assigned trainer before it can be entered into any race.',
      'Entries close at the race\'s registration deadline — after that, no new horses or jockey changes are accepted.',
      'Each horse may only run in one race per calendar day.',
      'A jockey may not be booked to ride two horses in the same race.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Pre-Race Inspection',
    points: [
      'The assigned referee must clear every approved horse before a race can start — unfit horses, missing jockeys, or unset odds all block the start.',
      'Horses flagged as inactive or retired are not fit to race and will be withheld.',
      'A referee may tick a horse "OK" only after a direct, in-person check on race day.',
    ],
  },
  {
    icon: Gavel,
    title: 'Race Day Conduct & Penalties',
    points: [
      'Referees may issue a Warning, Time Penalty, Fine, or Disqualification for any rule violation observed during the race.',
      'A disqualified horse is removed from the results and its jockey forfeits any prize claim for that race.',
      'Fines are deducted directly from the horse owner\'s wallet at the time the penalty is issued.',
      'Referees may cancel a penalty they issued in error; disqualifications and fines are reversed accordingly.',
    ],
  },
  {
    icon: Coins,
    title: 'Betting Rules',
    points: [
      'Betting opens only once every approved horse has odds set, and closes the moment the race starts.',
      'All wagers are final once placed — bets cannot be edited or cancelled after submission.',
      'Payouts are calculated automatically the moment official results are recorded.',
    ],
  },
  {
    icon: Trophy,
    title: 'Prize Distribution',
    points: [
      'The prize pool is split 50% / 30% / 20% between 1st, 2nd and 3rd place. Horses finishing outside the top 3 do not earn a share.',
      'Each horse\'s winnings are split between its owner and jockey according to the revenue share agreed when the jockey was booked.',
      'Disqualified horses forfeit any prize share for that race.',
    ],
  },
];

export default function RulesPage() {
  return (
    <div>
      <Seo
        title="Rules & Regulations"
        description="Registration, pre-race inspection, race day conduct, betting and prize distribution rules for Royal Derby."
      />

      {/* Header band */}
      <section className="border-b border-rim bg-navy">
        <Container className="py-20">
          <p className="eyebrow mb-4 tracking-[0.2em] text-gold">Royal Derby</p>
          <h1 className="max-w-2xl font-serif text-4xl font-bold leading-[1.05] text-on-blue sm:text-5xl">
            Rules &amp; Regulations
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-on-blue/70">
            The standards every horse, jockey, owner and referee races under — from entry
            to the winner's circle.
          </p>
        </Container>
      </section>

      {/* Sections */}
      <section className="bg-surface py-24">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col gap-14">
            {SECTIONS.map(({ icon: Icon, title, points }, i) => (
              <Reveal key={title} delay={i * 60}>
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-xl font-bold text-ink sm:text-2xl">{title}</h2>
                    <ul className="mt-4 space-y-2.5 border-t border-rim pt-4">
                      {points.map((p) => (
                        <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-ink-3">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA band */}
      <section className="bg-navy py-20">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-2xl font-bold text-on-blue sm:text-3xl">Questions about a ruling?</h2>
              <p className="mt-2 max-w-md text-sm text-on-blue/65">
                Reach out and our race office will walk you through it.
              </p>
            </div>
            <Button as={Link} to="/contact" variant="primary" size="lg" className="shrink-0">
              Contact Us <ArrowRight size={16} />
            </Button>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
