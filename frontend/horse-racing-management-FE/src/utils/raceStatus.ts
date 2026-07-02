import type { Race, RaceStatus } from '@/types';

type ComputedStatus = RaceStatus | 'UNKNOWN';

type BadgeVariant = 'ocean' | 'warning' | 'danger' | 'neutral' | 'dark';

export function computeRaceStatus(race: Race | null, now = new Date()): ComputedStatus {
 if (!race) return 'UNKNOWN';
 if (race.status === 'CANCELLED') return 'CANCELLED';
 const start = new Date(race.startTime);
 const end = race.endTime ? new Date(race.endTime) : null;
 if (isNaN(start.getTime())) return 'UNKNOWN';
 if (now < start) return 'UPCOMING';
 if (end && now >= start && now <= end) return 'ONGOING';
 if (end && now > end) return 'FINISHED';
 return 'UNKNOWN';
}

const STATUS_LABELS: Record<string, string> = {
 UPCOMING: 'Upcoming',
 OPEN_REGISTRATION: 'Open Registration',
 CLOSED_REGISTRATION: 'Closed Registration',
 ONGOING: 'Live Now',
 FINISHED: 'Finished',
 COMPLETED: 'Completed',
 CANCELLED: 'Cancelled',
 UNKNOWN: 'Unknown',
};

export function getRaceStatusLabel(status: string): string {
 return STATUS_LABELS[status] ?? status;
}

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
 UPCOMING: 'ocean',
 OPEN_REGISTRATION: 'ocean',
 CLOSED_REGISTRATION: 'warning',
 ONGOING: 'danger',
 FINISHED: 'neutral',
 COMPLETED: 'neutral',
 CANCELLED: 'dark',
 UNKNOWN: 'neutral',
};

export function getRaceStatusVariant(status: string): BadgeVariant {
 return STATUS_VARIANTS[status] ?? 'neutral';
}
