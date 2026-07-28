import type { RaceHorse } from '@/types';

/* ══════════════════════════════════════════════════════════════════
   Shared constants, types and small helpers for the bet feature.
   Every component in this folder imports from here so the rules
   live in exactly one place.
   ══════════════════════════════════════════════════════════════════ */

/** Saddle-cloth colours per post position (lane number). */
export const LANE_STYLE: Record<number, { bg: string; color: string }> = {
  1: { bg: '#dc2626', color: '#fff' },
  2: { bg: '#ffffff', color: '#111' },
  3: { bg: '#0284c7', color: '#fff' },
  4: { bg: '#facc15', color: '#000' },
  5: { bg: '#15803d', color: '#fff' },
  6: { bg: '#f97316', color: '#fff' },
  7: { bg: '#ec4899', color: '#fff' },
  8: { bg: '#7e22ce', color: '#fff' },
  9: { bg: '#0d9488', color: '#fff' },
};

/* A race walks UPCOMING to OPEN_REGISTRATION to CLOSED_REGISTRATION to
   SETTING_ODDS to OPEN_BETTING to ONGOING to FINISHED, or drops out at
   CANCELLED. Wagers are accepted in OPEN_BETTING and nowhere else: before it
   the odds are not published, after it the gates are shut. Stated as an
   allowlist so any status added later stays closed until someone opens it. */
export const BETTABLE_STATUS = 'OPEN_BETTING';

export function isBettable(status?: string) {
  return status === BETTABLE_STATUS;
}

/** Smallest stake the backend accepts, in VND. */
export const MIN_BET = 1000;

/** One-tap stake presets offered beside every runner. */
export const QUICK_STAKES = [50_000, 100_000, 200_000, 500_000];

/* Pre-race we list APPROVED entries with odds; once the race runs, the backend
   flips each entry's status to FINISHED/DISQUALIFIED, so keep those visible too. */
export function isRunnerEntry(e: RaceHorse) {
  const s = e.status?.toLowerCase();
  return s === 'finished' || s === 'disqualified' || (s === 'approved' && e.odds != null);
}

/* ── Formatting helpers ────────────────────────────────────────── */

/* Shown wherever a value has not been published yet. Spelled out rather than a
   dash so it reads the same to a screen reader as it does on screen. */
export const NO_VALUE = 'N/A';

export function fmtDate(iso?: string) {
  if (!iso) return NO_VALUE;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtTime(iso?: string) {
  if (!iso) return NO_VALUE;
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function fmtVnd(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export function fmtPrize(n?: number) {
  return n ? fmtVnd(n) : null;
}

export function fmtBalance(n: number | null) {
  return n != null ? fmtVnd(n) : NO_VALUE;
}

/** Compact label for a stake preset chip: 50_000 → "50K", 1_000_000 → "1M". */
export function fmtStakeChip(n: number) {
  return n >= 1_000_000 ? `${n / 1_000_000}M` : `${n / 1_000}K`;
}

/* How long is left to get a bet on. Coarser the further out the race is, because
   nobody needs the minute count on something four days away. Returns null once
   post time has passed, which is the caller's cue to show nothing. */
export function fmtCountdown(iso?: string, now: number = Date.now()) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) return null;

  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Under a minute to post';
  if (mins < 60) return `${mins}m to post`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m to post`;

  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h to post`;
}

/* ── Shared types ──────────────────────────────────────────────── */

/** raceHorseId → raw stake input string typed by the user. */
export type BetAmounts = Record<number, string>;

/** A race entry decorated with its display lane number. */
export type HorseEntry = RaceHorse & { laneNumber?: number };

/** One line in the bet slip: the horse, the stake and the potential payout. */
export type Selection = { horse: HorseEntry; amount: number; payout: number };
