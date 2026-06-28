import { useState } from 'react';
import { useTrainerProfile } from '../../hooks/queries/useTrainerProfile';
import { useToast } from '../../components/ui/ToastProvider';
import AvatarPreview from '../../components/trainer/AvatarPreview';
import TrainerProfileForm from '../../components/trainer/TrainerProfileForm';
import TrainerProfileView from '../../components/trainer/TrainerProfileView';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import DashboardPageHeader from '../../components/shared/DashboardPageHeader';
import Seo from '../../components/seo/Seo';
import '../../assets/css/TrainerProfilePage.css';
import '../../assets/css/shared/workspace.css';

export default function TrainerProfilePage() {
  const { profile, loading, error, refetch, save } = useTrainerProfile();
  const addToast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);

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
    <div className="ws-page">
      <div className="ws-body ws-body--narrow">
        <div className="ws-error">
          <span>{error}</span>
          <Button variant="outline" onClick={refetch}>Try Again</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ws-page">
      <Seo title="Trainer Profile" description="Manage your Royal Derby trainer profile." />
      <DashboardPageHeader
        eyebrow="Trainer"
        title={profile?.name || 'My Profile'}
        subtitle="Manage your trainer profile and details"
        action={
          !editing && !isNew ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit Profile</Button>
          ) : undefined
        }
      />

      <div className="ws-body">
        <div className="trainer-profile-page__content" style={{ gridTemplateColumns: '240px 1fr', display: 'grid', gap: 'var(--space-8)', alignItems: 'start' }}>
          <div className="trainer-profile-page__sidebar">
            <AvatarPreview url={profile?.avatarUrl} name={profile?.name} />
            <h1 className="trainer-profile-page__name">{profile?.name || 'Trainer'}</h1>
            {profile && (
              <span className="trainer-profile-page__status">
                {profile.experienceYears != null ? `${profile.experienceYears} yrs exp.` : 'New Trainer'}
              </span>
            )}
          </div>

          <div className="ws-panel">
            <div className="ws-panel__body">
              {(editing || isNew) ? (
                <TrainerProfileForm initialValues={profile ?? {}} onSubmit={handleSave} loading={saving} />
              ) : (
                <TrainerProfileView profile={profile} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
