import { Link } from 'react-router-dom';
import RaceHorseStatusBadge from './RaceHorseStatusBadge';
import '../../assets/css/race-horse/MyRegistrationsTable.css';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB');
}

export default function MyRegistrationsTable({ registrations }) {
  return (
    <div className="my-reg-table-wrap">
      <table className="my-reg-table">
        <thead>
          <tr>
            <th>Race</th>
            <th>Horse</th>
            <th>Jockey</th>
            <th>Lane</th>
            <th>Status</th>
            <th>Registered</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r.id} className="my-reg-table__row">
              <td>
                <Link to={`/races/${r.raceId}`} className="my-reg-table__race-link">
                  {r.raceName}
                </Link>
              </td>
              <td className="my-reg-table__horse">{r.horseName}</td>
              <td className="my-reg-table__muted">{r.jockeyName || '—'}</td>
              <td className="my-reg-table__muted">{r.laneNumber ?? '—'}</td>
              <td><RaceHorseStatusBadge status={r.status} /></td>
              <td className="my-reg-table__muted">{formatDate(r.registerAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}