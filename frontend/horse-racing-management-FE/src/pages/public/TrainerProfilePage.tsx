import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, User, Trophy, Flag, TrendingUp, Rabbit, Dumbbell } from 'lucide-react';
import { useTrainerPublicProfile } from '@/hooks/useTrainerPublicProfile';
import { silkColor } from '@/utils/jockeySilks';
import { calculateAge } from '@/utils/age';
import Container from '@/components/ui/Container';
import Seo from '@/components/seo/Seo';
import type { TrainerHorse } from '@/types';

function TrophyStat({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Trophy;
  value: number | string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-1 items-center gap-3 px-5 py-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}22`, color }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="tnum text-xl font-bold leading-none text-white">{value}</p>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">{label}</p>
      </div>
    </div>
  );
}

function TrainerAvatar({ avatarUrl, name, color }: { avatarUrl?: string | null; name: string; color: string }) {
  const [errored, setErrored] = useState(false);
  const reduce = useReducedMotion();
  const showImage = avatarUrl && !errored;

  return (
    <div className="relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, scale: 0.7 }}
        animate={reduce ? undefined : { opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        className="relative h-full w-full overflow-hidden rounded-full border-4 bg-navy shadow-xl shadow-black/40"
        style={{ borderColor: color, boxShadow: `0 0 0 4px ${color}33, 0 20px 40px -10px rgba(0,0,0,0.5)` }}
      >
        {showImage ? (
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" onError={() => setErrored(true)} />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-5xl font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </motion.div>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-ok-subtle text-ok',
  RACING: 'bg-gold/15 text-gold',
  FINISHED: 'bg-navy/10 text-navy',
  INACTIVE: 'bg-surface-overlay text-ink-4',
  RETIRED: 'bg-surface-overlay text-ink-4',
};

function RosterCard({ horse, color, index }: { horse: TrainerHorse; color: string; index: number }) {
  const reduce = useReducedMotion();
  const status = horse.status?.toUpperCase();

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index, 6) * 0.05, duration: 0.35 }}
    >
      <Link
        to={`/horses/${horse.horseId}`}
        className="group flex h-full flex-col overflow-hidden border border-rim bg-surface-raised shadow-sm transition-shadow hover:shadow-lg"
      >
        <div className="h-1 w-full shrink-0" style={{ backgroundColor: color }} />
        <div className="flex flex-1 items-center gap-3 p-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-rim bg-surface-overlay">
            {horse.avatarUrl ? (
              <img src={horse.avatarUrl} alt={horse.horseName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-4">
                <Rabbit size={22} strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-base font-bold text-ink transition-colors group-hover:text-gold-hi">
              {horse.horseName}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {horse.breed && <span className="truncate text-xs text-ink-4">{horse.breed}</span>}
              {status && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] ?? 'bg-surface-overlay text-ink-4'}`}>
                  {status}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function TrainerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { trainer, horses, loading, error } = useTrainerPublicProfile(id ? Number(id) : undefined);
  const reduce = useReducedMotion();

  const color = useMemo(
    () => silkColor({ id: trainer?.trainerId, name: trainer?.name ?? '' }),
    [trainer?.trainerId, trainer?.name],
  );
  const age = useMemo(() => calculateAge(trainer?.dateOfBirth), [trainer?.dateOfBirth]);

  if (loading) return (
    <div className="min-h-screen bg-surface pb-20">
      <Container className="py-6"><div className="h-64 animate-pulse bg-surface-overlay" /></Container>
    </div>
  );

  if (!trainer) return (
    <div className="min-h-screen bg-surface pb-20">
      <Container className="py-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-gold"><ChevronLeft size={14} /> Home</Link>
        <div className="flex flex-col items-center gap-3 border border-rim bg-surface-overlay py-24 text-center">
          <User size={40} className="text-ink-4" strokeWidth={1.5} />
          <p className="text-sm text-ink-3">{error ?? 'This trainer could not be found.'}</p>
        </div>
      </Container>
    </div>
  );

  const totalHorses = trainer.totalHorses ?? 0;
  const totalRaces = trainer.totalRaces ?? 0;
  const totalWins = trainer.totalWins ?? 0;
  const winRate = trainer.winRate ?? 0;
  const winRatePct = Math.round(winRate <= 1 ? winRate * 100 : winRate);

  const bio = trainer.description?.trim();
  const name = trainer.name ?? `Trainer #${trainer.trainerId}`;

  return (
    <div className="min-h-screen bg-surface pb-24">
      <Seo title={name} description={`Trainer profile and career stats for ${name}.`} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-deep">
        {trainer.coverImageUrl && <img src={trainer.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/90" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[5px]" style={{ backgroundColor: color }} />

        <span className="absolute right-5 top-6 z-10 hidden rounded-full bg-black/40 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white/50 backdrop-blur-sm sm:block">
          Trainer №{trainer.trainerId}
        </span>

        <Container className="relative z-10 pb-10 pt-8 sm:pb-12">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/80 transition-colors hover:text-gold">
              <ChevronLeft size={14} /> Home
            </Link>
          </div>

          <div className="flex flex-col items-center text-center">
            <TrainerAvatar avatarUrl={trainer.avatarUrl} name={name} color={color} />

            <motion.span
              initial={reduce ? undefined : { opacity: 0, y: -8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mt-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]"
              style={{ borderColor: `${color}66`, backgroundColor: `${color}1a`, color }}
            >
              <Dumbbell size={14} /> Royal Derby Trainer
            </motion.span>

            <motion.h1
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.45 }}
              className="mt-3 font-serif text-4xl font-bold uppercase leading-[0.95] text-white sm:text-5xl"
            >
              {name}
            </motion.h1>

            <motion.p
              initial={reduce ? undefined : { opacity: 0 }}
              animate={reduce ? undefined : { opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-medium text-white/60"
            >
              {age != null && <span>{age} yrs old</span>}
              {age != null && trainer.experienceYears != null && <span className="text-white/30">•</span>}
              {trainer.experienceYears != null && (
                <span>{trainer.experienceYears} yr{trainer.experienceYears !== 1 ? 's' : ''} experience</span>
              )}
            </motion.p>

            {/* Career stats row */}
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.45 }}
              className="mx-auto mt-6 flex max-w-lg flex-wrap divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] sm:flex-nowrap sm:divide-x sm:divide-y-0"
            >
              <TrophyStat icon={Rabbit} value={totalHorses} label="Horses" color={color} />
              <TrophyStat icon={Flag} value={totalRaces} label="Races" color={color} />
              <TrophyStat icon={Trophy} value={totalWins} label="Wins" color={color} />
              <TrophyStat icon={TrendingUp} value={`${winRatePct}%`} label="Win Rate" color={color} />
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Body: bio + current roster */}
      <Container className="pt-12">
        <div className="mx-auto max-w-5xl">
          <section>
            <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-ink">About the Trainer</h2>
            <div className="mb-6 mt-2 h-0.5 w-9" style={{ backgroundColor: color }} />

            {bio ? (
              <p className="max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{bio}</p>
            ) : (
              <p className="text-sm text-ink-4">No trainer biography provided yet.</p>
            )}
          </section>

          {horses.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-ink">Current Roster</h2>
              <div className="mb-6 mt-2 h-0.5 w-9" style={{ backgroundColor: color }} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {horses.map((h, i) => <RosterCard key={h.horseId} horse={h} color={color} index={i} />)}
              </div>
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}
