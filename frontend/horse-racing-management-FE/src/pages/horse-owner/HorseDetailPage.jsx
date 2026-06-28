import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cake, VenetianMask, Weight, TrendingUp, History, Calendar, User } from 'lucide-react';
import { useHorseDetail } from '../../hooks/queries/useHorseDetail';
import HorseStatusBadge from '../../components/horse-owner/HorseStatusBadge';
import AssignTrainerCard from '../../components/horse-owner/AssignTrainerCard';
import Seo from '../../components/seo/Seo';
import '../../assets/css/HorseDetailPage.css';

const getValue = (value) => (value || value === 0 ? value : '—');

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-US');
  } catch {
    return value;
  }
};

export default function HorseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { horse, loading, error, refetch } = useHorseDetail(id);

  if (loading) {
    return (
      <div className="horse-detail-page">
        <div className="horse-detail-page__container">
          <div className="horse-detail__hero">
            <div className="horse-detail__hero-avatar horse-detail__skeleton" />
            <div className="horse-detail__hero-info">
              <div className="horse-detail__skeleton horse-detail__skeleton-line" style={{ width: '60%' }} />
              <div className="horse-detail__skeleton horse-detail__skeleton-line" style={{ width: '40%' }} />
            </div>
          </div>
          <div className="horse-detail__card">
            <div className="horse-detail__grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="horse-detail__field horse-detail__skeleton horse-detail__skeleton-box" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="horse-detail-page">
        <div className="horse-detail-page__container">
          <div className="horse-detail__error-banner">
            <span>{error}</span>
            <button type="button" className="horse-detail__retry-btn" onClick={refetch}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!horse) return null;

  return (
    <div className="horse-detail-page">
      <Seo
        title={horse.horseName}
        description={`${horse.horseName} — ${horse.breed ?? 'Racehorse'} on Royal Derby. Speed rating: ${horse.speedRating ?? 'N/A'}.`}
      />
      <div className="horse-detail-page__container">
        <button type="button" className="horse-detail__back-btn" onClick={() => navigate('/horse-owner/horses')}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="horse-detail__hero">
          <div className="horse-detail__hero-avatar">
            {horse.avatarUrl ? (
              <img src={horse.avatarUrl} alt={horse.horseName} className="horse-detail__hero-image" />
            ) : (
              <div className="horse-detail__hero-fallback">{horse.horseName?.charAt(0)?.toUpperCase() || 'H'}</div>
            )}
          </div>

          <div className="horse-detail__hero-info">
            <p className="horse-detail__hero-subtitle">{getValue(horse.breed)}</p>
            <h1 className="horse-detail__hero-title">{getValue(horse.horseName)}</h1>
            <div className="horse-detail__hero-badges">
              <HorseStatusBadge status={horse.status} />
            </div>
          </div>
        </div>

        <div className="horse-detail__card">
          <div className="horse-detail__card-header">
            <div>
              <h2>Detailed Information</h2>
              <p>Stats and achievements for this horse.</p>
            </div>
          </div>

          <div className="horse-detail__grid">
            <div className="horse-detail__field">
              <div className="horse-detail__field-icon"><Cake size={18} /></div>
              <div>
                <p className="horse-detail__field-label">Age</p>
                <p className="horse-detail__field-value">{getValue(horse.age)}</p>
              </div>
            </div>

            <div className="horse-detail__field">
              <div className="horse-detail__field-icon"><VenetianMask size={18} /></div>
              <div>
                <p className="horse-detail__field-label">Gender</p>
                <p className="horse-detail__field-value">{getValue(horse.gender)}</p>
              </div>
            </div>

            <div className="horse-detail__field">
              <div className="horse-detail__field-icon"><Weight size={18} /></div>
              <div>
                <p className="horse-detail__field-label">Weight</p>
                <p className="horse-detail__field-value">{horse.weight != null ? `${horse.weight} kg` : '—'}</p>
              </div>
            </div>

            <div className="horse-detail__field">
              <div className="horse-detail__field-icon"><TrendingUp size={18} /></div>
              <div>
                <p className="horse-detail__field-label">Speed Rating</p>
                <p className="horse-detail__field-value">{getValue(horse.speedRating)}</p>
              </div>
            </div>

            <div className="horse-detail__field">
              <div className="horse-detail__field-icon"><History size={18} /></div>
              <div>
                <p className="horse-detail__field-label">Achievements</p>
                <p className="horse-detail__field-value">{getValue(horse.historyRank)}</p>
              </div>
            </div>

            <div className="horse-detail__field">
              <div className="horse-detail__field-icon"><Calendar size={18} /></div>
              <div>
                <p className="horse-detail__field-label">Registered On</p>
                <p className="horse-detail__field-value">{formatDate(horse.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="horse-detail__trainer-section">
            <div className="horse-detail__trainer-header">
              <div className="horse-detail__field-icon"><User size={18} /></div>
              <div>
                <p className="horse-detail__field-label">Trainer</p>
                <p className="horse-detail__field-value">{horse.trainerName || 'No trainer assigned'}</p>
              </div>
            </div>

            <AssignTrainerCard
              horseId={horse.id}
              currentTrainerId={horse.trainerId}
              onAssigned={refetch}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
