import type { PenaltyType } from '@/types';

const TONE: Record<string, string> = {
  FINE: 'border-gold/40 bg-gold/10 text-gold-hi',
  DISQUALIFY: 'border-fail/30 bg-fail-subtle text-fail',
  TIME_PENALTY: 'border-rim bg-surface-overlay text-ink-2',
  WARNING: 'border-rim bg-surface-overlay text-ink-3',
};

const LABEL: Record<string, string> = {
  FINE: 'Fine',
  DISQUALIFY: 'Disqualified',
  TIME_PENALTY: 'Time Penalty',
  WARNING: 'Warning',
};

export default function PenaltyBadge({ type }: { type: PenaltyType | string }) {
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONE[type] ?? TONE.WARNING}`}>
      {LABEL[type] ?? type}
    </span>
  );
}