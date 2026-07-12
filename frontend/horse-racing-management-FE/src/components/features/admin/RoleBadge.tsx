import type { UserRole } from '@/types';

const CONFIG: Record<UserRole, string> = {
  ADMIN:       'bg-navy/10    text-navy   border border-navy/20',
  STAFF:       'bg-gold/10    text-gold   border border-gold/20',
  REFEREE:     'bg-warn-subtle text-warn  border border-warn/30',
  HORSE_OWNER: 'bg-ok-subtle   text-ok    border border-ok/30',
  TRAINER:     'bg-ok-subtle   text-ok    border border-ok/30',
  JOCKEY:      'bg-blue/10    text-blue   border border-blue/20',
  USER:        'bg-surface-overlay text-ink-3 border border-rim',
};

const LABEL: Record<UserRole, string> = {
  ADMIN: 'Admin', STAFF: 'Staff', REFEREE: 'Referee', HORSE_OWNER: 'Horse Owner',
  TRAINER: 'Trainer', JOCKEY: 'Jockey', USER: 'Member',
};

export default function RoleBadge({ role }: { role: string }) {
  const cls = CONFIG[role as UserRole] ?? 'bg-surface-overlay text-ink-3 border border-rim';
  const label = LABEL[role as UserRole] ?? role;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
