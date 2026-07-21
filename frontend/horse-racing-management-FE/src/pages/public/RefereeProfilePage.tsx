import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, User, BadgeCheck, Quote } from 'lucide-react';
import { useRefereeProfile } from '@/hooks/useRefereeProfile';
import Container from '@/components/ui/Container';
import Seo from '@/components/seo/Seo';

const GOLD = '#d9bc76';

/** One segment of the unified stat bar shown inside the hero */
function StatSegment({
  value,
  label,
  accent = false,
  last = false,
}: {
  value: number | string;
  label: string;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <div className={`px-6 py-4 text-center sm:px-8 ${!last ? 'border-r border-gold/20' : ''}`}>
      <p className={`tnum text-2xl font-bold leading-none ${accent ? 'text-gold' : 'text-white'}`}>{value}</p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-white/50">{label}</p>
    </div>
  );
}

/** Small key/value row used in the Quick Facts sidebar */
function QuickFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-ink-4">{label}</p>
      <p className="text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

/** Avatar with graceful fallback if the image URL is broken or missing, plus a
 *  soft gold radar-ping pulse and a spring pop-in on load. */
function RefereeAvatar({ avatarUrl, name }: { avatarUrl?: string | null; name: string }) {
  const [errored, setErrored] = useState(false);
  const reduce = useReducedMotion();
  const showImage = avatarUrl && !errored;

  return (
    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center sm:h-36 sm:w-36">
      {!reduce && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${GOLD}` }}
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${GOLD}` }}
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 1.1 }}
          />
        </>
      )}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, scale: 0.7 }}
        animate={reduce ? undefined : { opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        className="relative h-full w-full overflow-hidden rounded-full border-4 border-gold/70 bg-navy shadow-xl shadow-black/40 ring-1 ring-black/20"
      >
        {showImage ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold to-gold-hi text-5xl font-bold text-on-gold">
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

export default function RefereeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { referee, loading, error } = useRefereeProfile(id ? Number(id) : undefined);
  const reduce = useReducedMotion();

  if (loading) return (
    <div className="min-h-screen bg-surface pb-20">
      <Container className="py-6"><div className="h-64 animate-pulse bg-surface-overlay" /></Container>
    </div>
  );

  if (!referee) return (
    <div className="min-h-screen bg-surface pb-20">
      <Container className="py-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-gold"><ChevronLeft size={14} /> Home</Link>
        <div className="flex flex-col items-center gap-3 border border-rim bg-surface-overlay py-24 text-center">
          <User size={40} className="text-ink-4" strokeWidth={1.5} />
          <p className="text-sm text-ink-3">{error ?? 'This referee could not be found.'}</p>
        </div>
      </Container>
    </div>
  );

  const races = referee.totalRacesRefereed ?? 0;
  const penalties = referee.totalPenaltiesGiven ?? 0;
  const cleanRate = races > 0 ? Math.round(((races - Math.min(penalties, races)) / races) * 100) : null;

  // Optional fields ΓÇö not all referees will have these yet depending on backend data.
  const stewardLevel = (referee as any).stewardLevel as string | undefined;
  const activeSince = (referee as any).activeSince as string | number | undefined;
  const homeCircuit = (referee as any).homeCircuit as string | undefined;
  const hasQuickFacts = Boolean(stewardLevel || activeSince || homeCircuit);

  const bio = referee.description?.trim();
  const quote = bio ? firstSentence(bio) : null;

  return (
    <div className="min-h-screen bg-surface pb-24">
      <Seo title={referee.name} description={`Referee profile for ${referee.name}.`} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-deep">
        {referee.coverImageUrl && <img src={referee.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        {/* subtle diagonal texture so the hero isn't a flat block of color */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--color-gold, #d4af37) 0, var(--color-gold, #d4af37) 1px, transparent 1px, transparent 24px)' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/85" />

        <Container className="relative z-10 pb-10 pt-8 sm:pb-12">
          <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/80 transition-colors hover:text-gold">
            <ChevronLeft size={14} /> Home
          </Link>

          <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:text-left">
            <RefereeAvatar avatarUrl={referee.avatarUrl} name={referee.name} />

            <div className="flex-1">
              <motion.span
                initial={reduce ? undefined : { opacity: 0, y: -8 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-hi"
              >
                <BadgeCheck size={14} /> Royal Derby Referee
              </motion.span>
              <motion.h1
                initial={reduce ? undefined : { opacity: 0, y: 16 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.45 }}
                className="font-serif text-4xl font-bold uppercase leading-[0.95] text-white sm:text-5xl"
              >
                {referee.name}
              </motion.h1>
              {referee.experienceYears != null && (
                <motion.p
                  initial={reduce ? undefined : { opacity: 0 }}
                  animate={reduce ? undefined : { opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="mt-4 text-sm font-medium text-white/70"
                >
                  {referee.experienceYears} years of experience officiating
                  {homeCircuit ? ` · ${homeCircuit} circuit` : ''}
                </motion.p>
              )}

              {/* Unified stat bar — replaces the three separate floating cards */}
              <motion.div
                initial={reduce ? undefined : { opacity: 0, y: 16 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.45 }}
                className="mt-6 inline-flex divide-gold/20 overflow-hidden rounded-lg border border-gold/25 bg-white/[0.03]"
              >
                <StatSegment value={races} label="Races Refereed" />
                <StatSegment value={penalties} label="Penalties Issued" />
                {cleanRate != null && <StatSegment value={`${cleanRate}%`} label="Clean Record" accent last />}
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* Body: biography + quick facts sidebar */}
      <Container className="pt-12">
        <div className={`mx-auto max-w-5xl gap-12 ${hasQuickFacts ? 'grid grid-cols-1 lg:grid-cols-[1fr_240px]' : 'max-w-3xl'}`}>
          <section>
            <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-ink">Biography</h2>
            <div className="mb-6 mt-2 h-0.5 w-9 bg-gold" />

            {bio ? (
              <>
                {quote && (
                  <div className="mb-6 flex gap-3 border-l-2 border-gold pl-5">
                    <Quote size={18} className="mt-1 shrink-0 text-gold/60" />
                    <p className="font-serif text-xl italic leading-snug text-ink">{quote}</p>
                  </div>
                )}
                <p className="max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{bio}</p>
              </>
            ) : (
              <p className="text-sm text-ink-4">No biography provided yet.</p>
            )}
          </section>

          {hasQuickFacts && (
            <aside className="border-t border-rim pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-ink-4">Quick facts</p>
              <div className="space-y-4">
                {stewardLevel && <QuickFact label="Steward level" value={stewardLevel} />}
                {activeSince && <QuickFact label="Active since" value={String(activeSince)} />}
                {homeCircuit && <QuickFact label="Home circuit" value={homeCircuit} />}
              </div>
            </aside>
          )}
        </div>
      </Container>
    </div>
  );
}