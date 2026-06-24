import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useHorseForm } from '../hooks/useHorseForm';
import HorseForm from '../components/horse-owner/HorseForm';
import Seo from '../components/seo/Seo';
import '../assets/css/HorseRegisterPage.css';

export default function HorseRegisterPage() {
  const navigate = useNavigate();
  const {
    form,
    errors,
    loading,
    apiError,
    avatarPreview,
    avatarFileName,
    handleChange,
    handleBlur,
    handleAvatarChange,
    handleAvatarRemove,
    handleSubmit,
  } = useHorseForm();

  return (
    <div className="horse-register-page">
      <Seo title="Register Horse" description="Register a new racehorse on Royal Derby — add details, breed and trainer." />
      <div className="horse-register-page__container">
        <button type="button" className="horse-register__back-btn" onClick={() => navigate('/horse-owner/horses')}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="horse-register__card">
          <div className="horse-register__header">
            <h1>Register A New Horse</h1>
            <p>Fill in the details about your horse.</p>
          </div>

          {apiError && <div className="horse-register__error-banner">{apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <HorseForm
              form={form}
              errors={errors}
              loading={loading}
              avatarPreview={avatarPreview}
              avatarFileName={avatarFileName}
              handleChange={handleChange}
              handleBlur={handleBlur}
              handleAvatarChange={handleAvatarChange}
              handleAvatarRemove={handleAvatarRemove}
            />

            <button type="submit" className="horse-register__submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register Horse'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
