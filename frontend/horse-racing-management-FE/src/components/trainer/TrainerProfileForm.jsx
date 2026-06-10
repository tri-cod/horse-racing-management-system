import { useState } from 'react';
import Button from '../ui/Button';
import '../../assets/css/trainer/TrainerProfileForm.css';

export default function TrainerProfileForm({ initialValues = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    age: initialValues.age ?? '',
    experienceYears: initialValues.experienceYears ?? '',
    description: initialValues.description ?? '',
    avatarUrl: initialValues.avatarUrl ?? '',
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    const age = Number(form.age);
    if (!form.age || isNaN(age) || age < 18 || age > 99)
      errs.age = 'Age must be between 18 and 99.';
    const exp = Number(form.experienceYears);
    if (form.experienceYears === '' || isNaN(exp) || exp < 0 || exp > 70)
      errs.experienceYears = 'Experience must be between 0 and 70.';
    if (form.description.length > 1000)
      errs.description = 'Maximum 1000 characters.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit({
      age: Number(form.age),
      experienceYears: Number(form.experienceYears),
      description: form.description,
      avatarUrl: form.avatarUrl || null,
    });
  };

  return (
    <form className="trainer-form" onSubmit={handleSubmit} noValidate>
      <div className="trainer-form__field">
        <label className="trainer-form__label" htmlFor="tf-age">
          Age <span className="trainer-form__required">*</span>
        </label>
        <input
          id="tf-age"
          type="number"
          className={`trainer-form__input${errors.age ? ' trainer-form__input--error' : ''}`}
          value={form.age}
          onChange={set('age')}
          min={18}
          max={99}
          placeholder="e.g. 32"
        />
        {errors.age && <span className="trainer-form__error">{errors.age}</span>}
      </div>

      <div className="trainer-form__field">
        <label className="trainer-form__label" htmlFor="tf-exp">
          Experience Years <span className="trainer-form__required">*</span>
        </label>
        <input
          id="tf-exp"
          type="number"
          className={`trainer-form__input${errors.experienceYears ? ' trainer-form__input--error' : ''}`}
          value={form.experienceYears}
          onChange={set('experienceYears')}
          min={0}
          max={70}
          placeholder="e.g. 10"
        />
        {errors.experienceYears && <span className="trainer-form__error">{errors.experienceYears}</span>}
      </div>

      <div className="trainer-form__field">
        <label className="trainer-form__label" htmlFor="tf-desc">Description</label>
        <textarea
          id="tf-desc"
          className={`trainer-form__textarea${errors.description ? ' trainer-form__input--error' : ''}`}
          value={form.description}
          onChange={set('description')}
          rows={5}
          maxLength={1000}
          placeholder="Tell horse owners about your experience, specialties, and training philosophy..."
        />
        <div className="trainer-form__counter">{form.description.length} / 1000</div>
        {errors.description && <span className="trainer-form__error">{errors.description}</span>}
      </div>

      <div className="trainer-form__field">
        <label className="trainer-form__label" htmlFor="tf-avatar">Avatar URL</label>
        <div className="trainer-form__url-row">
          <input
            id="tf-avatar"
            type="url"
            className="trainer-form__input"
            value={form.avatarUrl}
            onChange={set('avatarUrl')}
            placeholder="https://example.com/photo.jpg"
          />
          {form.avatarUrl && (
            <img
              className="trainer-form__avatar-thumb"
              src={form.avatarUrl}
              alt="Avatar preview"
              onError={(e) => { e.target.style.display = 'none'; }}
              onLoad={(e) => { e.target.style.display = 'block'; }}
            />
          )}
        </div>
      </div>

      <div className="trainer-form__footer">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
