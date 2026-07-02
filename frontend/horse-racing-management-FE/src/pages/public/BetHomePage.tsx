import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Ticket, Trophy, Wallet, ArrowRight, CheckCircle2, Shield, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUpcomingRaces } from '@/hooks/useUpcomingRaces';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import Seo from '@/components/seo/Seo';
import type { Race } from '@/types';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function RaceBetCard({ race }: { race: Race }) {
  return (
    <Link
      to={`/bet/races?date=${race.startTime?.slice(0, 10) ?? ''}`}
      className="group relative overflow-hidden rounded-md border border-rim bg-surface-raised transition hover:border-gold/40 hover:shadow-lg">
      <div className="relative h-36 overflow-hidden bg-surface-overlay">
        {race.bannerImageurl
          ? <img src={race.bannerImageurl} alt={race.raceName}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
          : <div className="h-full w-full bg-navy/40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
        <span className="absolute right-3 top-3 rounded-full bg-gold/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-gold">
          Open
        </span>
      </div>
      <div className="p-4">
        <h3 className="mb-1 font-bold text-ink line-clamp-1 group-hover:text-gold transition-colors">{race.raceName}</h3>
        <p className="text-xs text-ink-3">{formatDate(race.startTime)}</p>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gold">
          Bet Now <ArrowRight size={11} />
        </div>
      </div>
    </Link>
  );
}

const STEPS = [
  {
    n: '01',
    icon: Wallet,
    title: 'Fund Your Wallet',
    desc: 'Deposit funds securely into your Royal Derby account wallet to get started.',
  },
  {
    n: '02',
    icon: Trophy,
    title: 'Choose a Race',
    desc: 'Browse upcoming races, study the odds, and pick the event you want to wager on.',
  },
  {
    n: '03',
    icon: Ticket,
    title: 'Place Your Bet',
    desc: 'Select your horse, enter your stake, and confirm your wager in seconds.',
  },
];

const FEATURES = [
  {
    icon: CheckCircle2,
    title: 'Live Odds',
    desc: 'Real-time odds updated as registration closes and entries are confirmed for each race.',
  },
  {
    icon: Shield,
    title: 'Secure & Licensed',
    desc: 'All transactions are encrypted. Your funds are fully protected at every stage.',
  },
  {
    icon: Star,
    title: 'Instant Payouts',
    desc: 'Winnings are credited to your wallet immediately after race results are declared.',
  },
];

export default function BetHomePage() {
  const { user } = useAuth();
  const { races, loading } = useUpcomingRaces(4);
  const reduce = useReducedMotion();

  const canBet = user?.role === 'USER';
  const betHref = !user ? '/login' : canBet ? '/bet/races' : null;

  return (
    <div className="min-h-screen">
      <Seo title="Bet" description="Place your bets on the finest racehorses competing in the Royal Derby 2026 season." />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy">
        <div className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 24px, rgba(168,132,59,0.05) 24px, rgba(168,132,59,0.05) 25px)' }} />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-3xl" />

        <Container className="relative z-10 py-32 text-center">
          <motion.p
            className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-gold/70"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            Royal Derby · Official Wagering
          </motion.p>
          <motion.h1
            className="mx-auto max-w-4xl font-serif text-5xl font-bold leading-tight text-on-blue sm:text-6xl lg:text-7xl"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}>
            Bet on the World's Finest Racehorses
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-on-blue/60 sm:text-lg"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            Experience the thrill of live horse racing. Analyze the odds, pick your champion,
            and ride the excitement of every race in the Royal Derby 2026 season.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}>
            {betHref ? (
              <Link to={betHref}
                className="inline-flex items-center gap-2 bg-gold px-8 py-4 text-sm font-bold uppercase tracking-widest text-on-gold transition-colors hover:bg-gold-hi">
                <Ticket size={16} /> Bet Now
              </Link>
            ) : user ? (
              <span className="inline-flex cursor-not-allowed items-center gap-2 bg-rim px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink-3">
                <Ticket size={16} /> Betting for USER accounts only
              </span>
            ) : null}
            <Link to="/races"
              className="inline-flex items-center gap-2 border border-on-blue/30 px-8 py-4 text-sm font-bold uppercase tracking-widest text-on-blue/80 transition-colors hover:border-on-blue hover:text-on-blue">
              View Schedule <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div
            className="mt-14 flex flex-wrap items-center justify-center gap-8"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}>
            {['Licensed & Regulated', 'Secure Transactions', 'Instant Payouts', '24/7 Support'].map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs text-on-blue/40">
                <span className="h-1.5 w-1.5 rounded-full bg-gold/50" />
                {t}
              </div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="bg-surface py-28">
        <Container>
          <Reveal>
            <div className="mb-14 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-gold">Simple Process</p>
              <h2 className="font-serif text-4xl font-bold text-ink sm:text-5xl">How It Works</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.n} delay={i * 100}>
                  <div className="relative flex flex-col items-center gap-5 text-center">
                    {i < STEPS.length - 1 && (
                      <div className="absolute left-[calc(50%+3.5rem)] top-8 hidden h-px w-[calc(100%-7rem)] bg-gold/20 sm:block" />
                    )}
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/30 bg-navy">
                      <Icon size={24} className="text-gold" strokeWidth={1.5} />
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-on-gold">
                        {s.n}
                      </span>
                    </div>
                    <div>
                      <h3 className="mb-2 font-serif text-xl font-bold text-ink">{s.title}</h3>
                      <p className="text-sm leading-relaxed text-ink-3">{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Featured Races ───────────────────────────────────────────── */}
      {(loading || races.length > 0) && (
        <section className="bg-surface-raised py-28">
          <Container>
            <Reveal>
              <div className="mb-12 flex items-end justify-between">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-gold">Available Now</p>
                  <h2 className="font-serif text-4xl font-bold text-ink sm:text-5xl">Races Open for Betting</h2>
                </div>
                <Link to="/bet/races"
                  className="hidden items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-gold sm:flex">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse overflow-hidden rounded-md border border-rim bg-surface-raised">
                      <div className="h-36 bg-surface-overlay" />
                      <div className="space-y-2 p-4">
                        <div className="h-4 w-3/4 rounded bg-surface-overlay" />
                        <div className="h-3 w-1/2 rounded bg-surface-overlay" />
                      </div>
                    </div>
                  ))
                : races.slice(0, 4).map((race, i) => (
                    <Reveal key={race.id} delay={i * 70}>
                      <RaceBetCard race={race} />
                    </Reveal>
                  ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Why Bet With Us ──────────────────────────────────────────── */}
      <section className="bg-navy py-28">
        <Container>
          <Reveal>
            <div className="mb-14 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-gold/60">Why Bet With Us</p>
              <h2 className="font-serif text-4xl font-bold text-on-blue sm:text-5xl">A Premium Wagering Experience</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 100}>
                  <div className="rounded-md border border-on-blue/15 bg-on-blue/5 p-8 text-center">
                    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
                      <Icon size={22} className="text-gold" strokeWidth={1.5} />
                    </div>
                    <h3 className="mb-3 font-serif text-xl font-bold text-on-blue">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-on-blue/55">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <section className="bg-surface py-24">
        <Container>
          <Reveal>
            <div className="text-center">
              <h2 className="font-serif text-4xl font-bold text-ink sm:text-5xl">Ready to Place Your Bet?</h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-ink-3">
                Join thousands of racing fans wagering on the Royal Derby. Your first win could be just one race away.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {betHref ? (
                  <Link to={betHref}
                    className="inline-flex items-center gap-2 bg-gold px-10 py-4 text-sm font-bold uppercase tracking-widest text-on-gold transition-colors hover:bg-gold-hi">
                    <Ticket size={15} /> Start Betting
                  </Link>
                ) : !user ? (
                  <Link to="/register"
                    className="inline-flex items-center gap-2 bg-gold px-10 py-4 text-sm font-bold uppercase tracking-widest text-on-gold transition-colors hover:bg-gold-hi">
                    Create Account
                  </Link>
                ) : null}
                <Link to="/races"
                  className="inline-flex items-center gap-2 border border-rim-hi px-10 py-4 text-sm font-bold uppercase tracking-widest text-ink-2 transition-colors hover:border-gold hover:text-gold">
                  View Schedule
                </Link>
              </div>
              <p className="mt-8 text-xs text-ink-4">Please bet responsibly. 18+ only. If gambling affects your life, seek help.</p>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
