import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { getAllPenalties } from '@/api/adminApi';
import PenaltyList from '@/components/features/referee/PenaltyList';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { Penalty, PenaltyType } from '@/types';

const TYPES: { value: PenaltyType | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'FINE', label: 'Fine' },
  { value: 'TIME_PENALTY', label: 'Time Penalty' },
  { value: 'DISQUALIFY', label: 'Disqualify' },
];

const selectCls =
  'w-full max-w-xs border border-rim bg-surface-input px-3 py-2.5 pl-9 text-sm text-ink placeholder:text-ink-4 outline-none focus:border-rim-hi transition-colors';

export default function AdminPenaltiesPage() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState<PenaltyType | ''>('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAllPenalties()
      .then((list) => { if (alive) setPenalties(list ?? []); })
      .catch(() => { if (alive) setError('Failed to load penalties.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return penalties.filter((p) =>
      (!type || p.penaltyType === type) &&
      (!kw ||
        p.horseName?.toLowerCase().includes(kw) ||
        p.refereeName?.toLowerCase().includes(kw) ||
        p.ownerName?.toLowerCase().includes(kw) ||
        p.raceName?.toLowerCase().includes(kw)),
    );
  }, [penalties, type, keyword]);

  const counts = useMemo(
    () => Object.fromEntries(TYPES.map((t) => [t.value, t.value ? penalties.filter((p) => p.penaltyType === t.value).length : penalties.length])),
    [penalties],
  );

  return (
    <div className="px-8 py-6">
      <Seo title="Penalties" description="Every penalty issued across the system, for oversight of referee conduct." />
      <DashboardPageHeader
        eyebrow="Admin"
        title="Penalties"
        subtitle="Every fine, warning, time penalty and disqualification issued across the system"
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => {
            const active = type === t.value;
            return (
              <button
                key={t.value || 'all'}
                type="button"
                onClick={() => setType(t.value)}
                className={`inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-semibold transition-colors ${
                  active ? 'border-gold/40 bg-gold/10 text-gold' : 'border-rim text-ink-3 hover:border-rim-hi hover:text-ink-2'
                }`}
              >
                {t.label}
                <span className="tnum inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-surface-overlay px-1 py-0.5 text-[10px] font-bold text-ink-4">
                  {counts[t.value] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
          <input
            type="text"
            placeholder="Search horse, owner, referee, race…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={selectCls}
          />
        </div>
      </div>

      {error && (
        <div className="mb-5 border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">{error}</div>
      )}

      <PenaltyList
        penalties={filtered}
        loading={loading}
        showRefereeName
        showRaceName
        readOnly
      />
    </div>
  );
}
