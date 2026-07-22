// Backend enum DistanceCategory — shared display labels so every page that shows
// a horse's preferred distance renders the same human-readable text.
export const DISTANCE_CATEGORY_LABELS: Record<string, string> = {
  SPRINT: 'Sprint (up to 1400m)',
  MILE: 'Mile (1401–1800m)',
  MIDDLE: 'Middle (1801–2400m)',
  LONG: 'Long (2400m+)',
};

export const DISTANCE_CATEGORY_SHORT_LABELS: Record<string, string> = {
  SPRINT: 'Sprint',
  MILE: 'Mile',
  MIDDLE: 'Middle',
  LONG: 'Long',
};

export function formatPreferredDistance(code?: string | null, short = false): string | null {
  if (!code) return null;
  const map = short ? DISTANCE_CATEGORY_SHORT_LABELS : DISTANCE_CATEGORY_LABELS;
  return map[code] ?? code;
}
