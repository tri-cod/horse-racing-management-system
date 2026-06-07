// Module: Race Horse — Custom hooks
// Exports: useRaceHorseList, useMyRaceHorses, useRaceHorseRegister, useRaceHorseAction
import { useState, useEffect, useCallback } from 'react';
import {
  getRaceHorseList,
  getMyHorseRaces,
  registerHorseToRace,
  approveRaceHorse,
  rejectRaceHorse,
} from '../api/raceHorseApi';

// Safely extracts the list from various response shapes:
// { status, message, data: [...] }  →  data field
// { status, message, data: { content: [...] } }  →  content field
// plain array  →  as-is
function extractList(res) {
  if (!res) return [];
  const raw = res?.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (raw?.content) return raw.content;
  return [];
}

// ── List registrations for a specific race ───────────────────────────────────
// fetchList(raceId) is manual — called when user selects a race
export function useRaceHorseList() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchList = useCallback(async (raceId) => {
    if (!raceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getRaceHorseList(raceId);
      setRegistrations(extractList(res));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load race registrations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setRegistrations([]), []);

  return { registrations, loading, error, fetchList, reset };
}

// ── My race registrations (HORSE_OWNER) ─────────────────────────────────────
export function useMyRaceHorses() {
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyRaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyHorseRaces();
      setMyRegistrations(extractList(res));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your registrations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRaces();
  }, [fetchMyRaces]);

  return { myRegistrations, loading, error, fetchMyRaces };
}

// ── Register horse to race ───────────────────────────────────────────────────
export function useRaceHorseRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submitRegister = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await registerHorseToRace(payload);
      setSuccess(res?.message || 'Registration submitted successfully!');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit registration.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, submitRegister };
}

// ── Approve / Reject a registration (ADMIN) ──────────────────────────────────
export function useRaceHorseAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApprove = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await approveRaceHorse(id);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve registration.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await rejectRaceHorse(id);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject registration.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleApprove, handleReject };
}
