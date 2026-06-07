import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signHorse } from '../api/horseOwnerApi';

export const FIELDS = [
  { name: 'horseName',    label: 'Horse Name',      type: 'text',   placeholder: 'Thunder' },
  { name: 'breed',        label: 'Breed',           type: 'text',   placeholder: 'Thoroughbred' },
  { name: 'age',          label: 'Age',             type: 'number', placeholder: '4' },
  { name: 'gender',       label: 'Gender',          type: 'select', options: ['Male', 'Female'] },
  { name: 'speedRating',  label: 'Speed Rating',    type: 'number', placeholder: '85' },
  { name: 'history_rank', label: 'Achievements',    type: 'text',   placeholder: 'Champion 2024' },
  { name: 'avatar_url',   label: 'Avatar URL',      type: 'text',   placeholder: 'https://...' },
  { name: 'weight',       label: 'Weight (kg)',     type: 'number', placeholder: '480' },
  { name: 'status',       label: 'Status',          type: 'select', options: ['ACTIVE', 'INACTIVE', 'RETIRE'] },
];

const REQUIRED_LABELS = {
  horseName: 'Horse Name',
  breed: 'Breed',
  gender: 'Gender',
  status: 'Status',
};

const URL_REGEX = /^https?:\/\/[^\s]+$/;

const validate = (name, value) => {
  switch (name) {
    case 'horseName':
    case 'breed':
    case 'gender':
    case 'status':
      if (!value || !String(value).trim()) return `${REQUIRED_LABELS[name]} is required`;
      return '';
    case 'age': {
      if (value === '' || value === null || value === undefined) return 'Age is required';
      const num = Number(value);
      if (!Number.isInteger(num) || num < 1 || num > 40) return 'Age must be a whole number from 1 to 40';
      return '';
    }
    case 'speedRating': {
      if (value === '' || value === null || value === undefined) return 'Speed Rating is required';
      const num = Number(value);
      if (Number.isNaN(num) || num < 0 || num > 100) return 'Speed Rating must be between 0 and 100';
      return '';
    }
    case 'weight': {
      if (value === '' || value === null || value === undefined) return 'Weight is required';
      const num = Number(value);
      if (Number.isNaN(num) || num <= 0) return 'Weight must be greater than 0';
      return '';
    }
    case 'avatar_url':
      if (value && !URL_REGEX.test(value)) return 'Avatar URL is invalid';
      return '';
    default:
      return '';
  }
};

const initialForm = {
  horseName: '',
  breed: '',
  age: '',
  gender: 'Male',
  speedRating: '',
  history_rank: '',
  avatar_url: '',
  weight: '',
  status: 'ACTIVE',
};

export function useHorseForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setApiError('');
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    FIELDS.forEach((f) => {
      const err = validate(f.name, form[f.name]);
      if (err) newErrors[f.name] = err;
    });
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        horseName: form.horseName.trim(),
        breed: form.breed.trim(),
        age: Number(form.age),
        gender: form.gender,
        speedRating: Number(form.speedRating),
        history_rank: form.history_rank.trim(),
        avatar_url: form.avatar_url.trim(),
        weight: Number(form.weight),
        status: form.status,
      };
      const newHorse = await signHorse(payload);
      navigate(`/horse-owner/horses/${newHorse.id}`);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Horse registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { form, errors, loading, apiError, handleChange, handleBlur, handleSubmit };
}
