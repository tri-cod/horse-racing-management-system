import { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { FIELDS } from '../../hooks/forms/useHorseForm';

export default function HorseForm({
  register,
  validationRules,
  errors,
  loading,
  avatarPreview,
  avatarFileName,
  handleAvatarChange,
  handleAvatarRemove,
}) {
  const avatarInputRef = useRef(null);

  const openAvatarPicker = () => {
    avatarInputRef.current?.click();
  };

  return (
    <div className="horse-form__grid">
      {FIELDS.map((field) => (
        <div
          key={field.name}
          className={`horse-form__field${field.type === 'file' ? ' horse-form__field--avatar' : ''}`}
        >
          <label className="horse-form__label" htmlFor={field.name}>
            {field.label}
          </label>

          {field.type === 'select' ? (
            <select
              id={field.name}
              className={`horse-form__input${errors[field.name] ? ' horse-form__input--error' : ''}`}
              disabled={loading}
              {...register(field.name, validationRules[field.name])}
            >
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.type === 'file' ? (
            <>
              <input
                ref={avatarInputRef}
                id={field.name}
                type="file"
                accept="image/*"
                className="horse-form__file-input"
                onChange={handleAvatarChange}
                disabled={loading}
              />

              {avatarPreview ? (
                <div className="horse-form__avatar-preview">
                  <img src={avatarPreview} alt="Avatar preview" className="horse-form__avatar-image" />
                  <div className="horse-form__avatar-info">
                    <span className="horse-form__avatar-filename">{avatarFileName || 'Selected image'}</span>
                    <div className="horse-form__avatar-actions">
                      <button
                        type="button"
                        className="horse-form__avatar-btn"
                        onClick={openAvatarPicker}
                        disabled={loading}
                      >
                        <Upload size={14} />
                        Change
                      </button>
                      <button
                        type="button"
                        className="horse-form__avatar-btn horse-form__avatar-btn--remove"
                        onClick={handleAvatarRemove}
                        disabled={loading}
                      >
                        <X size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={`horse-form__avatar-dropzone${errors[field.name] ? ' horse-form__avatar-dropzone--error' : ''}`}
                  onClick={openAvatarPicker}
                  disabled={loading}
                >
                  <ImageIcon size={28} className="horse-form__avatar-dropzone-icon" />
                  <span className="horse-form__avatar-dropzone-title">
                    <Upload size={16} />
                    Click to upload an image
                  </span>
                  <span className="horse-form__avatar-dropzone-hint">PNG, JPG, WEBP — up to 2MB</span>
                </button>
              )}
            </>
          ) : (
            <input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              className={`horse-form__input${errors[field.name] ? ' horse-form__input--error' : ''}`}
              disabled={loading}
              {...register(field.name, validationRules[field.name])}
            />
          )}

          {errors[field.name] && (
            <span className="horse-form__error">{errors[field.name].message}</span>
          )}
        </div>
      ))}
    </div>
  );
}
