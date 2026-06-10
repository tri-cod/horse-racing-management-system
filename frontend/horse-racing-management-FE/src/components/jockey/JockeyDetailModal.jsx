import { useEffect } from 'react';
import { X, User, Calendar, Award, Star } from 'lucide-react';
import '../../assets/css/JockeyDetailModal.css';

export default function JockeyDetailModal({ jockey, onClose }) {
  useEffect(() => {
    if (!jockey) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jockey, onClose]);

  if (!jockey) return null;

  return (
    <div className="jockey-modal__overlay" onClick={onClose}>
      <div className="jockey-modal__content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="jockey-modal__close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="jockey-modal__avatar">
          <User size={48} />
        </div>

        <h2 className="jockey-modal__name">{jockey.name}</h2>

        <div className="jockey-modal__info">
          <div className="jockey-modal__info-row">
            <span className="jockey-modal__info-icon"><User size={18} /></span>
            <span className="jockey-modal__info-label">Jockey ID</span>
            <span className="jockey-modal__info-value">#{jockey.id}</span>
          </div>

          <div className="jockey-modal__info-row">
            <span className="jockey-modal__info-icon"><Calendar size={18} /></span>
            <span className="jockey-modal__info-label">Age</span>
            <span className="jockey-modal__info-value">{jockey.age} yrs old</span>
          </div>

          <div className="jockey-modal__info-row">
            <span className="jockey-modal__info-icon"><Award size={18} /></span>
            <span className="jockey-modal__info-label">Experience</span>
            <span className="jockey-modal__info-value">{jockey.experienceYear} years</span>
          </div>

          <div className="jockey-modal__info-row">
            <span className="jockey-modal__info-icon"><Star size={18} /></span>
            <span className="jockey-modal__info-label">Status</span>
            <span className="jockey-modal__info-value jockey-modal__status-badge">Active</span>
          </div>
        </div>

        <p className="jockey-modal__note">
          More details (bio, achievements, etc.) will be added once the backend supports them.
        </p>
      </div>
    </div>
  );
}
