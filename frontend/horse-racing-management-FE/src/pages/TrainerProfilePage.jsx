import { useState } from 'react';
import { useTrainerProfile } from '../hooks/useTrainerProfile';
import { useToast } from '../components/ui/ToastProvider';
import AvatarPreview from '../components/trainer/AvatarPreview';
import TrainerProfileForm from '../components/trainer/TrainerProfileForm';
import TrainerProfileView from '../components/trainer/TrainerProfileView';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import '../assets/css/TrainerProfilePage.css';

export default function TrainerProfilePage() {
  const { profile, loading, error, refetch, save } = useTrainerProfile();
  const addToast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isNew = !profile || (profile.age == null && profile.experienceYears == null);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      await save(payload);
      addToast('Profile saved successfully.', 'success');
      setEditing(false);
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  if (error) return (
    <div className="trainer-profile-page">
      <div className="trainer-profile-page__error">
        <p>{error}</p>
        <Button variant="outline" onClick={refetch}>Try Again</Button>
      </div>
    </div>
  );

  return (
    <div className="trainer-profile-page">
<div className="trainer-profile-page__content">
        <div className="trainer-profile-page__sidebar">
          <AvatarPreview url={profile?.avatarUrl} name={profile?.name} />
          <h2 className="trainer-profile-page__name">{profile?.name || 'Trainer'}</h2>
        </div>

        <div className="trainer-profile-page__main">
          {!editing && !isNew && (
            <div className="trainer-profile-page__toolbar">
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            </div>
          )}

          {(editing || isNew) ? (
            <TrainerProfileForm
              initialValues={profile ?? {}}
              onSubmit={handleSave}
              loading={saving}
            />
          ) : (
            <TrainerProfileView profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
}