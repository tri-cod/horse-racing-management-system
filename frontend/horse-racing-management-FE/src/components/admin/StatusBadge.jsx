import Badge from '../ui/Badge';

const MAP = {
  ACTIVE:   'ocean',
  INACTIVE: 'neutral',
  BANNED:   'dark',
};

export default function StatusBadge({ status }) {
  return <Badge variant={MAP[status] ?? 'neutral'}>{status}</Badge>;
}
