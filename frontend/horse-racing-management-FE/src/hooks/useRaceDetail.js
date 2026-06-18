import { useCallback, useEffect, useState } from 'react';
import { getRaceById } from '../api/raceApi';
import { useRaceUpdates } from '../context/RaceSocketContext';

export function useRaceDetail(id) {
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const wsUpdates = useRaceUpdates();

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRaceById(id);
      setRace(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  // Apply real-time status patch from WebSocket
  useEffect(() => {
    if (!id || !wsUpdates) return;
    const upd = wsUpdates.get(String(id));
    if (!upd) return;
    setRace((prev) => {
      if (!prev || upd.status === prev.status) return prev;
      return { ...prev, status: upd.status };
    });
  }, [id, wsUpdates]);

  return { race, loading, error, refetch: fetch };
}
