const CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'Pending',  cls: 'bg-warn-subtle  text-warn  border border-warn/30'  },
  APPROVED: { label: 'Approved', cls: 'bg-ok-subtle    text-ok    border border-ok/30'    },
  REJECTED: { label: 'Rejected', cls: 'bg-fail-subtle  text-fail  border border-fail/30'  },
};

export default function RaceHorseStatusBadge({ status }: { status?: string }) {
  const cfg = CONFIG[status ?? ''] ?? {
    label: status ?? '—',
    cls: 'bg-surface-overlay text-ink-3 border border-rim',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
