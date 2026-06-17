import '../../assets/css/race/RaceInfoSection.css';

export default function RaceInfoSection({ race }) {
  const rows = [
    { label: 'Track Name', value: race.trackName },
    { label: 'Track Condition', value: race.trackCondition },
    { label: 'Surface Type', value: race.surfaceType },
    { label: 'Capacity', value: race.capacity ? `${race.capacity} horses` : '—' },
    { label: 'Referee', value: race.refereeName || '—' },
    { label: 'Registration Deadline', value: race.registrationDeadline ? new Date(race.registrationDeadline).toLocaleString('en-GB') : '—' },
    { label: 'End Time', value: race.endTime ? new Date(race.endTime).toLocaleString('en-GB') : '—' },
  ];

  return (
    <section className="race-info-section">
      <h2 className="race-info-section__heading">Race Information</h2>
      <div className="race-info-section__grid">
        {rows.map((r) => (
          <div key={r.label} className="race-info-section__row">
            <dt className="race-info-section__label">{r.label}</dt>
            <dd className="race-info-section__value">{r.value || '—'}</dd>
          </div>
        ))}
      </div>
    </section>
  );
}