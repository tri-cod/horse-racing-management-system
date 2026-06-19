import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHorseById, updateHorse, deleteHorse } from '../api/horseOwnerApi';

export function useHorseDetail(horseId) {
  const navigate = useNavigate();
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchHorse = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHorseById(horseId);
      setHorse(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load horse details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [horseId]);

  useEffect(() => {
    fetchHorse();
  }, [fetchHorse]);

  const handleUpdate = useCallback(async (payload) => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const updated = await updateHorse(horseId, payload);
      setHorse(updated);
      return true; 
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update horse. Please try again.');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [horseId]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteHorse(horseId);
      navigate('/horse-owner/horses'); 
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete horse. Please try again.');
      setDeleting(false);
    }
  }, [horseId, navigate]);

  return {
    horse,
    loading,
    error,
    refetch: fetchHorse,
    handleUpdate,
    updating,
    updateError,
    handleDelete,
    deleting,
    deleteError,
  };
}
