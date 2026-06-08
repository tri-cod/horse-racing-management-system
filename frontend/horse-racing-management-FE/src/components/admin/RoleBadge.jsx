import { ROLE_LABELS } from '../../constants/userRoles';

/**
 * Badge màu cho role. Mỗi role 1 màu nền nhạt + chữ đậm tương ứng,
 * giúp Admin scan bảng nhanh hơn nhiều so với text thường.
 *
 * Class CSS: au-role au-role--<rolelowercase>
 */
export default function RoleBadge({ role }) {
  if (!role) return <span className="au-role au-role--unknown">—</span>;
  const cls = `au-role au-role--${role.toLowerCase()}`;
  return <span className={cls}>{ROLE_LABELS[role] || role}</span>;
}
