import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Tone = 'default' | 'gold' | 'ok' | 'warn' | 'fail';

const TONE_BAR: Record<Tone, string> = {
  default: 'bg-navy',
  gold: 'bg-gold',
  ok: 'bg-ok',
  warn: 'bg-warn',
  fail: 'bg-fail',
};

const TONE_ICON_CLS: Record<Tone, string> = {
  default: 'bg-navy/10 text-navy',
  gold: 'bg-gold/15 text-gold-hi',
  ok: 'bg-ok-subtle text-ok',
  warn: 'bg-warn-subtle text-warn',
  fail: 'bg-fail-subtle text-fail',
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  loading?: boolean;
  error?: string;
  hint?: string;
  hintIcon?: LucideIcon;
  tone?: Tone;
  compact?: boolean;
}

export default function StatCard({ icon: Icon, label, value, loading, error, hint, hintIcon: HintIcon, tone = 'default', compact = false }: StatCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 border border-rim bg-surface-raised px-4 py-3.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center ${TONE_ICON_CLS[tone]}`}>
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[9px] font-bold uppercase tracking-[0.1em] text-ink-4">{label}</p>
          {loading ? (
            <div className="mt-1 h-4 w-14 animate-pulse bg-surface-overlay" />
          ) : error ? (
            <p className="mt-0.5 truncate text-xs text-fail">Error</p>
          ) : (
            <p className="tnum mt-0.5 text-lg font-bold text-ink">{value}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex gap-4 overflow-hidden border border-rim bg-surface-raised px-5 py-5 shadow-card transition-shadow duration-200 hover:shadow-modal">
      <div className={`absolute inset-y-0 left-0 w-1 ${TONE_BAR[tone]}`} />
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${TONE_ICON_CLS[tone]}`}>
        <Icon size={21} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-4">{label}</p>
        {loading ? (
          <div className="mt-2.5 h-7 w-20 animate-pulse rounded bg-surface-overlay" />
        ) : error ? (
          <p className="mt-1 text-sm text-fail">{error}</p>
        ) : (
          <p className="tnum mt-1 text-[26px] font-bold leading-none text-ink">{value}</p>
        )}
        {hint && !loading && !error && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-3">
            {HintIcon && <HintIcon size={10} />} {hint}
          </p>
        )}
      </div>
    </div>
  );
}