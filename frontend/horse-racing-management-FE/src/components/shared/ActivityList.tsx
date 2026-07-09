import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ChevronDown } from 'lucide-react';

type Tone = 'ok' | 'warn' | 'fail' | 'neutral';

const TONE_CLS: Record<Tone, string> = {
  ok: 'bg-ok-subtle text-ok border border-ok/30',
  warn: 'bg-warn-subtle text-warn border border-warn/30',
  fail: 'bg-fail-subtle text-fail border border-fail/30',
  neutral: 'bg-surface-overlay text-ink-3 border border-rim',
};

const TONE_BAR_CLS: Record<Tone, string> = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  fail: 'bg-fail',
  neutral: 'bg-rim-hi',
};

export interface ActivityItem {
  id: string | number;
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: { label: string; tone: Tone };
}

interface ActivityListProps {
  icon: LucideIcon;
  title: string;
  items: ActivityItem[];
  loading?: boolean;
  error?: string;
  emptyIcon: LucideIcon;
  emptyLabel: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  pageSize?: number;
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-overlay" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-40 animate-pulse bg-surface-overlay" />
        <div className="h-2.5 w-24 animate-pulse bg-surface-overlay" />
      </div>
      <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-surface-overlay" />
    </div>
  );
}

export default function ActivityList({
  icon: Icon, title, items, loading, error, emptyIcon: EmptyIcon, emptyLabel, viewAllTo, viewAllLabel = 'View all', pageSize = 5,
}: ActivityListProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const visibleItems = items.slice(0, visibleCount);
  const remaining = items.length - visibleCount;

  return (
    <div className="flex h-full flex-col overflow-hidden border border-rim bg-surface-raised shadow-card">
      <div className="flex items-center justify-between border-b-2 border-gold/25 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
            <Icon size={16} />
          </div>
          <h3 className="font-serif text-base font-bold text-ink">{title}</h3>
        </div>
        {viewAllTo && (
          <Link to={viewAllTo} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-navy transition-colors hover:text-navy-hi">
            {viewAllLabel} <ArrowRight size={12} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="divide-y divide-rim">
          {[...Array(3)].map((_, i) => <RowSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center px-5 py-12 text-center text-sm text-fail">{error}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-5 py-12 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-overlay text-ink-4">
            <EmptyIcon size={18} />
          </div>
          <p className="text-sm text-ink-3">{emptyLabel}</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-rim">
            {visibleItems.map((item) => (
              <div key={item.id} className="relative flex items-center gap-4 py-4 pl-6 pr-5 transition-colors hover:bg-surface-overlay/40">
                <div className={`absolute left-0 top-0 h-full w-1 ${item.badge ? TONE_BAR_CLS[item.badge.tone] : 'bg-transparent'}`} />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/8 text-navy">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                  {item.subtitle && <p className="mt-0.5 truncate text-xs text-ink-3">{item.subtitle}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {item.badge && (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLS[item.badge.tone]}`}>
                      {item.badge.label}
                    </span>
                  )}
                  {item.meta && <span className="tnum text-[11px] text-ink-4">{item.meta}</span>}
                </div>
              </div>
            ))}
          </div>
          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + pageSize)}
              className="flex w-full items-center justify-center gap-1.5 border-t border-rim py-2.5 text-xs font-semibold text-navy transition-colors hover:bg-surface-overlay/40 hover:text-navy-hi"
            >
              Show {Math.min(remaining, pageSize)} more <ChevronDown size={13} />
            </button>
          )}
        </>
      )}
    </div>
  );
}