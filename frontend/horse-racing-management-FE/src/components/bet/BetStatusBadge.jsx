import '../../assets/css/bet/BetStatusBadge.css';

const STATUS_MAP = {
  PENDING:   { label: 'Pending', cls: 'pending' },
  WON:       { label: 'Won',       cls: 'won' },
  LOST:      { label: 'Lost',        cls: 'lost' },
  CANCELLED: { label: 'Cancelled',     cls: 'cancelled' },
};

export default function BetStatusBadge({ status }) {
  const cfg = STATUS_MAP[status] ?? { label: status ?? '—', cls: 'pending' };
  return (
    <span className={`bet-status-badge bet-status-badge--${cfg.cls}`}>
      {cfg.cls === 'pending' && (
        <span className="bet-status-badge__dot bet-status-badge__dot--pulse" />
      )}
      {cfg.label}
    </span>
  );
}
