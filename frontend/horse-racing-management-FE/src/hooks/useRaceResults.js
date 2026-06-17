import { useEffect, useState } from 'react';
import { getRaceResultsByRaceId } from '../api/raceResultApi';

export function useRaceResults(raceId) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!raceId) return;

    const loadResults = async () => {
      try {
        const data = await getRaceResultsByRaceId(raceId);
        setResults(data || []);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [raceId]);

  return {
    results,
    loading,
  };
}