import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Clock, ArrowRight, Flag, Ticket } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import TiltCard from '@/components/ui/TiltCard';
import { useUpcomingRaces } from '@/hooks/useUpcomingRaces';
import { useAuth } from '@/context/AuthContext';
import type { Race } from '@/types';

const stagger = {
 hidden: {},
 show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const fadeUp = {
 hidden: { opacity: 0, y: 18 },
 show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 18 } },
};

function fmtDate(iso?: string) {
 if (!iso) return '—';
 return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtTime(iso?: string) {
 if (!iso) return '—';
 return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

interface Countdown { d: number; h: number; m: number; s: number }

function calcCountdown(iso?: string): Countdown | null {
 if (!iso) return null;
 const diff = new Date(iso).getTime() - Date.now();
 if (diff <= 0) return null;
 return {
 d: Math.floor(diff / 86_400_000),
 h: Math.floor((diff % 86_400_000) / 3_600_000),
 m: Math.floor((diff % 3_600_000) / 60_000),
 s: Math.floor((diff % 60_000) / 1_000),
 };
}

function useCountdown(iso?: string) {
 const [cd, setCd] = useState(() => calcCountdown(iso));
 useEffect(() => {
 setCd(calcCountdown(iso));
 const id = setInterval(() => setCd(calcCountdown(iso)), 1000);
 return () => clearInterval(id);
 }, [iso]);
 return cd;
}

function CountCell({ value, unit }: { value: number; unit: string }) {
 return (
 <div className="flex flex-col items-center">
 {/* Oswald font + tabular numbers for the countdown */}
 <span className="tnum text-3xl font-semibold text-gold">{String(value).padStart(2, '0')}</span>
 <span className="font-data mt-0.5 text-[10px] uppercase tracking-wider text-ink-4">{unit}</span>
 </div>
 );
}

function RacecardBoard({ race }: { race: Race | null }) {
 const cd = useCountdown(race?.startTime);

 if (!race) return (
 <div className="flex flex-col items-center justify-center gap-4 border border-rim bg-surface-raised/80 p-10 text-center shadow-modal backdrop-blur-md">
 <Flag size={32} className="text-ink-4" strokeWidth={1.5} />
 <p className="text-sm text-ink-3">No upcoming races scheduled yet.</p>
 <Link to="/races" className="flex items-center gap-1 text-sm font-medium text-gold hover:text-gold-hi transition-colors">
 View all races <ArrowRight size={14} />
 </Link>
 </div>
 );

 return (
 <div className=" rounded-md border border-rim bg-surface-raised/80 p-6 shadow-modal backdrop-blur-md">
 {/* Header */}
 <div className="mb-3 flex items-center justify-between">
 <span className="eyebrow">Next Race</span>
 <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
 Upcoming
 </span>
 </div>

 {/* Race name */}
 <h3 className="mb-4 text-lg font-bold text-ink">{race.raceName}</h3>

 {/* Countdown */}
 {cd && (
 <div className="mb-5 flex items-end justify-center gap-3">
 <CountCell value={cd.d} unit="Days" />
 <span className="mb-4 text-xl font-light text-ink-4">:</span>
 <CountCell value={cd.h} unit="Hrs" />
 <span className="mb-4 text-xl font-light text-ink-4">:</span>
 <CountCell value={cd.m} unit="Min" />
 <span className="mb-4 text-xl font-light text-ink-4">:</span>
 <CountCell value={cd.s ?? 0} unit="Sec" />
 </div>
 )}

 <hr className="mb-4 border-rim" />

 {/* Race details */}
 <ul className="mb-5 space-y-1.5">
 {race.location && (
 <li className="flex items-center gap-2 text-sm text-ink-2">
 <MapPin size={13} className="shrink-0 text-ink-4" />{race.location}
 </li>
 )}
 {race.startTime && (
 <li className="flex items-center gap-2 text-sm text-ink-2">
 <Calendar size={13} className="shrink-0 text-ink-4" />{fmtDate(race.startTime)}
 </li>
 )}
 {race.startTime && (
 <li className="flex items-center gap-2 text-sm text-ink-2">
 <Clock size={13} className="shrink-0 text-ink-4" />{fmtTime(race.startTime)}
 </li>
 )}
 {race.totalprizepool != null && (
 <li className="flex items-center gap-2 text-sm text-ink-2">
 <Trophy size={13} className="shrink-0 text-gold" />
 Prize: ${Number(race.totalprizepool).toLocaleString()}
 </li>
 )}
 </ul>

 {/* CTA */}
 <Link to={`/races/${race.id}`}
 className="flex items-center justify-center gap-2 bg-gold px-4 py-2.5 text-sm font-semibold text-on-gold hover:bg-gold-hi transition-colors">
 View Race Details <ArrowRight size={14} />
 </Link>
 </div>
 );
}

export default function HeroSection() {
 const { races } = useUpcomingRaces(1);
 const nextRace = races[0] ?? null;
 const reduce = useReducedMotion();
 const { user } = useAuth();
 // Betting is USER-only: guests are funneled to login, other roles see no bet CTA.
 const betHref = !user ? '/login' : user.role === 'USER' ? '/bet/races' : null;

 return (
 <section className="relative flex min-h-[calc(100dvh-113px)] items-center overflow-hidden">
 {/* Video background */}
 <video
 src="https://res.cloudinary.com/dxg3w2joa/video/upload/v1782285815/hero_hisssl.mp4"
 className="absolute inset-0 h-full w-full object-cover"
 autoPlay loop muted playsInline aria-hidden="true"
 />
 {/* Gradient overlay — dark navy tint (left-anchored, under the copy) so the video stays visible */}
 <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/85 via-navy-deep/45 to-transparent" />
 <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/50 via-transparent to-transparent" />

 <Container className="relative z-10 py-24">
 <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
 {/* Left — copy */}
 <motion.div
 variants={reduce ? undefined : stagger}
 initial={reduce ? false : 'hidden'}
 animate={reduce ? undefined : 'show'}
 >
 {/* Eyebrow */}
 <motion.div variants={fadeUp} className="mb-6 flex items-center gap-4">
 <div className="h-px w-12 bg-gold" />
 <span className="eyebrow tracking-[0.2em] !text-gold">Royal Derby 2026</span>
 </motion.div>

 {/* h1 — Cormorant Garamond at large display scale */}
 <motion.h1 variants={fadeUp} className="font-serif text-6xl font-bold leading-[1.05] text-on-blue sm:text-7xl lg:text-8xl">
 Glory On<br />
 <em className="not-italic text-gold">The Racetrack</em>
 </motion.h1>

 <motion.p variants={fadeUp} className="mt-8 max-w-lg text-xl leading-relaxed text-on-blue/70">
 Where the proudest steeds and the most talented jockeys compete for
 glory in the world-class Royal Derby tournament.
 </motion.p>

 <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
 {betHref && (
 <Button as={Link} to={betHref} variant="primary" size="lg">
 <Ticket size={18} /> Bet Now
 </Button>
 )}
 <Button as={Link} to="/races" variant={betHref ? 'ghost' : 'primary'} size="lg" className={betHref ? '!border-0 !bg-surface/70 !text-ink backdrop-blur-md hover:!bg-surface/90' : undefined}>
 View Schedule <ArrowRight size={16} />
 </Button>
 </motion.div>
 </motion.div>

 {/* Right — racecard */}
 <div className="hidden lg:flex lg:justify-end">
 <TiltCard className="w-80">
 <RacecardBoard race={nextRace} />
 </TiltCard>
 </div>
 </div>
 </Container>
 </section>
 );
}
