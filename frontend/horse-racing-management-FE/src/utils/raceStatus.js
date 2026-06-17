export function computeRaceStatus(race, now = new Date()) {
  if (!race) return 'UNKNOWN';
  if (race.status === 'CANCELLED') return 'CANCELLED';
  const start = new Date(race.startTime);
  const end = new Date(race.endTime);
  if (isNaN(start) || isNaN(end)) return 'UNKNOWN';
  if (now < start) return 'UPCOMING';
  if (now >= start && now <= end) return 'ONGOING';
  if (now > end) return 'COMPLETED';
  return 'UNKNOWN';
}

export function getRaceStatusLabel(status) {
  return (
    {
      UPCOMING:             'Upcoming',
      OPEN_REGISTRATION:    'Open Registration',
      CLOSED_REGISTRATION:  'Closed Registration',
      ONGOING:              'Live Now',
      FINISHED:             'Finished',
      COMPLETED:            'Completed',
      CANCELLED:            'Cancelled',
      UNKNOWN:              'Unknown',
    }[status] || status
  );
}

export function getRaceStatusVariant(status) {
  return (
    {
      UPCOMING:             'ocean',
      OPEN_REGISTRATION:    'ocean',
      CLOSED_REGISTRATION:  'warning',
      ONGOING:              'danger',
      FINISHED:             'neutral',
      COMPLETED:            'neutral',
      CANCELLED:            'dark',
      UNKNOWN:              'neutral',
    }[status] || 'neutral'
  );
}