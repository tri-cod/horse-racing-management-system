import { useParams, useNavigate } from 'react-router-dom';
import { useRaceDetail } from '../hooks/useRaceDetail';
import { useRaceResults } from '../hooks/useRaceResults';
import { useRaces } from '../hooks/useRaces';
import { computeRaceStatus } from '../utils/raceStatus';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import '../assets/css/RaceResultPage.css';

/* ─── helpers ─────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}
function formatPrize(n) {
  if (!n) return null;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency', currency: 'VND', maximumFractionDigits: 0,
  }).format(n);
}

const RANK_LABELS = { 1: '1st', 2: '2nd', 3: '3rd' };

/* ─── Podium (top-3 cards, no emoji) ──────────────────────── */
function Podium({ top3 }) {
  if (!top3.length) return null;

  // layout: 2nd · 1st · 3rd
  const order = [1, 0, 2];

  return (
    <div className="rr-podium">
      {order.map((idx, col) => {
        const r = top3[idx];
        if (!r) return <div key={col} className="rr-podium__slot rr-podium__slot--empty" />;
        const horse      = r.raceHorse?.horse;
        const jockeyUser = r.raceHorse?.jockey?.user;
        const pos        = r.rank; // 1 | 2 | 3

        return (
          <div
            key={r.id}
            className={`rr-podium__slot rr-podium__slot--pos${pos}`}
          >
            <div className="rr-podium__avatar-wrap">
              {horse?.avatarUrl
                ? <img src={horse.avatarUrl} alt={horse.horseName} className="rr-podium__avatar" />
                : <div className="rr-podium__avatar-fallback">{horse?.horseName?.charAt(0) ?? '?'}</div>
              }
              <span className="rr-podium__rank-badge">{RANK_LABELS[pos] ?? `#${pos}`}</span>
            </div>
            <div className="rr-podium__horse">{horse?.horseName ?? '—'}</div>
            {jockeyUser && (
              <div className="rr-podium__jockey">
                {jockeyUser.fullName || jockeyUser.username}
              </div>
            )}
            {r.rewards > 0 && (
              <div className="rr-podium__prize">{formatPrize(r.rewards)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Full standings table (no emoji medals) ───────────────── */
function StandingsTable({ results }) {
  const sorted = [...results].sort((a, b) => a.rank - b.rank);
  return (
    <div className="rr-table-wrap">
      <table className="rr-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Horse</th>
            <th>Jockey</th>
            <th>Lane</th>
            <th>Reward</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const horse      = r.raceHorse?.horse;
            const jockeyUser = r.raceHorse?.jockey?.user;
            const topCls     = r.rank <= 3 ? ` rr-table__row--top${r.rank}` : '';
            return (
              <tr key={r.id} className={`rr-table__row${topCls}`}>
                <td>
                  <span className={`rr-rank-pill rr-rank-pill--${r.rank <= 3 ? r.rank : 'rest'}`}>
                    {RANK_LABELS[r.rank] ?? `#${r.rank}`}
                  </span>
                </td>
                <td className="rr-table__horse-cell">
                  {horse?.avatarUrl
                    ? <img src={horse.avatarUrl} alt={horse.horseName} className="rr-table__avatar" />
                    : <div className="rr-table__avatar-fallback">{horse?.horseName?.charAt(0) ?? '?'}</div>
                  }
                  <div>
                    <div className="rr-table__horse-name">{horse?.horseName ?? '—'}</div>
                    {horse?.breed && <div className="rr-table__horse-breed">{horse.breed}</div>}
                  </div>
                </td>
                <td className="rr-table__jockey">
                  {jockeyUser?.fullName || jockeyUser?.username || '—'}
                </td>
                <td className="rr-table__lane">
                  {r.raceHorse?.laneNumber ?? '—'}
                </td>
                <td className="rr-table__reward">
                  {r.rewards > 0
                    ? formatPrize(r.rewards)
                    : <span className="rr-table__no-reward">—</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Horizontal race card for the bottom bar ─────────────── */
function OtherRaceCard({ race, topResult, onClick, isActive }) {
  const horse = topResult?.raceHorse?.horse;
  return (
    <button
      type="button"
      className={`rr-bar__card${isActive ? ' rr-bar__card--active' : ''}`}
      onClick={onClick}
    >
      <div className="rr-bar__banner">
        {race.bannerImageurl
          ? <img src={race.bannerImageurl} alt={race.raceName} />
          : <div className="rr-bar__banner-fallback" />
        }
      </div>
      <div className="rr-bar__info">
        <div className="rr-bar__name">{race.raceName}</div>
        <div className="rr-bar__meta">{formatDate(race.startTime)}</div>
        {horse && (
          <div className="rr-bar__winner">
            <span className="rr-bar__winner-label">Winner</span>
            <span className="rr-bar__winner-name">{horse.horseName}</span>
          </div>
        )}
      </div>
    </button>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function RaceResultPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const { race,    loading: raceLoading    } = useRaceDetail(id);
  const { results, loading: resultLoading  } = useRaceResults(id);
  const { races,   loading: racesLoading   } = useRaces({ size: 50 });

  if (raceLoading || resultLoading || racesLoading) {
    return <div className="rr-loading"><LoadingSpinner size="lg" /></div>;
  }

  const now            = new Date();
  const otherCompleted = (races || []).filter(
    (r) => computeRaceStatus(r, now) === 'COMPLETED' && String(r.id) !== String(id),
  );

  const sorted = [...results].sort((a, b) => a.rank - b.rank);
  const top3   = sorted.slice(0, 3);

  return (
    <div className="rr-page">

      {/* ══ HERO ═══════════════════════════════════════════ */}
      <header className="rr-hero">
        {race?.bannerImageurl && (
          <div className="rr-hero__bg">
            <img src={race.bannerImageurl} alt={race?.raceName} />
          </div>
        )}
        <div className="rr-hero__grad" />

        <div className="rr-hero__content">
          <p className="rr-hero__eyebrow">Official Results</p>
          <h1 className="rr-hero__title">{race?.raceName ?? 'Race Result'}</h1>

          <div className="rr-hero__chips">
            {race?.startTime     && <span className="rr-chip">{formatDate(race.startTime)}</span>}
            {race?.location      && <span className="rr-chip">{race.location}</span>}
            {race?.trackName     && <span className="rr-chip">{race.trackName}</span>}
            {race?.distance      && <span className="rr-chip">{race.distance}</span>}
            {race?.totalprizepool && (
              <span className="rr-chip rr-chip--prize">{formatPrize(race.totalprizepool)}</span>
            )}
          </div>

          <Podium top3={top3} />
        </div>
      </header>

      {/* ══ STANDINGS ══════════════════════════════════════ */}
      <section className="rr-standings">
        <div className="rr-standings__inner">
          <h2 className="rr-section-label">Full Standings</h2>
          {results.length === 0 ? (
            <div className="rr-empty">
              <p>No results have been recorded for this race yet.</p>
            </div>
          ) : (
            <StandingsTable results={results} />
          )}
        </div>
      </section>

      {/* ══ OTHER RACES BAR ════════════════════════════════ */}
      {otherCompleted.length > 0 && (
        <section className="rr-bar">
          <div className="rr-bar__inner">
            <h2 className="rr-bar__heading">Other Results</h2>
            <div className="rr-bar__track">
              {otherCompleted.map((r) => (
                <OtherRaceCard
                  key={r.id}
                  race={r}
                  topResult={null}
                  isActive={false}
                  onClick={() => navigate(`/races/${r.id}/result`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
