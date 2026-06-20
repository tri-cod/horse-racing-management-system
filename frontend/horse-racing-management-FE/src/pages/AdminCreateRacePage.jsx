import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Plus } from 'lucide-react';
import { createRace } from '../api/raceApi';
import { useToast } from '../components/ui/ToastProvider';
import RaceForm from '../components/race/RaceForm';
import RaceCard from '../components/race/RaceCard';
import Button from '../components/ui/Button';
import '../assets/css/AdminRacePage.css';

export default function AdminCreateRacePage() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [loading, setLoading] = useState(false);
  const [createdRace, setCreatedRace] = useState(null);

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      const newRace = await createRace(payload);
      addToast('Race created successfully!', 'success');
      setCreatedRace(newRace);
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to create race.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (createdRace) {
    return (
      <div className="admin-race-page">
        <div className="admin-race-page__content">
          <div className="race-create-success">
            <div className="race-create-success__icon">
              <CheckCircle size={52} strokeWidth={1.5} />
            </div>
            <h2 className="race-create-success__title">Race Created!</h2>
            <p className="race-create-success__sub">
              The race has been published and is now open for registration.
            </p>

            <div className="race-create-success__card">
              <RaceCard race={createdRace} isAdmin={false} />
            </div>

            <div className="race-create-success__actions">
              <Button variant="primary" size="lg" onClick={() => navigate(`/races/${createdRace.id}`)}>
                View Race
              </Button>
              <Button variant="outline" size="lg" onClick={() => setCreatedRace(null)}>
                <Plus size={16} /> Create Another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-race-page">
      <div className="admin-race-page__content">
        <RaceForm mode="create" onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}