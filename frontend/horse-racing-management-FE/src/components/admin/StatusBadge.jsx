import { STATUS_LABELS } from '../../constants/userRoles';

/**
 * Badge trạng thái: ACTIVE | INACTIVE | BANNED.
 * Có chấm tròn ở đầu để dễ scan, kèm màu nền nhạt.
 */
export default function StatusBadge({ status }) {
  if (!status) return <span className="au-status au-status--unknown">—</span>;
  const cls = `au-status au-status--${status.toLowerCase()}`;
  return (
    <span className={cls}>
      <span className="au-status__dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
