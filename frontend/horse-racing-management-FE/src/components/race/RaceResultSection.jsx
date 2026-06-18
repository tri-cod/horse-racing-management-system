import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { getRaceResults } from '../../api/refereeApi';
import '../../assets/css/race/RaceResultSection.css';

function formatReward(amount) {
  if (!amount) return null;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency', currency: 'VND', maximumFractionDigits: 0,
  }).format(amount);
}

function formatTime(raw) {
  if (!raw) return '—';
  // If it's already a duration string (e.g. "1:32.45"), return as-is
  if (/^\d+:\d/.test(raw)) return raw;
  // Otherwise try to parse as date-time and show the time portion
  try {
    return new Date(raw).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return raw;
  }
}

function horseName(result) {
  return result?.raceHorse?.horse?.horseName ?? '—';
}

function horseBreed(result) {
  return result?.raceHorse?.horse?.breed ?? '';
}

function jockeyName(result) {
  return result?.raceHorse?.jockey?.user?.fullName ?? '—';
}

export default function RaceResultSection({ raceId }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!raceId) return;
    setLoading(true);
    getRaceResults(raceId)
      .then((data) => {
        const sorted = [...(data ?? [])].sort((a, b) => a.rank - b.rank);
        setResults(sorted);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [raceId]);

  if (!loading && results.length === 0) return null;

  return (
    <section className="race-results" aria-labelledby="race-results-heading">
      <div className="race-results__heading">
        <span className="race-results__heading-icon">
          <Trophy size={18} />
        </span>
        <h2 id="race-results-heading">Race Results</h2>
      </div>

      {loading ? (
        <div className="race-results__loading">Loading results…</div>
      ) : (
        <>

          <div className="race-results__table-wrap">
            <table className="race-results__table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Horse</th>
                  <th>Jockey</th>
                  <th>Time</th>
                  <th>Reward</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="race-results__rank">{r.rank}</div>
                    </td>
                    <td>
                      <div className="race-results__horse-name">{horseName(r)}</div>
                      {horseBreed(r) && (
                        <div className="race-results__horse-breed">{horseBreed(r)}</div>
                      )}
                    </td>
                    <td className="race-results__jockey">{jockeyName(r)}</td>
                    <td className="race-results__time">{formatTime(r.completiontime)}</td>
                    <td className="race-results__reward">
                      {r.rewards > 0 ? formatReward(r.rewards) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
