import type { Race } from '@/types';

export default function RaceInfoSection({ race }: { race: Race & { refereeName?: string } }) {
 const rows = [
 { label: 'Track Name', value: race.trackName },
 { label: 'Track Condition', value: race.trackCondition },
 { label: 'Surface Type', value: race.surfaceType },
 { label: 'Capacity', value: race.capacity ?`${race.capacity} horses` : '—' },
 { label: 'Referee', value: race.refereeName ?? '—' },
 { label: 'Registration Deadline', value: race.registrationDeadline ? new Date(race.registrationDeadline).toLocaleString('en-GB') : '—' },
 { label: 'End Time', value: race.endTime ? new Date(race.endTime).toLocaleString('en-GB') : '—' },
 ];

 return (
 <section className=" border border-rim bg-surface-raised p-5">
 <h2 className="mb-4 text-base font-semibold text-ink">Race Information</h2>
 <dl className="divide-y divide-rim">
 {rows.map((r) => (
 <div key={r.label} className="flex items-center justify-between gap-4 py-2.5">
 <dt className="text-sm text-ink-4">{r.label}</dt>
 <dd className="text-sm font-medium text-ink-2">{r.value || '—'}</dd>
 </div>
 ))}
 </dl>
 </section>
 );
}
