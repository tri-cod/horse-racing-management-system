import type { UserStatus } from '@/types';

const CONFIG: Record<UserStatus, { label: string; cls: string }> = {
  ACTIVE:   { label: 'Active',   cls: 'bg-ok-subtle    text-ok    border border-ok/30'   },
  INACTIVE: { label: 'Inactive', cls: 'bg-surface-overlay text-ink-3 border border-rim' },
  BANNED:   { label: 'Banned',   cls: 'bg-fail-subtle  text-fail  border border-fail/30' },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status as UserStatus] ?? { label: status, cls: 'bg-surface-overlay text-ink-3 border border-rim' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
