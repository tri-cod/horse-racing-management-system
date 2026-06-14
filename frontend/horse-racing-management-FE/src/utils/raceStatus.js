export function computeRaceStatus(race, now = new Date()) {
  if (!race) return 'UNKNOWN';
 
  const s = race.status;
  if (s === 'CANCELLED') return 'CANCELLED';
  if (s === 'OPEN_REGISTRATION') return 'OPEN_REGISTRATION';
  if (s === 'CLOSED_REGISTRATION') return 'CLOSED_REGISTRATION';
  if (s === 'OPEN_BETTING') return 'OPEN_BETTING';
  if (s === 'ONGOING') return 'ONGOING';
  if (s === 'FINISHED') return 'COMPLETED';
 
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
      UPCOMING: 'Upcoming',
      OPEN_REGISTRATION: 'Registration Open',
      CLOSED_REGISTRATION: 'Betting Open',
      OPEN_BETTING: 'Betting Open',
      ONGOING: 'Live Now',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      UNKNOWN: 'Unknown',
    }[status] || status
  );
}

export function getRaceStatusVariant(status) {
  return (
    {
      UPCOMING: 'ocean',
      OPEN_REGISTRATION: 'success',
      CLOSED_REGISTRATION: 'warning',
      OPEN_BETTING: 'warning',
      ONGOING: 'danger',
      COMPLETED: 'neutral',
      CANCELLED: 'dark',
      UNKNOWN: 'neutral',
    }[status] || 'neutral'
  );
}