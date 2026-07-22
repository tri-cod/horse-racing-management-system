export const RACE_CLASS_LABELS: Record<string, string> = {
  MAIDEN: 'Maiden', CLASS_4: 'Class 4', CLASS_3: 'Class 3', CLASS_2: 'Class 2',
  CLASS_1: 'Class 1', LISTED: 'Listed', GRADE_1: 'Grade 1',
};

function fmtEarnings(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export interface RaceRequirementsSource {
  minAge?: number | null;
  maxAge?: number | null;
  genderRestriction?: string | null;
  raceClass?: string | null;
  minEarnings?: number | null;
  maxEarnings?: number | null;
  minWeight?: number | null;
}

/** Builds the list of horse-eligibility requirement chips for a race — empty if none are set. */
export function buildRaceRequirements(race: RaceRequirementsSource): string[] {
  const reqs: string[] = [];
  if (race.minAge != null && race.maxAge != null) reqs.push(`Age ${race.minAge}–${race.maxAge} yrs`);
  else if (race.minAge != null) reqs.push(`Age ${race.minAge}+ yrs`);
  else if (race.maxAge != null) reqs.push(`Age up to ${race.maxAge} yrs`);

  if (race.genderRestriction) reqs.push(`${race.genderRestriction.charAt(0)}${race.genderRestriction.slice(1).toLowerCase()} only`);

  if (race.raceClass) reqs.push(RACE_CLASS_LABELS[race.raceClass] ?? race.raceClass);

  if (race.minEarnings != null && race.maxEarnings != null) {
    reqs.push(`Earnings ${fmtEarnings(race.minEarnings)}–${fmtEarnings(race.maxEarnings)}`);
  } else if (race.minEarnings != null) {
    reqs.push(`Earnings ${fmtEarnings(race.minEarnings)}+`);
  } else if (race.maxEarnings != null) {
    reqs.push(`Earnings up to ${fmtEarnings(race.maxEarnings)}`);
  }

  if (race.minWeight != null) reqs.push(`Min weight ${race.minWeight} kg`);

  return reqs;
}
