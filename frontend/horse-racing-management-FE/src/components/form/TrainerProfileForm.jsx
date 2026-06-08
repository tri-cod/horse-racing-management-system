import { FIELDS, useTrainerProfile } from '../../hooks/useTrainerProfile';
import AvatarUpload from './AvatarUpload';

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default function TrainerProfileForm() {
  const {
    form, errors, loading, fetching, apiError, success, profile,
    handleChange, handleBlur, handleAvatarChange, handleSubmit,
  } = useTrainerProfile();

  if (fetching) {
    return (
      <div className="tp-loading">
        <div className="tp-loading__spinner" />
        <p>Loading your profile…</p>
      </div>
    );
  }

  const isFirstTime = !profile?.age;

  return (
    <div className="tp-form-wrapper">
      <div className="tp-header">
        <p className="tp-header__label">TRAINER PROFILE</p>
        <h1 className="tp-header__title">
          {isFirstTime ? 'Complete Your Profile' : 'Your Profile'}
        </h1>
        <p className="tp-header__sub">
          {isFirstTime
            ? 'Fill in your professional details to get started'
            : 'Update your professional information below'}
        </p>
      </div>

      <div className="tp-identity">
        <AvatarUpload
          value={form.avatarUrl}
          onChange={handleAvatarChange}
          error={errors.avatarUrl}
        />
        <div className="tp-identity__info">
          {profile?.name && <span className="tp-identity__name">{profile.name}</span>}
          {profile?.status && (
            <span className={`tp-badge tp-badge--${profile.status.toLowerCase()}`}>
              {profile.status}
            </span>
          )}
        </div>
      </div>

      {apiError && <p className="tp-form__api-error">{apiError}</p>}
      {success && (
        <p className="tp-form__success">
          <CheckIcon /> {success}
        </p>
      )}

      <form className="tp-form" onSubmit={handleSubmit} noValidate>
        <div className="tp-form__grid">
          {FIELDS.map((f) => (
            <div
              key={f.name}
              className={`tp-form__group${f.full ? ' tp-form__group--full' : ''}`}
            >
              <label className="tp-form__label" htmlFor={`trainer-${f.name}`}>
                {f.label}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  id={`trainer-${f.name}`}
                  name={f.name}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={5}
                  className={`tp-form__input tp-form__textarea${errors[f.name] ? ' tp-form__input--error' : ''}`}
                />
              ) : (
                <input
                  id={`trainer-${f.name}`}
                  name={f.name}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={f.type === 'number' ? 0 : undefined}
                  className={`tp-form__input${errors[f.name] ? ' tp-form__input--error' : ''}`}
                />
              )}
              {errors[f.name] && <span className="tp-form__error">{errors[f.name]}</span>}
            </div>
          ))}
        </div>

        <button type="submit" className="tp-form__submit" disabled={loading}>
          {loading ? 'Saving…' : isFirstTime ? 'Complete Profile' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}