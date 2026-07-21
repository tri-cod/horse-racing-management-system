import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, User, Flag, Trophy, Percent, type LucideIcon } from 'lucide-react';
import { useJockeyProfile } from '@/hooks/useJockeyProfile';
import { silkColor } from '@/utils/jockeySilks';
import { calculateAge } from '@/utils/age';
import Container from '@/components/ui/Container';
import Seo from '@/components/seo/Seo';
import ReportButton from '@/components/features/report/ReportButton';
import type { Jockey } from '@/types';

// Chiều cao header cố định của site (Layout.tsx: pt-[113px]).
const HEADER_HEIGHT = 113;
// Header + sub-nav — các section trong trang này cần trừ hao khoảng này khi
// cuộn tới, kẻo bị header + sub-nav che mất.
const SCROLL_OFFSET = 172;

const STAT_ICONS: Record<string, LucideIcon> = {
  'Races Entered': Flag,
  'Career Wins': Trophy,
  'Win Rate': Percent,
};

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: '', last: parts[0] };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

function pluralize(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

// Chỉ dựng câu văn từ field thật sự có trên jockey — không bịa thành tích
// hay số liệu không tồn tại trong dữ liệu (vd. không có "podiums"/"poles"
// cho jockey, khác với F1 driver).
function buildBio(jockey: Jockey): string[] {
  const firstName = jockey.name.trim().split(/\s+/)[0];
  const { experienceYear, totalRaces, totalWins, winRate, status } = jockey;
  const age = calculateAge(jockey.dateOfBirth);
  const paragraphs: string[] = [];

  const introParts: string[] = [];
  if (experienceYear) introParts.push(`${pluralize(experienceYear, 'year')} of racing experience`);
  if (age) introParts.push(`now ${age} years of age`);
  paragraphs.push(
    introParts.length
      ? `${jockey.name} brings ${introParts.join(' and is ')} to every start on the Royal Derby circuit.`
      : `${jockey.name} is a competitor on the Royal Derby circuit, known for a disciplined, focused approach in the saddle.`,
  );

  if (totalRaces != null && totalWins != null) {
    const pct = winRate != null
      ? Math.round(winRate <= 1 ? winRate * 100 : winRate)
      : totalRaces > 0 ? Math.round((totalWins / totalRaces) * 100) : null;
    paragraphs.push(
      `Across ${pluralize(totalRaces, 'race')}, ${firstName} has claimed the win ${pluralize(totalWins, 'time')}` +
      (pct != null ? `, a strike rate of ${pct}% that places ${firstName} among the circuit's most consistent riders.` : '.'),
    );
  } else if (totalRaces != null) {
    paragraphs.push(`${firstName} has taken to the track in ${pluralize(totalRaces, 'race')} so far, building race craft with every outing.`);
  }

  if (status) {
    const isActive = status.toLowerCase() === 'active';
    paragraphs.push(
      `Currently listed as ${isActive ? 'an active rider' : status.toLowerCase()}, ${firstName} continues to be a name to watch heading into the next meeting at Royal Derby.`,
    );
  }

  return paragraphs;
}

export default function JockeyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const jockeyId = id ? Number(id) : undefined;
  const reduce = useReducedMotion();

  const { jockey, loading, error } = useJockeyProfile(jockeyId);
  const age = useMemo(() => calculateAge(jockey?.dateOfBirth), [jockey]);
  const silk = useMemo(() => (jockey ? silkColor(jockey) : null), [jockey]);
  const { first, last } = jockey ? splitName(jockey.name) : { first: '', last: '' };
  const initial = (last || jockey?.name || 'J').charAt(0).toUpperCase();
  const bio = useMemo(() => (jockey ? buildBio(jockey) : []), [jockey]);

  const statRows = jockey
    ? [
        jockey.totalRaces != null && { label: 'Races Entered', value: String(jockey.totalRaces) },
        jockey.totalWins != null && { label: 'Career Wins', value: String(jockey.totalWins) },
        jockey.winRate != null && {
          label: 'Win Rate',
          value: `${Math.round(jockey.winRate <= 1 ? jockey.winRate * 100 : jockey.winRate)}%`,
        },
      ].filter((r): r is { label: string; value: string } => !!r)
    : [];

  const sections = useMemo(
    () => [
      statRows.length > 0 && { id: 'stats', label: 'Statistics' },
      { id: 'biography', label: 'Biography' },
    ].filter((s): s is { id: string; label: string } => !!s),
    [statRows.length],
  );

  const [activeSection, setActiveSection] = useState(sections[0]?.id);
  useEffect(() => setActiveSection(sections[0]?.id), [sections]);

  useEffect(() => {
    if (sections.length < 2) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
      },
      { rootMargin: `-${SCROLL_OFFSET}px 0px -60% 0px`, threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <Container className="py-6">
          <div className="h-64 animate-pulse rounded-md bg-surface-overlay" />
        </Container>
      </div>
    );
  }

  if (!jockey) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <Container className="py-6">
          <Link to="/jockeys" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-gold transition-colors">
            <ChevronLeft size={14} /> Back to Jockeys
          </Link>
          <div className="flex flex-col items-center gap-3 rounded-md border border-rim bg-surface-overlay py-24 text-center">
            <User size={40} className="text-ink-4" strokeWidth={1.5} />
            <p className="text-sm text-ink-3">{error ?? 'This jockey could not be found.'}</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <Seo title={jockey.name} description={`Jockey profile and career stats for ${jockey.name}.`} />

      {/* ── Hero — silk-colored banner unique to this jockey ────────────── */}
      <section
        className="relative overflow-hidden bg-navy-deep"
        style={jockey.coverImageUrl ? undefined : { background: `linear-gradient(135deg, ${silk}, ${silk}b3)` }}
      >
        {jockey.coverImageUrl ? (
          <img src={jockey.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.08)_0px_2px,transparent_2px_46px)]" />
        )}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${jockey.coverImageUrl ? 'from-black/20 via-black/30 to-black/70' : 'from-black/0 via-black/10 to-black/50'}`} />
        {!jockey.coverImageUrl && (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(255,255,255,0.18),transparent_55%)]" />
        )}

        <Container className="relative z-10 pt-10 sm:pt-16">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/jockeys" className="inline-flex items-center gap-1.5 text-sm font-medium text-white/75 transition-colors hover:text-white">
              <ChevronLeft size={14} /> All Jockeys
            </Link>
            {jockey.userId != null && (
              <ReportButton
                targetType="USER"
                targetId={jockey.userId}
                targetName={jockey.name}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 transition-colors hover:text-fail"
              />
            )}
          </div>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left"
          >
            {/* Portrait — real photo or a large monogram badge in the jockey's silk color */}
            <div className="flex h-64 w-64 shrink-0 items-center justify-center overflow-hidden sm:h-80 sm:w-80 sm:ml-[10px]">
              {jockey.avatarUrl ? (
                <img src={jockey.avatarUrl} alt={jockey.name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-serif text-7xl font-bold text-white/90 sm:text-8xl">{initial}</span>
              )}
            </div>

            <div className="sm:self-center">
              <span className="mb-3 block text-xs font-bold uppercase tracking-[0.25em] text-white/65">Royal Derby Jockey</span>

              {first && <p className="font-serif text-3xl italic leading-tight text-white/70">{first}</p>}
              <h1 className="font-serif text-6xl font-bold uppercase leading-[0.95] text-white sm:text-8xl">{last}</h1>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-base font-medium text-white/85 sm:justify-start">
                {age != null && <span>{age} yrs old</span>}
                {age != null && jockey.experienceYear != null && <span className="text-white/40">•</span>}
                {jockey.experienceYear != null && <span>{pluralize(jockey.experienceYear, 'yr')} experience</span>}
                <span className="text-white/40">•</span>
                <span className="tnum">№{jockey.id}</span>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ── Sub-nav — sticky section jumper, F1-profile style ───────────── */}
      {sections.length > 1 && (
        <div className="sticky z-20 border-b border-rim bg-surface/95 backdrop-blur-sm" style={{ top: HEADER_HEIGHT }}>
          <Container>
            <nav className="flex gap-6">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => jumpTo(s.id)}
                  className={`border-b-2 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
                    activeSection === s.id ? 'border-gold text-ink' : 'border-transparent text-ink-4 hover:text-ink-2'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </Container>
        </div>
      )}

      <Container className="py-14">
        <div className="mx-auto max-w-3xl space-y-16">

          {/* ── Career Stats — F1-driver-page style: label left, value right, thin dividers ── */}
          {statRows.length > 0 && (
            <section id="stats" style={{ scrollMarginTop: SCROLL_OFFSET }}>
              <h2 className="font-serif text-3xl font-bold uppercase tracking-tight text-ink">Career Statistics</h2>

              <div className="mt-6 border-t border-rim">
                {statRows.map((row, i) => {
                  const Icon = STAT_ICONS[row.label] ?? Flag;
                  return (
                    <motion.div
                      key={row.label}
                      initial={reduce ? undefined : { opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      className="flex items-center justify-between border-b border-rim py-4"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-ink-3">
                        <Icon size={14} className="shrink-0 text-ink-4" style={{ color: silk ?? undefined }} />
                        {row.label}
                      </span>
                      <span className="tnum text-2xl font-bold text-ink sm:text-3xl">{row.value}</span>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Biography ────────────────────────────────────────────── */}
          <section id="biography" className="relative" style={{ scrollMarginTop: SCROLL_OFFSET }}>
            {/* Watermark số hiệu jockey, gợi phong cách tạp chí thể thao */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-4 -top-10 select-none font-serif text-[180px] font-black leading-none opacity-[0.04] sm:text-[220px]"
              style={{ color: silk ?? undefined }}
            >
              {jockey.id}
            </span>

            <h2 className="relative font-serif text-3xl font-bold uppercase tracking-tight text-ink">Biography</h2>

            <div className="relative mt-6 max-w-prose space-y-4">
              {(jockey.description ? [jockey.description] : bio).map((p, i) => (
                <p key={i} className={i === 0 ? 'text-lg font-medium leading-relaxed text-ink' : 'text-[15px] leading-relaxed text-ink-2'}>
                  {p}
                </p>
              ))}
            </div>
          </section>

        </div>
      </Container>
    </div>
  );
}
