const STATUS_LABEL = {
  ACTIVE: 'Active',
  INACTIVE: 'Resting',
  RETIRE: 'Retired',
};

const STATUS_CLASS = {
  ACTIVE: 'horse-status-badge--active',
  INACTIVE: 'horse-status-badge--inactive',
  RETIRE: 'horse-status-badge--retire',
};

export default function HorseStatusBadge({ status }) {
  const cls = STATUS_CLASS[status] || 'horse-status-badge--inactive';
  const label = STATUS_LABEL[status] || status || '—';

  return <span className={`horse-status-badge ${cls}`}>{label}</span>;
}
