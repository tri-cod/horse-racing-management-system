import Badge from '../ui/Badge';

const MAP = {
  PENDING:  'neutral',
  APPROVED: 'ocean',
  REJECTED: 'dark',
};

export default function RaceHorseStatusBadge({ status }) {
  return <Badge variant={MAP[status] ?? 'neutral'}>{status}</Badge>;
}