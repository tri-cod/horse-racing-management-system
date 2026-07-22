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

/** Race statuses that no longer accept wagers. */
export const NON_BETTABLE = new Set(['FINISHED', 'CANCELLED', 'ONGOING']);

/* Pre-race we list APPROVED entries with odds; once the race runs, the backend
   flips each entry's status to FINISHED/DISQUALIFIED — keep those visible too. */
export function isRunnerEntry(e: RaceHorse) {
  const s = e.status?.toLowerCase();
  return s === 'finished' || s === 'disqualified' || (s === 'approved' && e.odds != null);
}

/* ── Formatting helpers ────────────────────────────────────────── */

export function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtTime(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function fmtVnd(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export function fmtPrize(n?: number) {
  return n ? fmtVnd(n) : null;
}

export function fmtBalance(n: number | null) {
  return n != null ? fmtVnd(n) : '—';
}

/* ── Shared types ──────────────────────────────────────────────── */

/** raceHorseId → raw stake input string typed by the user. */
export type BetAmounts = Record<number, string>;

/** A race entry decorated with its display lane number. */
export type HorseEntry = RaceHorse & { laneNumber?: number };

/** One line in the bet slip: the horse, the stake and the potential payout. */
export type Selection = { horse: HorseEntry; amount: number; payout: number };
