import type { RaceHorse } from '@/types';

/**
 * Assigns lane numbers based on registration order (registerAt).
 * First registered = lane 1. Preserves laneNumber if already set by the backend.
 */
export function assignLanes(horses: (RaceHorse & { registerAt?: string })[]): typeof horses {
 return [...horses]
 .sort((a, b) => {
 if (!a.registerAt || !b.registerAt) return 0;
 return new Date(a.registerAt).getTime() - new Date(b.registerAt).getTime();
 })
 .map((h, i) => ({ ...h, laneNumber: h.laneNumber ?? i + 1 }));
}
