import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRace } from '../api/raceApi';
import { useToast } from '../components/ui/ToastProvider';
import PageHero from '../components/ui/PageHero';
import RaceForm from '../components/race/RaceForm';
import '../assets/css/AdminRacePage.css';

export default function AdminCreateRacePage() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      const newRace = await createRace(payload);
      addToast('Race created successfully!', 'success');
      navigate(`/races/${newRace.id}`);
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to create race.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-race-page">
      <PageHero eyebrow="ADMIN" title="Create New Race" />
      <div className="admin-race-page__content">
        <RaceForm mode="create" onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}