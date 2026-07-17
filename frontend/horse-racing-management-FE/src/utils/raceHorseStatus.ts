/** Canonical race-horse statuses — mirrors backend enum RaceHorseStatus.java. */
export type RaceHorseStatusKey =
  | 'PENDING'
  | 'PENDING_JOCKEY'
  | 'JOCKEY_REJECTED'
  | 'PENDING_ADMIN'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAW_PENDING'
  | 'WITHDRAW_REJECTED'
  | 'WITHDRAWN';

/** "PENDING_ADMIN" | "PendingAdmin" | "pending admin" → "PENDINGADMIN" */
const squash = (s?: string | null) => (s ?? '').toUpperCase().replace(/[\s_-]/g, '');

const KEYS: RaceHorseStatusKey[] = [
  'PENDING', 'PENDING_JOCKEY', 'JOCKEY_REJECTED', 'PENDING_ADMIN',
  'APPROVED', 'REJECTED', 'WITHDRAW_PENDING', 'WITHDRAW_REJECTED', 'WITHDRAWN',
];

/**
 * Compares a status coming off the wire against a canonical key, ignoring
 * casing/underscores. The backend sends SCREAMING_SNAKE, but older code and
 * seed data used PascalCase — tolerate both instead of silently failing.
 */
export const isStatus = (status: unknown, want: RaceHorseStatusKey) =>
  squash(status as string) === squash(want);

/** Normalizes any known variant to its canonical key, or null if unrecognized. */
export const toStatusKey = (status?: string): RaceHorseStatusKey | null =>
  KEYS.find((k) => squash(k) === squash(status)) ?? null;

/** True when the status matches any of the given canonical keys. */
export const isAnyStatus = (status: unknown, wants: RaceHorseStatusKey[]) =>
  wants.some((w) => isStatus(status, w));