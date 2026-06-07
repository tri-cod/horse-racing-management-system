/**
 * useRace.js — Custom hooks for Race module
 * Exports: useRaceList, useRaceDetail, useRaceForm, useRaceDelete
 */
import { useState, useEffect, useCallback } from 'react';
import { getRaces, getRaceById, createRace, updateRace, deleteRace } from '../api/raceApi';

const PAGE_SIZE = 9;

// ── Race list with filter + pagination ──────────────────────────────────────
export function useRaceList() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, size: PAGE_SIZE };
      if (status) params.status = status;
      const data = await getRaces(params);

      // Support both Spring Page<T> response and plain array
      if (data?.content) {
        setRaces(data.content);
        setTotalPages(data.totalPages ?? 0);
      } else if (Array.isArray(data)) {
        setRaces(data);
        setTotalPages(1);
      } else {
        setRaces([]);
        setTotalPages(0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load races.');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetchRaces();
  }, [fetchRaces]);

  const handleStatusChange = (newStatus) => {
    setPage(0);
    setStatus(newStatus);
  };

  return {
    races,
    loading,
    error,
    status,
    page,
    totalPages,
    setPage,
    handleStatusChange,
    refetch: fetchRaces,
  };
}

// ── Single race detail by ID ─────────────────────────────────────────────────
export function useRaceDetail(id) {
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRace = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRaceById(id);
      setRace(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load race details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRace();
  }, [fetchRace]);

  return { race, loading, error, refetch: fetchRace };
}

// ── Create / update race ─────────────────────────────────────────────────────
export function useRaceForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (mode, id, data) => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'edit') {
        await updateRace(id, data);
      } else {
        await createRace(data);
      }
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (mode === 'edit' ? 'Failed to update race.' : 'Failed to create race.')
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, submit };
}

// ── Delete race ──────────────────────────────────────────────────────────────
export function useRaceDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const remove = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteRace(id);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete race.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, remove };
}
