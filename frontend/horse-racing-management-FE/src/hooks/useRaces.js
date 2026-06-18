import { useCallback, useEffect, useState } from 'react';
import { getRaces } from '../api/raceApi';
import { useRaceUpdates } from '../context/RaceSocketContext';

export function useRaces({ page = 0, size = 9 } = {}) {
  const [races, setRaces] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const wsUpdates = useRaceUpdates();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRaces({ page, size });
      setRaces(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Apply real-time status patches from WebSocket
  useEffect(() => {
    if (!wsUpdates || wsUpdates.size === 0) return;
    setRaces((prev) =>
      prev.map((r) => {
        const upd = wsUpdates.get(String(r.id));
        if (!upd || upd.status === r.status) return r;
        return { ...r, status: upd.status };
      })
    );
  }, [wsUpdates]);

  return { races, totalPages, totalElements, loading, error, refetch: fetch };
}
