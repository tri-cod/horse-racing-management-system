import Badge from '../ui/Badge';

const DARK_ROLES = new Set(['ADMIN', 'MANAGER']);
const OCEAN_ROLES = new Set(['JOCKEY', 'TRAINER', 'HORSE_OWNER', 'REFEREE']);

export default function RoleBadge({ role }) {
  const variant = DARK_ROLES.has(role) ? 'dark' : OCEAN_ROLES.has(role) ? 'ocean' : 'neutral';
  return <Badge variant={variant}>{role}</Badge>;
}
