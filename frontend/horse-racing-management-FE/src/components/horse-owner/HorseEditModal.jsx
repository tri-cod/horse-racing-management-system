import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'RETIRE'];
const GENDER_OPTIONS = ['Male', 'Female'];

export default function HorseEditModal({ horse, onClose, onSubmit, loading, error }) {
  const [form, setForm] = useState({
    horseName: '',
    breed: '',
    age: '',
    gender: '',
    weight: '',
    speedRating: '',
    history_rank: '',
    status: '',
  });

  useEffect(() => {
    if (horse) {
      setForm({
        horseName:   horse.horseName   || '',
        breed:       horse.breed       || '',
        age:         horse.age         ?? '',
        gender:      horse.gender      || '',
        weight:      horse.weight      ?? '',
        speedRating: horse.speedRating ?? '',
        history_rank: horse.historyRank || '',
        status:      horse.status      || 'ACTIVE',
      });
    }
  }, [horse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {};
    if (form.horseName)   payload.horseName    = form.horseName;
    if (form.breed)       payload.breed        = form.breed;
    if (form.age !== '')  payload.age          = Number(form.age);
    if (form.gender)      payload.gender       = form.gender;
    if (form.weight !== '') payload.weight     = Number(form.weight);
    if (form.speedRating !== '') payload.speedRating = Number(form.speedRating);
    if (form.history_rank) payload.history_rank = form.history_rank;
    if (form.status)      payload.status       = form.status;

    onSubmit(payload);
  };

  return (
    <div className="horse-modal__overlay" onClick={onClose}>
      <div className="horse-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="horse-modal__header">
          <h2 className="horse-modal__title">Edit Horse</h2>
          <button type="button" className="horse-modal__close-btn" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="horse-modal__error-banner">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="horse-modal__grid">
            <div className="horse-modal__field">
              <label className="horse-modal__label">Horse Name</label>
              <input
                name="horseName"
                className="horse-modal__input"
                value={form.horseName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="horse-modal__field">
              <label className="horse-modal__label">Breed</label>
              <input
                name="breed"
                className="horse-modal__input"
                value={form.breed}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="horse-modal__field">
              <label className="horse-modal__label">Age (years)</label>
              <input
                name="age"
                type="number"
                min="0"
                className="horse-modal__input"
                value={form.age}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="horse-modal__field">
              <label className="horse-modal__label">Gender</label>
              <select
                name="gender"
                className="horse-modal__input"
                value={form.gender}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">— Select —</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="horse-modal__field">
              <label className="horse-modal__label">Weight (kg)</label>
              <input
                name="weight"
                type="number"
                min="0"
                className="horse-modal__input"
                value={form.weight}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="horse-modal__field">
              <label className="horse-modal__label">Speed Rating</label>
              <input
                name="speedRating"
                type="number"
                min="0"
                className="horse-modal__input"
                value={form.speedRating}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="horse-modal__field horse-modal__field--full">
              <label className="horse-modal__label">Achievements / History Rank</label>
              <input
                name="history_rank"
                className="horse-modal__input"
                value={form.history_rank}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="horse-modal__field">
              <label className="horse-modal__label">Status</label>
              <select
                name="status"
                className="horse-modal__input"
                value={form.status}
                onChange={handleChange}
                disabled={loading}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="horse-modal__footer">
            <button
              type="button"
              className="horse-modal__btn horse-modal__btn--cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="horse-modal__btn horse-modal__btn--save"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
