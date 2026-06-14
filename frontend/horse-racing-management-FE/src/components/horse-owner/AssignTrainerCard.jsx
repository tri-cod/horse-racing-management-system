import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { assignTrainer } from '../../api/horseOwnerApi';
import { useTrainers } from '../../hooks/useTrainers';
import '../../assets/css/horse-owner/AssignTrainerCard.css';

export default function AssignTrainerCard({ horseId, currentTrainerId, onAssigned }) {
  const [editing, setEditing] = useState(!currentTrainerId);
  const [selectedId, setSelectedId] = useState(currentTrainerId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { trainers, loading: loadingTrainers } = useTrainers();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select a trainer');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const updated = await assignTrainer(horseId, Number(selectedId));
      setEditing(false);
      onAssigned?.(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign trainer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <button type="button" className="assign-trainer__change-btn" onClick={() => setEditing(true)}>
        <UserPlus size={16} />
        Change Trainer
      </button>
    );
  }

  return (
    <form className="assign-trainer" onSubmit={handleSubmit}>
      <div className="assign-trainer__row">
        <select
          className="assign-trainer__select"
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); setError(''); }}
          disabled={loading || loadingTrainers}
        >
          <option value="">
            {loadingTrainers ? 'Loading trainers...' : '— Select a trainer —'}
          </option>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name || `Trainer #${t.id}`}
              {t.experienceYears != null ? ` (${t.experienceYears} yrs exp)` : ''}
            </option>
          ))}
        </select>
        <button type="submit" className="assign-trainer__btn" disabled={loading || loadingTrainers}>
          {loading ? 'Assigning...' : 'Assign Trainer'}
        </button>
        {currentTrainerId && (
          <button
            type="button"
            className="assign-trainer__cancel-btn"
            onClick={() => { setEditing(false); setError(''); setSelectedId(currentTrainerId); }}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
      {error && <p className="assign-trainer__error">{error}</p>}
    </form>
  );
}
