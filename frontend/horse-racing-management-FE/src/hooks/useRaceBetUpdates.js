import { useEffect, useState } from 'react';
import { useRaceSocket } from '../context/RaceSocketContext';

// Subscribe real-time bet totals cho một race cụ thể (/topic/race/{raceId}/bets)
// Returns Map<raceHorseId (string), { raceHorseId, horseName, totalBetAmount, totalBetCount, odds }>
export function useRaceBetUpdates(raceId) {
  const { clientRef, connected } = useRaceSocket();
  const [betUpdates, setBetUpdates] = useState(new Map());

  useEffect(() => {
    if (!raceId || !connected || !clientRef.current) return;

    const sub = clientRef.current.subscribe(
      `/topic/race/${raceId}/bets`,
      (msg) => {
        try {
          const update = JSON.parse(msg.body);
          if (!update.raceHorseId) return;
          setBetUpdates((prev) => {
            const next = new Map(prev);
            next.set(String(update.raceHorseId), update);
            return next;
          });
        } catch {
          // ignore malformed frames
        }
      }
    );

    return () => sub.unsubscribe();
  }, [raceId, connected, clientRef]);

  return betUpdates;
}
