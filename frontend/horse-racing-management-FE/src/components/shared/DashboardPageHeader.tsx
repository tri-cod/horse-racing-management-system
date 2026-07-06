import type { ReactNode } from 'react';

interface DashboardPageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function DashboardPageHeader({ eyebrow, title, subtitle, action }: DashboardPageHeaderProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 border-b border-rim pb-5">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
        )}
        <h1 className="font-serif text-3xl font-bold leading-tight text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-ink-3">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0 pb-0.5">{action}</div>}
    </div>
  );
}
