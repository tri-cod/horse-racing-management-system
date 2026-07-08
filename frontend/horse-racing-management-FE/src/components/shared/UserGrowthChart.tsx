import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface UserGrowthChartProps {
  createdDates: (string | undefined)[];
  loading?: boolean;
  error?: string;
}

export default function UserGrowthChart({ createdDates, loading, error }: UserGrowthChartProps) {
  // monthOffset: 0 = current month, -1 = previous month, etc. Can't go into the future.
  const [monthOffset, setMonthOffset] = useState(0);

  const monthStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthLabel = monthStart.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const data = useMemo(() => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const today = new Date();
    const isViewingCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    const lastDay = isViewingCurrentMonth
      ? today.getDate()
      : new Date(year, month + 1, 0).getDate();

    const buckets: { key: string; label: string; newUsers: number }[] = [];
    for (let day = 1; day <= lastDay; day++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      buckets.push({ key, label: String(day), newUsers: 0 });
    }
    const byKey = new Map(buckets.map((b) => [b.key, b]));

    for (const raw of createdDates) {
      if (!raw) continue;
      const d = new Date(raw);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const bucket = byKey.get(key);
      if (bucket) bucket.newUsers += 1;
    }

    let running = 0;
    return buckets.map((b) => {
      running += b.newUsers;
      return { ...b, total: running };
    });
  }, [createdDates, monthStart]);

  const totalNew = data.reduce((sum, d) => sum + d.newUsers, 0);

  // Clean, unique integer ticks for the Y axis (avoids recharts' auto-ticks
  // producing duplicate/misaligned labels on tiny ranges like 0–3).
  const maxTotal = Math.max(1, ...data.map((d) => d.total));
  const tickCount = Math.min(maxTotal, 5);
  const step = Math.max(1, Math.ceil(maxTotal / tickCount));
  const yTicks: number[] = [];
  for (let v = 0; v <= maxTotal + step; v += step) yTicks.push(v);

  const isCurrentMonth = monthOffset === 0;

  return (
    <div className="overflow-hidden border border-rim bg-surface-raised shadow-card">
      <div className="flex items-center justify-between border-b-2 border-gold/25 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-ink">User Growth</h3>
            <p className="text-xs text-ink-3">{monthLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!loading && !error && (
            <p className="tnum text-sm font-bold text-ink">
              +{totalNew} <span className="font-normal text-ink-3">new</span>
            </p>
          )}
          <div className="flex items-center border border-rim">
            <button
              type="button"
              onClick={() => setMonthOffset((m) => m - 1)}
              className="flex h-7 w-7 items-center justify-center text-ink-3 transition-colors hover:bg-surface-overlay hover:text-ink"
              aria-label="Previous month"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => setMonthOffset((m) => Math.min(0, m + 1))}
              disabled={isCurrentMonth}
              className="flex h-7 w-7 items-center justify-center border-l border-rim text-ink-3 transition-colors hover:bg-surface-overlay hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next month"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-2 pb-4 pt-5 sm:px-5">
        {loading ? (
          <div className="flex h-56 items-center justify-center text-sm text-ink-3">Loading…</div>
        ) : error ? (
          <div className="flex h-56 items-center justify-center text-sm text-fail">{error}</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-gold)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-gold)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rim)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--color-ink-4)' }}
                axisLine={{ stroke: 'var(--color-rim)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                domain={[0, yTicks[yTicks.length - 1]]}
                ticks={yTicks}
                tick={{ fontSize: 11, fill: 'var(--color-ink-4)' }}
                axisLine={false}
                tickLine={false}
                width={34}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-rim)',
                  borderRadius: 0,
                  fontSize: 12,
                }}
                labelStyle={{ color: 'var(--color-ink)', fontWeight: 600 }}
                labelFormatter={(label) => `Day ${label}`}
                formatter={(value, name) => [value, name === 'total' ? 'Total users' : 'New users']}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-gold-hi)"
                strokeWidth={2}
                fill="url(#userGrowthFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}