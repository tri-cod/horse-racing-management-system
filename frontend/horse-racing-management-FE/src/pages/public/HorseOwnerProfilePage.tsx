import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, User, Trophy, Flag, TrendingUp, Rabbit, Quote } from 'lucide-react';
import { useHorseOwnerProfile } from '@/hooks/useHorseOwnerProfile';
import { silkColor } from '@/utils/jockeySilks';
import Container from '@/components/ui/Container';
import Seo from '@/components/seo/Seo';
import type { HorseOwnerHorseSummary } from '@/types';

/** One stat in the trophy-cabinet row — icon first, number second. Distinct from
 *  the referee page's plain number segments, this reads more like a stable's honours board. */
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

/** Avatar with a stable-colour ring and a soft radar-ping pulse behind it — ties
 *  the owner's identity colour into their portrait, the same way a jockey's
 *  silks colour their card, with a bit of life instead of a static ring. */
function OwnerAvatar({ avatarUrl, name, color }: { avatarUrl?: string | null; name: string; color: string }) {
  const [errored, setErrored] = useState(false);
  const reduce = useReducedMotion();
  const showImage = avatarUrl && !errored;

  return (
    <div className="relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
      {!reduce && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${color}` }}
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${color}` }}
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 1.1 }}
          />
        </>
      )}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, scale: 0.7 }}
        animate={reduce ? undefined : { opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        className="relative h-full w-full overflow-hidden rounded-full border-4 bg-navy shadow-xl shadow-black/40"
        style={{ borderColor: color, boxShadow: `0 0 0 4px ${color}33, 0 20px 40px -10px rgba(0,0,0,0.5)` }}
      >
        {showImage ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setErrored(true)}
          />
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

/** Pulls the first sentence of the biography to use as an editorial pull-quote */
function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?](?=\s|$)/);
  return (match ? match[0] : text).trim();
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-ok-subtle text-ok',
  RACING: 'bg-gold/15 text-gold',
  FINISHED: 'bg-navy/10 text-navy',
  INACTIVE: 'bg-surface-overlay text-ink-4',
  RETIRED: 'bg-surface-overlay text-ink-4',
};

function RosterCard({ horse, color, index }: { horse: HorseOwnerHorseSummary; color: string; index: number }) {
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
        to={`/horses/${horse.id}`}
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

export default function HorseOwnerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { owner, loading, error } = useHorseOwnerProfile(id ? Number(id) : undefined);
  const reduce = useReducedMotion();

  const color = useMemo(
    () => silkColor({ id: owner?.ownerId, name: owner?.name ?? '' }),
    [owner?.ownerId, owner?.name],
  );

  if (loading) return (
    <div className="min-h-screen bg-surface pb-20">
      <Container className="py-6"><div className="h-64 animate-pulse bg-surface-overlay" /></Container>
    </div>
  );

  if (!owner) return (
    <div className="min-h-screen bg-surface pb-20">
      <Container className="py-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-gold"><ChevronLeft size={14} /> Home</Link>
        <div className="flex flex-col items-center gap-3 border border-rim bg-surface-overlay py-24 text-center">
          <User size={40} className="text-ink-4" strokeWidth={1.5} />
          <p className="text-sm text-ink-3">{error ?? 'This horse owner could not be found.'}</p>
        </div>
      </Container>
    </div>
  );

  const totalHorses = owner.totalHorses ?? 0;
  const totalRaces = owner.totalRaces ?? 0;
  const totalWins = owner.totalWins ?? 0;
  const winRate = owner.winRate ?? 0;

  const bio = owner.description?.trim();
  const quote = bio ? firstSentence(bio) : null;
  const horses = owner.horses ?? [];

  return (
    <div className="min-h-screen bg-surface pb-24">
      <Seo title={owner.name} description={`Racing stable profile for ${owner.name}.`} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-deep">
        {owner.coverImageUrl && <img src={owner.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/90" />
        {/* Stable colour signature — same visual language as a jockey's racing silks */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[5px]" style={{ backgroundColor: color }} />

        {/* Stable number, top-right corner — team-card touch */}
        <span className="absolute right-5 top-6 z-10 hidden rounded-full bg-black/40 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white/50 backdrop-blur-sm sm:block">
          Stable №{owner.ownerId}
        </span>

        <Container className="relative z-10 pb-10 pt-8 sm:pb-12">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/80 transition-colors hover:text-gold">
              <ChevronLeft size={14} /> Home
            </Link>
          </div>

          <div className="flex flex-col items-center text-center">
            <OwnerAvatar avatarUrl={owner.avatarUrl} name={owner.name} color={color} />

            <motion.span
              initial={reduce ? undefined : { opacity: 0, y: -8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mt-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]"
              style={{ borderColor: `${color}66`, backgroundColor: `${color}1a`, color }}
            >
              <Trophy size={14} /> Racing Stable
            </motion.span>

            <motion.h1
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.45 }}
              className="mt-3 font-serif text-4xl font-bold uppercase leading-[0.95] text-white sm:text-5xl"
            >
              {owner.name}
            </motion.h1>

            <motion.p
              initial={reduce ? undefined : { opacity: 0 }}
              animate={reduce ? undefined : { opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-white/60"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              Racing Colours
            </motion.p>

            {/* Trophy cabinet stat row */}
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.45 }}
              className="mx-auto mt-6 flex max-w-lg flex-wrap divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] sm:flex-nowrap sm:divide-x sm:divide-y-0"
            >
              <TrophyStat icon={Rabbit} value={totalHorses} label="Horses" color={color} />
              <TrophyStat icon={Flag} value={totalRaces} label="Races" color={color} />
              <TrophyStat icon={Trophy} value={totalWins} label="Wins" color={color} />
              <TrophyStat icon={TrendingUp} value={`${Math.round(winRate)}%`} label="Win Rate" color={color} />
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Body: about the stable + roster */}
      <Container className="pt-12">
        <div className="mx-auto max-w-5xl">
          <section>
            <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-ink">About the Stable</h2>
            <div className="mb-6 mt-2 h-0.5 w-9" style={{ backgroundColor: color }} />

            {bio ? (
              <>
                {quote && (
                  <div className="mb-6 flex gap-3 border-l-2 pl-5" style={{ borderColor: color }}>
                    <Quote size={18} className="mt-1 shrink-0 opacity-60" style={{ color }} />
                    <p className="font-serif text-xl italic leading-snug text-ink">{quote}</p>
                  </div>
                )}
                <p className="max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{bio}</p>
              </>
            ) : (
              <p className="text-sm text-ink-4">No stable biography provided yet.</p>
            )}
          </section>

          {horses.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-ink">Stable Roster</h2>
              <div className="mb-6 mt-2 h-0.5 w-9" style={{ backgroundColor: color }} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {horses.map((h, i) => <RosterCard key={h.id} horse={h} color={color} index={i} />)}
              </div>
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}
