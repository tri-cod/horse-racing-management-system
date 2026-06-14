import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRaceDetail } from '../hooks/useRaceDetail';
import { updateRace } from '../api/raceApi';
import { useToast } from '../components/ui/ToastProvider';
import PageHero from '../components/ui/PageHero';
import RaceForm from '../components/race/RaceForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import '../assets/css/AdminRacePage.css';

export default function AdminEditRacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const { race, loading, error, refetch } = useRaceDetail(id);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      await updateRace(id, payload);
      addToast('Race updated successfully!', 'success');
      navigate(`/races/${id}`);
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to update race.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return (
    <div className="admin-race-page__error">
      <p>{error}</p>
      <Button variant="outline" onClick={refetch}>Try Again</Button>
    </div>
  );

  return (
    <div className="admin-race-page">
      <PageHero eyebrow="ADMIN" title="Edit Race" subtitle={race?.raceName} />
      <div className="admin-race-page__content">
        <RaceForm mode="edit" initialValues={race} onSubmit={handleSubmit} loading={saving} />
      </div>
    </div>
  );
}