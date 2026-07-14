// Mỗi jockey một màu áo cưỡi (racing silks) cố định, suy ra từ id/tên —
// dùng chung giữa JockeyCard và JockeyProfilePage để một jockey luôn có
// cùng một màu định danh ở mọi nơi trong app.

export const GOLD = '#d9bc76';
export const GOLD_HAIRLINE = 'rgba(217,188,118,0.22)';

export const SILKS = [
  '#c34a3a', // crimson
  '#d9a441', // amber
  '#3f9d78', // emerald
  '#4a7fc0', // royal blue
  '#8a6fc7', // violet
  '#cf7b52', // burnt orange
  '#c76b93', // rose
  '#4bb0b8', // teal
];

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

export function silkColor(jockey: { id?: number | null; name: string }) {
  const seed = jockey.id ?? hashString(jockey.name);
  return SILKS[Math.abs(seed) % SILKS.length];
}
