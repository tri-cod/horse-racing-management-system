import { useContext, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Edit, Trash2, Plus, XCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useRaceDetail } from '../hooks/useRaceDetail';
import { useToast } from '../components/ui/ToastProvider';
import { deleteRace, updateRace } from '../api/raceApi';
import { computeRaceStatus } from '../utils/raceStatus';
import RaceStatusBadge from '../components/race/RaceStatusBadge';
import RaceMetaStrip from '../components/race/RaceMetaStrip';
import RaceInfoSection from '../components/race/RaceInfoSection';
import RegisteredHorsesList from '../components/race-horse/RegisteredHorsesList';
import RegisterHorseToRaceModal from '../components/race-horse/RegisterHorseToRaceModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import '../assets/css/RaceDetailPage.css';

export default function RaceDetailPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const addToast = useToast();
  const { race, loading, error, refetch } = useRaceDetail(id);

  const [showRegModal, setShowRegModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRace(id);
      addToast('Race deleted.', 'success');
      navigate('/races');
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to delete race.', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await updateRace(id, { ...race, status: 'CANCELLED' });
      addToast('Race cancelled.', 'success');
      refetch();
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to cancel race.', 'error');
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return (
    <div className="race-detail-page__error">
      <p>{error}</p>
      <Button variant="outline" onClick={refetch}>Try Again</Button>
    </div>
  );
  if (!race) return null;

  const isAdmin = user?.role === 'ADMIN';
  const isOwner = user?.role === 'HORSE_OWNER';
  const computedStatus = computeRaceStatus(race);
  const canRegister = isOwner && computedStatus === 'UPCOMING';
  const canCancel = isAdmin && computedStatus === 'UPCOMING';

  return (
    <div className="race-detail-page">
      <div className="race-detail-page__banner">
        {race.bannerImageurl ? (
          <img src={race.bannerImageurl} alt={race.raceName} className="race-detail-page__banner-img" />
        ) : (
          <div className="race-detail-page__banner-placeholder" />
        )}
        <div className="race-detail-page__banner-overlay">
          <div className="race-detail-page__banner-content">
            <h1 className="race-detail-page__title">{race.raceName}</h1>
          </div>
        </div>
      </div>

      <RaceMetaStrip race={race} />

      <div className="race-detail-page__body">
        <div className="race-detail-page__actions">
          <RaceStatusBadge race={race} size="lg" />
          <div className="race-detail-page__actions-btns">
            {isAdmin && (
              <>
                <Link to={`/admin/races/${id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit size={15} /> Edit
                  </Button>
                </Link>
                {canCancel && (
                  <Button variant="dark" size="sm" onClick={() => setShowCancelConfirm(true)}>
                    <XCircle size={15} /> Cancel Race
                  </Button>
                )}
                <Button variant="dark" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={15} /> Delete
                </Button>
              </>
            )}
            {canRegister && (
              <Button variant="primary" onClick={() => setShowRegModal(true)}>
                <Plus size={16} /> Register My Horse
              </Button>
            )}
          </div>
        </div>

        <RaceInfoSection race={race} />

        <section className="race-detail-page__entries">
          <h2>Registered Horses</h2>
          <RegisteredHorsesList
            raceId={id}
            isAdmin={isAdmin}
            onToast={(msg, type) => addToast(msg, type ?? 'success')}
          />
        </section>
      </div>

      <RegisterHorseToRaceModal
        open={showRegModal}
        raceId={Number(id)}
        onClose={() => setShowRegModal(false)}
        onSuccess={(msg) => { addToast(msg, 'success'); }}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Race?"
        message={`"${race.raceName}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel Race?"
        message="This race will be marked as cancelled. Registered horse owners will be notified."
        confirmLabel="Cancel Race"
        variant="danger"
      />
    </div>
  );
}
