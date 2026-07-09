import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

export interface QuickAction {
  icon: LucideIcon;
  label: string;
  description: string;
  to: string;
}

export default function QuickActions({ title = 'Quick Actions', actions }: { title?: string; actions: QuickAction[] }) {
  return (
    <div className="mt-8">
      <div className="mb-4">
        <p className="eyebrow">Shortcuts</p>
        <h2 className="mt-0.5 font-serif text-lg font-bold text-ink">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map(({ icon: Icon, label, description, to }) => (
          <Link
            key={to}
            to={to}
            className="group relative flex items-start gap-4 overflow-hidden border border-rim bg-surface-raised px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_8px_20px_rgba(13,41,24,0.10)]"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-navy text-gold transition-colors group-hover:bg-navy-hi">
              <Icon size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{description}</p>
            </div>
            <ArrowRight size={14} className="mt-1 shrink-0 text-ink-4 transition-all group-hover:translate-x-0.5 group-hover:text-gold" />
          </Link>
        ))}
      </div>
    </div>
  );
}