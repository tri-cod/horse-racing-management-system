import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { GOLD, GOLD_HAIRLINE, silkColor } from '@/utils/jockeySilks';
import type { Jockey } from '@/types';

interface JockeyCardProps {
  jockey: Jockey;
  index?: number;
  onClick?: (jockey: Jockey) => void;
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: '', last: parts[0] };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

// Chỉ dựng stat từ field thật sự có -> card không bao giờ có ô trống lơ lửng.
function buildStats(j: Jockey) {
  const stats: { value: string; label: string }[] = [];

  const wins = j.totalWins ?? j.wins;
  if (typeof wins === 'number') stats.push({ value: String(wins), label: 'Wins' });

  let rate = j.winRate;
  if (rate == null && typeof j.totalWins === 'number' && j.totalRaces) {
    rate = j.totalWins / j.totalRaces;
  }
  if (typeof rate === 'number') {
    const pct = rate <= 1 ? rate * 100 : rate; // xử lý cả 0.26 lẫn 26
    stats.push({ value: `${Math.round(pct)}%`, label: 'Win rate' });
  }

  if (typeof j.totalRaces === 'number') stats.push({ value: String(j.totalRaces), label: 'Races' });
  if (typeof j.weight === 'number') stats.push({ value: `${j.weight}kg`, label: 'Weight' });
  if (typeof j.experienceYear === 'number') stats.push({ value: String(j.experienceYear), label: 'Yrs exp.' });
  if (typeof j.age === 'number') stats.push({ value: String(j.age), label: 'Age' });

  return stats.slice(0, 3); // ưu tiên 3 stat đầu có sẵn
}

export default function JockeyCard({ jockey, onClick }: JockeyCardProps) {
  const { first, last } = splitName(jockey.name);
  const reduce = useReducedMotion();
  const silk = useMemo(() => silkColor(jockey), [jockey]);
  const stats = useMemo(() => buildStats(jockey), [jockey]);
  const initial = (last || jockey.name).charAt(0).toUpperCase();

  return (
    <motion.div
      className="group relative flex h-72 cursor-pointer flex-col overflow-hidden rounded-md bg-gradient-to-b from-navy to-navy-deep shadow-lg shadow-navy-deep/30 ring-1 ring-on-blue/10"
      onClick={() => onClick?.(jockey)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(jockey); } }}
      whileHover={reduce ? undefined : { y: -6 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Thẻ áo cưỡi (racing silks) - dải màu định danh riêng từng jockey */}
      <div className="h-[5px] w-full shrink-0" style={{ backgroundColor: silk }} />

      {/* Ánh sáng hắt từ huy hiệu, gợi cảm giác thẻ hội viên câu lạc bộ */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 50% 0%, ${silk}33, transparent 70%)` }}
      />

      {/* Số hiệu jockey, góc phải trên */}
      <span className="absolute right-3 top-4 z-10 rounded-full bg-navy-deep/60 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-on-blue/50 backdrop-blur-sm">
        №{jockey.id}
      </span>

      {/* Trạng thái, góc trái trên */}
      {jockey.status && (
        <span
          className="absolute left-3 top-4 z-10 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider backdrop-blur-sm"
          style={{ backgroundColor: GOLD_HAIRLINE, color: GOLD }}
        >
          {jockey.status}
        </span>
      )}

      {/* Nội dung chính - căn giữa như một thẻ hội viên */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3 px-5 pt-2 text-center">
        {/* Huy hiệu tròn - ảnh thật hoặc initial khi chưa có ảnh */}
        <div
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 shadow-md transition duration-300 group-hover:scale-105"
          style={{ borderColor: GOLD, backgroundColor: `${silk}26`, boxShadow: `0 0 0 4px ${silk}1f` }}
        >
          {jockey.avatarUrl ? (
            <img src={jockey.avatarUrl} alt={jockey.name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="font-serif text-3xl font-bold" style={{ color: silk }}>{initial}</span>
          )}
        </div>

        {/* Tên */}
        <div>
          {first && <p className="font-serif text-sm font-medium leading-tight text-on-blue/60">{first}</p>}
          <h3 className="font-serif text-xl font-bold uppercase leading-tight text-on-blue transition-colors group-hover:text-gold">
            {last}
          </h3>
        </div>
      </div>

      {/* Stat - tự ẩn nếu không có data */}
      {stats.length > 0 && (
        <div className="relative z-10 flex divide-x border-t" style={{ borderColor: GOLD_HAIRLINE }}>
          {stats.map((s) => (
            <div key={s.label} className="flex-1 px-2 py-3 text-center" style={{ borderColor: GOLD_HAIRLINE }}>
              <div className="font-mono text-base font-medium" style={{ color: GOLD }}>{s.value}</div>
              <div className="text-[9px] uppercase tracking-wider text-on-blue/50">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
