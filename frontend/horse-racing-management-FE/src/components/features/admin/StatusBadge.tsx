import Badge from '@/components/ui/Badge';
import type { UserStatus } from '@/types';

const CONFIG: Record<UserStatus, { label: string; cls: string }> = {
  ACTIVE:   { label: 'Active',   cls: 'bg-ok-subtle    text-ok    border-ok/30'   },
  INACTIVE: { label: 'Inactive', cls: 'bg-surface-overlay text-ink-3 border-rim' },
  BANNED:   { label: 'Banned',   cls: 'bg-fail-subtle  text-fail  border-fail/30' },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status as UserStatus] ?? { label: status, cls: 'bg-surface-overlay text-ink-3 border-rim' };
  return <Badge className={cfg.cls}>{cfg.label}</Badge>;
}
