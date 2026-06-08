import { useState, useEffect } from 'react';
import { getTrainerProfile, completeTrainerProfile } from '../api/trainerApi';

export const FIELDS = [
  { name: 'age',             label: 'Age',                 type: 'number',   placeholder: '30' },
  { name: 'experienceYears', label: 'Years of Experience', type: 'number',   placeholder: '5' },
  { name: 'description',     label: 'About You',           type: 'textarea', placeholder: 'Tell us about your training philosophy, achievements and specialties…', full: true },
];

const validate = (name, value, form) => {
  if (name === 'age') {
    if (value === '' || value === null || value === undefined)
      return 'Age is required';
    const n = Number(value);
    if (!Number.isInteger(n)) return 'Age must be a whole number';
    if (n < 18 || n > 100) return 'Age must be between 18 and 100';
  }
  if (name === 'experienceYears') {
    if (value === '' || value === null || value === undefined)
      return 'Years of experience is required';
    const n = Number(value);
    if (!Number.isInteger(n)) return 'Experience must be a whole number';
    if (n < 0 || n > 80) return 'Experience must be between 0 and 80';
    if (form.age && n > Number(form.age))
      return 'Experience cannot exceed age';
  }
  if (name === 'description' && value && value.length > 1000)
    return 'Description must not exceed 1000 characters';
  return '';
};

export function useTrainerProfile() {
  const [form, setForm] = useState({
    age: '',
    experienceYears: '',
    description: '',
    avatarUrl: '',
  });
  const [profile, setProfile]   = useState(null);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getTrainerProfile();
        if (!mounted) return;
        setProfile(data);
        setForm({
          age:             data.age ?? '',
          experienceYears: data.experienceYears ?? '',
          description:     data.description ?? '',
          avatarUrl:       data.avatarUrl ?? '',
        });
      } catch (err) {
        if (!mounted) return;
        setApiError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        if (mounted) setFetching(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    setApiError('');
    setSuccess('');
    setErrors((prev) => ({ ...prev, [name]: validate(name, value, updated) }));
    if (name === 'age' && updated.experienceYears !== '') {
      setErrors((prev) => ({
        ...prev,
        experienceYears: validate('experienceYears', updated.experienceYears, updated),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validate(name, value, form) }));
  };

  const handleAvatarChange = (dataUrl) => {
    setForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
    setApiError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    FIELDS.forEach((f) => {
      const err = validate(f.name, form[f.name], form);
      if (err) newErrors[f.name] = err;
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    setApiError('');
    setSuccess('');
    try {
      const payload = {
        age:             Number(form.age),
        experienceYears: Number(form.experienceYears),
        description:     form.description?.trim() || null,
        avatarUrl:       form.avatarUrl || null,
      };
      const data = await completeTrainerProfile(payload);
      setProfile(data);
      setSuccess('Profile saved successfully!');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    form, errors, loading, fetching, apiError, success, profile,
    handleChange, handleBlur, handleAvatarChange, handleSubmit,
  };
}