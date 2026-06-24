import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { getAvailableHorses } from '../../api/horseOwnerApi';
import { getAvailableJockeys } from '../../api/jockeyApi';
import { registerHorseToRace } from '../../api/raceHorseApi';
import '../../assets/css/race-horse/RegisterHorseToRaceModal.css';

export default function RegisterHorseToRaceModal({ open, raceId, onClose, onSuccess }) {
  const [horses, setHorses] = useState([]);
  const [jockeys, setJockeys] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [selectedJockey, setSelectedJockey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !raceId) return;
    setLoadingData(true);
    setSelectedHorse(null);
    setSelectedJockey(null);
    setError(null);
    Promise.all([getAvailableHorses(), getAvailableJockeys(raceId)])
      .then(([h, j]) => { setHorses(h ?? []); setJockeys(j ?? []); })
      .catch(() => setError('Failed to load horses or jockeys.'))
      .finally(() => setLoadingData(false));
  }, [open, raceId]);

  // ... phần JSX bên dưới giữ nguyên không đổi

  const handleSubmit = async () => {
    if (!selectedHorse || !selectedJockey) {
      setError('Please select both a horse and a jockey.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await registerHorseToRace({ raceId, horseId: selectedHorse, jockeyId: selectedJockey });
      onSuccess?.('Horse registered successfully!');
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Register Horse to Race" size="lg">
      {loadingData ? (
        <LoadingSpinner />
      ) : (
        <div className="reg-modal">
          <div className="reg-modal__section">
            <h4 className="reg-modal__section-title">Select Horse</h4>
            {horses.length === 0 ? (
              <p className="reg-modal__empty">You have no registered horses.</p>
            ) : (
              <div className="reg-modal__horse-grid">
                {horses.map((h) => {
                  const hasTrainer = !!h.trainerId;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      className={[
                        'reg-modal__horse-card',
                        selectedHorse === h.id ? 'reg-modal__horse-card--selected' : '',
                        !hasTrainer ? 'reg-modal__horse-card--disabled' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => hasTrainer && setSelectedHorse(h.id)}
                      disabled={!hasTrainer}
                      title={!hasTrainer ? 'This horse has no trainer assigned' : undefined}
                    >
                      {h.avatarUrl && (
                        <img src={h.avatarUrl} alt={h.horseName} className="reg-modal__horse-img" />
                      )}
                      <span className="reg-modal__horse-name">{h.horseName}</span>
                      {!hasTrainer && (
                        <span className="reg-modal__no-trainer">No trainer</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="reg-modal__section">
            <h4 className="reg-modal__section-title">Select Jockey</h4>
            {jockeys.length === 0 ? (
              <p className="reg-modal__empty">No jockeys available.</p>
            ) : (
              <div className="reg-modal__jockey-list">
                {jockeys.map((j) => (
                  <label key={j.id} className="reg-modal__jockey-option">
                    <input
                      type="radio"
                      name="jockey"
                      value={j.id}
                      checked={selectedJockey === j.id}
                      onChange={() => setSelectedJockey(j.id)}
                    />
                    <span className="reg-modal__jockey-name">{j.name}</span>
                    <span className="reg-modal__jockey-meta">{j.experienceYear} yr exp · Age {j.age}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <p className="reg-modal__error">{error}</p>}

          <div className="reg-modal__footer">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting || !selectedHorse || !selectedJockey}>
              {submitting ? 'Registering…' : 'Register'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}