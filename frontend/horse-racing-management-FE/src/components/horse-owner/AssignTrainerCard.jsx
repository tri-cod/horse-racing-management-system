import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { assignTrainer } from '../../api/horseOwnerApi';

export default function AssignTrainerCard({ horseId, currentTrainerId, onAssigned }) {
  const [editing, setEditing] = useState(!currentTrainerId);
  const [trainerId, setTrainerId] = useState(currentTrainerId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trainerId || Number(trainerId) <= 0) {
      setError('Please enter a valid trainerId');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const updated = await assignTrainer(horseId, Number(trainerId));
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
      <p className="assign-trainer__note">Contact an admin to get the trainerId</p>
      <div className="assign-trainer__row">
        <input
          type="number"
          min="1"
          className="assign-trainer__input"
          placeholder="Enter trainerId"
          value={trainerId}
          onChange={(e) => {
            setTrainerId(e.target.value);
            setError('');
          }}
          disabled={loading}
        />
        <button type="submit" className="assign-trainer__btn" disabled={loading}>
          {loading ? 'Assigning...' : 'Assign Trainer'}
        </button>
        {currentTrainerId && (
          <button
            type="button"
            className="assign-trainer__cancel-btn"
            onClick={() => {
              setEditing(false);
              setError('');
              setTrainerId(currentTrainerId);
            }}
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
