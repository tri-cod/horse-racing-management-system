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
  const [closing, setClosing] = useState(false);

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

  const handleCloseRegistration = async () => {
    if (!window.confirm(`Đóng đăng ký race "${race.raceName}"? Người dùng sẽ không thể đăng ký thêm.`)) return;
    setClosing(true);
    try {
      await updateRace(id, {
        raceName: race.raceName,
        startTime: race.startTime,
        endTime: race.endTime,
        trackName: race.trackName,
        trackCondition: race.trackCondition,
        surfaceType: race.surfaceType,
        totalprizepool: race.totalprizepool,
        distance: race.distance,
        location: race.location,
        capacity: race.capacity,
        bannerImageurl: race.bannerImageurl,
        registrationDeadline: race.registrationDeadline,
        refereeId: race.refereeId ?? null,
        status: 'CLOSED_REGISTRATION',
      });
      addToast('Đã đóng đăng ký race!', 'success');
      refetch();
    } catch (e) {
      addToast(e.response?.data?.message || 'Không thể đóng đăng ký.', 'error');
    } finally {
      setClosing(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return (
    <div className="admin-race-page__error">
      <p>{error}</p>
      <Button variant="outline" onClick={refetch}>Try Again</Button>
    </div>
  );

  const canClose = race?.status === 'UPCOMING' || race?.status === 'OPEN_REGISTRATION';

  return (
    <div className="admin-race-page">
      <PageHero eyebrow="ADMIN" title="Edit Race" subtitle={race?.raceName} />
      <div className="admin-race-page__content">
        {canClose && (
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={handleCloseRegistration} disabled={closing}>
              {closing ? 'Đang xử lý...' : '🔒 Đóng đăng ký'}
            </Button>
          </div>
        )}
        {race?.status === 'CLOSED_REGISTRATION' && (
          <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#fef3c7', color: '#92400e', borderRadius: '8px', fontSize: '13px' }}>
            Đăng ký đã đóng — referee có thể bắt đầu race.
          </div>
        )}
        <RaceForm mode="edit" initialValues={race} onSubmit={handleSubmit} loading={saving} />
      </div>
    </div>
  );
}