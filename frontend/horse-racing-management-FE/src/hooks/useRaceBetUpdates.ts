import { useEffect, useState } from 'react';
import { useRaceSocket } from '@/context/RaceSocketContext';

interface BetUpdate {
 raceHorseId: number;
 horseName?: string;
 totalBetAmount: number;
 totalBetCount: number;
 odds?: number;
}

// Subscribes to /topic/race/{raceId}/bets for real-time bet aggregates.
// Returns a Map keyed by raceHorseId (string) so lookup is O(1) in render.
export function useRaceBetUpdates(raceId: number | undefined): Map<string, BetUpdate> {
 const { clientRef, connected } = useRaceSocket();
 const [betUpdates, setBetUpdates] = useState<Map<string, BetUpdate>>(new Map());

 useEffect(() => {
 if (!raceId || !connected || !clientRef.current) return;

 const sub = clientRef.current.subscribe(
`/topic/race/${raceId}/bets`,
 (msg) => {
 try {
 const update = JSON.parse(msg.body) as BetUpdate;
 if (!update.raceHorseId) return;
 setBetUpdates((prev) => {
 const next = new Map(prev);
 next.set(String(update.raceHorseId), update);
 return next;
 });
 } catch {
 // Ignore malformed frames
 }
 },
 );

 return () => sub.unsubscribe();
 }, [raceId, connected, clientRef]);

 return betUpdates;
}
