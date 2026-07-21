import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, Rabbit, Trophy, Flag, Wallet, MapPin, Calendar, Award, Sparkles,
  Venus, Mars, Weight, Gauge, GraduationCap, Palette, ArrowRight,
} from 'lucide-react';
import { useHorseProfile } from '@/hooks/useHorseProfile';
import { useHorseRaceHistory } from '@/hooks/useHorseRaceHistory';
import { getHorseById } from '@/api/horseOwnerApi';
import Container from '@/components/ui/Container';
import Seo from '@/components/seo/Seo';
import StatCard from '@/components/shared/StatCard';
import type { HorseRaceHistoryItem, Horse } from '@/types';

function DetailFact({ icon: Icon, label, value }: { icon: typeof Rabbit; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3">
      <Icon size={15} className="shrink-0 text-ink-4" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-4">{label}</p>
        <p className="truncate text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

/** Standalone, high-visibility banner — the owner link used to be one small cell
 *  buried in the detail-facts grid alongside gender/weight/etc. and got missed. */
function OwnerBanner({ ownerId, ownerName }: { ownerId: number; ownerName: string }) {
  return (
    <Link
      to={`/horse-owners/${ownerId}`}
      className="group mt-4 flex items-center gap-4 border border-gold/30 bg-gold/[0.06] px-5 py-4 transition-colors hover:border-gold/60 hover:bg-gold/10"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-hi text-lg font-bold text-on-gold shadow-sm">
        {ownerName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gold-hi">Owned By</p>
        <p className="truncate font-serif text-lg font-bold text-ink transition-colors group-hover:text-gold-hi">{ownerName}</p>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gold-hi opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100">
        View Profile <ArrowRight size={14} />
      </span>
    </Link>
  );
}

function fmtMoney(n?: number) {
  if (n == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const RANK_STYLES: Record<number, string> = {
  1: 'bg-gold text-on-gold',
  2: 'bg-[#c7cbd1] text-[#3f4550]',
  3: 'bg-[#8a5a2b] text-white',
};

function RankBadge({ rank }: { rank?: number }) {
  const cls = (rank && RANK_STYLES[rank]) ?? 'bg-surface-overlay text-ink-3';
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${cls}`}>
      {rank ?? '—'}
    </span>
  );
}

const ORDINAL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' };

const HIGHLIGHT_THEME: Record<number, { band: string; chip: string; label: string }> = {
  1: { band: 'from-gold/25 to-gold/5', chip: 'bg-gold text-on-gold', label: 'Career Best — Victory' },
  2: { band: 'from-on-blue/20 to-on-blue/5', chip: 'bg-on-blue/25 text-on-blue', label: 'Career Best — Runner-up' },
  3: { band: 'from-[#8a5a2b]/25 to-[#8a5a2b]/5', chip: 'bg-[#8a5a2b] text-white', label: 'Career Best — Third Place' },
};

function CareerHighlight({ item }: { item: HorseRaceHistoryItem }) {
  const rank = item.rank ?? 0;
  const theme = HIGHLIGHT_THEME[rank];
  // Only celebrate podium finishes — anything outside top 3 (or no rank) has nothing worth spotlighting.
  if (!theme) return null;

  return (
    <div className={`mt-6 overflow-hidden rounded-md border border-rim bg-gradient-to-r ${theme.band} shadow-sm`}>
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:gap-6">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-serif text-lg font-bold shadow-md ${theme.chip}`}>
          {ORDINAL[rank]}
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-4">
            <Sparkles size={11} className="text-gold" /> {theme.label}
          </p>
          <p className="truncate font-serif text-xl font-bold text-ink">{item.raceName}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
            <span className="flex items-center gap-1"><Calendar size={11} /> {fmtDate(item.startTime)}</span>
            {item.location && <span className="flex items-center gap-1"><MapPin size={11} /> {item.location}</span>}
            {item.jockeyName && <span>Ridden by <strong className="text-ink-2">{item.jockeyName}</strong></span>}
            {item.totalParticipants && item.totalParticipants > 1 && (
              <span>Beat {item.totalParticipants - 1} other horse{item.totalParticipants - 1 === 1 ? '' : 's'}</span>
            )}
          </div>
        </div>

        {(item.completionTimeFormatted || item.rewards) && (
          <div className="flex shrink-0 items-center gap-6 border-t border-rim/60 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            {item.completionTimeFormatted && (
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wide text-ink-4">Finish Time</p>
                <p className="tnum font-serif text-lg font-bold text-ink">{item.completionTimeFormatted}</p>
              </div>
            )}
            {item.rewards && (
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wide text-ink-4">Prize Won</p>
                <p className="tnum font-serif text-lg font-bold text-gold">{fmtMoney(item.rewards)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ item }: { item: HorseRaceHistoryItem }) {
  const isWinner = item.rank === 1;
  return (
    <div className={`mb-4 border px-5 py-4 ${isWinner ? 'border-gold/30 bg-gold/5' : 'border-rim bg-surface-raised'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <RankBadge rank={item.rank} />
          <div className="min-w-0">
            <p className="truncate font-serif text-base font-bold text-ink">{item.raceName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-4">
              <span className="flex items-center gap-1"><Calendar size={11} /> {fmtDate(item.startTime)}</span>
              {item.location && <span className="flex items-center gap-1"><MapPin size={11} /> {item.location}</span>}
              {item.totalParticipants && <span>{item.totalParticipants} ran</span>}
            </div>
          </div>
        </div>
        <span className="tnum shrink-0 text-right text-sm font-bold text-gold">
          {fmtMoney(item.rewards ?? 0)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-rim/70 pt-3 pl-12 text-xs text-ink-3">
        {item.jockeyName && <span>Ridden by <strong className="text-ink-2">{item.jockeyName}</strong></span>}
        {item.completionTimeFormatted && <span className="tnum">{item.completionTimeFormatted}</span>}
      </div>
    </div>
  );
}

export default function HorseProfilePage() {
  const { id } = useParams<{ id: string }>();
  const horseId = id ? Number(id) : undefined;

  const { horse, loading: profileLoading, error: profileError } = useHorseProfile(horseId);
  const { history, best, totalRewards, wins, racesRun, loading: historyLoading } = useHorseRaceHistory(horseId);

  // The public horse-list endpoint only carries name/breed/avatar/status — age,
  // gender, weight, speed rating, class and trainer live on the richer horse-owner
  // endpoint. It requires a logged-in session, so this silently yields nothing
  // extra for anonymous visitors instead of breaking the page.
  const [detail, setDetail] = useState<Horse | null>(null);
  useEffect(() => {
    setDetail(null);
    if (!horseId) return;
    getHorseById(horseId).then(setDetail).catch(() => {});
  }, [horseId]);

  const detailFacts = detail
    ? [
        detail.gender && { icon: detail.gender.toLowerCase() === 'female' ? Venus : Mars, label: 'Gender', value: detail.gender },
        detail.age != null && { icon: Calendar, label: 'Age', value: `${detail.age} years old` },
        detail.weight != null && { icon: Weight, label: 'Weight', value: `${detail.weight} kg` },
        detail.speedRating != null && { icon: Gauge, label: 'Speed Rating', value: String(detail.speedRating) },
        detail.historyRank && { icon: GraduationCap, label: 'Achievement', value: detail.historyRank },
        detail.color && { icon: Palette, label: 'Color', value: detail.color },
        detail.trainerName && { icon: Award, label: 'Trainer', value: detail.trainerName },
      ].filter((f): f is { icon: typeof Rabbit; label: string; value: string } => !!f)
    : [];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <Seo title={horse?.horseName ?? 'Horse Profile'} description="Full race history and career stats." />

      <Container className="py-6">
        <Link to="/horses" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-gold transition-colors">
          <ChevronLeft size={14} /> Back to Horses
        </Link>

        {profileLoading ? (
          <div className="h-64 animate-pulse rounded-md bg-surface-overlay" />
        ) : !horse ? (
          <div className="flex flex-col items-center gap-3 border border-rim bg-surface-overlay py-24 text-center">
            <Rabbit size={40} className="text-ink-4" strokeWidth={1.5} />
            <p className="text-sm text-ink-3">{profileError ?? 'This horse could not be found.'}</p>
          </div>
        ) : (
          <>
            {/* Cover photo */}
            <div className="relative h-52 overflow-hidden rounded-t-md border border-b-0 border-on-blue/10 bg-navy-deep sm:h-64">
              {horse.avatarUrl ? (
                <img src={horse.avatarUrl} alt={horse.horseName} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-navy-deep">
                  <Rabbit size={80} strokeWidth={0.5} className="text-on-blue/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
              {horse.currentRaceName && (
                <div className="absolute right-5 top-5 hidden rounded-full bg-navy/80 px-3 py-1.5 backdrop-blur-sm sm:block">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-on-blue/90">
                    <Flag size={11} className="text-gold" /> Entered in {horse.currentRaceName}
                  </p>
                </div>
              )}
            </div>

            {/* Avatar overlapping cover, centered */}
            <div className="relative border border-t-0 border-rim bg-surface-raised px-6 pb-6 pt-16 text-center sm:px-8">
              <div className="absolute -top-14 left-1/2 h-28 w-28 -translate-x-1/2 overflow-hidden rounded-full border-4 border-surface-raised bg-navy-deep shadow-lg sm:h-32 sm:w-32">
                {horse.avatarUrl ? (
                  <img src={horse.avatarUrl} alt={horse.horseName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Rabbit size={40} strokeWidth={0.75} className="text-on-blue/20" />
                  </div>
                )}
              </div>

              <h1 className="font-serif text-3xl font-bold uppercase leading-tight text-ink sm:text-4xl">{horse.horseName}</h1>
              {horse.breed && <p className="mt-1 text-sm text-ink-3">{horse.breed}</p>}

              {detail?.ownerId != null && detail?.ownerName && (
                <OwnerBanner ownerId={detail.ownerId} ownerName={detail.ownerName} />
              )}
            </div>

            {/* Horse details — gender/age/weight/speed/class/trainer, only for fields that exist */}
            {detailFacts.length > 0 && (
              <div className="grid grid-cols-2 divide-x divide-y divide-rim border border-t-0 border-rim bg-surface-raised sm:grid-cols-3 sm:divide-y-0">
                {detailFacts.map((f) => <DetailFact key={f.label} {...f} />)}
              </div>
            )}

            {/* Stat strip */}
            <div className="grid grid-cols-2 gap-3 pt-6 sm:grid-cols-4">
              <StatCard icon={Flag} label="Races Run" value={racesRun} loading={historyLoading} tone="default" />
              <StatCard icon={Trophy} label="Wins" value={wins} loading={historyLoading} tone="gold" />
              <StatCard icon={Award} label="Best Finish" value={best?.rank ? (ORDINAL[best.rank] ?? `${best.rank}th`) : 0} loading={historyLoading} tone="ok" />
              <StatCard icon={Wallet} label="Total Rewards" value={fmtMoney(totalRewards ?? 0)} loading={historyLoading} tone="gold" />
            </div>

            {best && <CareerHighlight item={best} />}

            {/* Race history timeline */}
            <div className="mt-10">
              <h2 className="mb-6 font-serif text-xl font-bold text-ink">Race History</h2>
              {historyLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-md bg-surface-overlay" />)}
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center gap-2 border border-rim bg-surface-overlay py-16 text-center">
                  <Flag size={28} className="text-ink-4" />
                  <p className="text-sm text-ink-3">No races on record for this horse yet.</p>
                </div>
              ) : (
                <div>
                  {history.map((item) => <HistoryCard key={item.raceId} item={item} />)}
                </div>
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}