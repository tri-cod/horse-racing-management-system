import type { TrainingContractStatus } from '@/types';

/** Case/format-insensitive compare of a training-contract status against a key. */
const squash = (s?: string | null) => (s ?? '').toUpperCase().replace(/[\s_-]/g, '');

export const isStatus = (status: unknown, want: TrainingContractStatus) =>
  squash(status as string) === squash(want as string);

export const isAnyStatus = (status: unknown, wants: TrainingContractStatus[]) =>
  wants.some((w) => isStatus(status, w));
