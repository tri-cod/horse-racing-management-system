import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, User } from 'lucide-react';
import { useJockeyProfile } from '@/hooks/useJockeyProfile';
import { silkColor } from '@/utils/jockeySilks';
import Container from '@/components/ui/Container';
import Seo from '@/components/seo/Seo';
import type { Jockey } from '@/types';

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
  const { age, experienceYear, totalRaces, totalWins, winRate, status } = jockey;
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

  const { jockey, loading, error } = useJockeyProfile(jockeyId);
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
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${silk}, ${silk}b3)` }}>
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.08)_0px_2px,transparent_2px_46px)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/45" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(255,255,255,0.18),transparent_55%)]" />

        <Container className="relative z-10 py-10 sm:py-14">
          <Link to="/jockeys" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-white/75 transition-colors hover:text-white">
            <ChevronLeft size={14} /> All Jockeys
          </Link>

          <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div>
              {jockey.status && (
                <span className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm">
                  {jockey.status}
                </span>
              )}
              {first && <p className="font-serif text-2xl italic leading-tight text-white/70">{first}</p>}
              <h1 className="font-serif text-5xl font-bold uppercase leading-[0.95] text-white sm:text-7xl">{last}</h1>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium text-white/85 sm:justify-start">
                {jockey.age != null && <span>{jockey.age} yrs</span>}
                {jockey.age != null && jockey.experienceYear != null && <span className="text-white/40">|</span>}
                {jockey.experienceYear != null && <span>{pluralize(jockey.experienceYear, 'yr')} experience</span>}
                <span className="text-white/40">|</span>
                <span className="tnum">№{jockey.id}</span>
              </div>
            </div>

            {/* Portrait — real photo or a large monogram badge in the jockey's silk color */}
            <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/25 bg-white/10 shadow-2xl sm:h-48 sm:w-48">
              {jockey.avatarUrl ? (
                <img src={jockey.avatarUrl} alt={jockey.name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-serif text-7xl font-bold text-white/90">{initial}</span>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <div className="mx-auto max-w-2xl space-y-12">

          {/* ── Career Stats ─────────────────────────────────────────── */}
          {statRows.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-ink">Career Stats</h2>
              <div className="mb-6 mt-2 h-px w-12 bg-gold" />
              <div className="divide-y divide-white/10 border border-navy bg-navy px-6">
                {statRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-4">
                    <span className="text-sm text-on-blue/60">{row.label}</span>
                    <span className="tnum text-2xl font-bold text-on-blue">{row.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Biography ────────────────────────────────────────────── */}
          <section>
            <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-ink">Biography</h2>
            <div className="mb-6 mt-2 h-px w-12 bg-gold" />
            <div className="space-y-4">
              {(jockey.description ? [jockey.description] : bio).map((p, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-ink-2">{p}</p>
              ))}
            </div>
          </section>

        </div>
      </Container>
    </div>
  );
}
