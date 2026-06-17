import '../../assets/css/bet/BetStatusBadge.css';

const CONFIG = {
  WON:              { label: 'Won',            cls: 'bet-badge--won' },
  LOST:             { label: 'Lost',           cls: 'bet-badge--lost' },
  PENDING:          { label: 'Pending',        cls: 'bet-badge--pending' },
  PENDING_FINISHED: { label: 'Pending Result', cls: 'bet-badge--pending-finished' },
};

export default function BetStatusBadge({ status }) {
  const cfg = CONFIG[status] ?? { label: status, cls: '' };
  return <span className={`bet-badge ${cfg.cls}`}>{cfg.label}</span>;
}
