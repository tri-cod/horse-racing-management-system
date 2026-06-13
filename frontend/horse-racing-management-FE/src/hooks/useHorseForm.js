import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signHorse, uploadAvatar } from '../api/horseOwnerApi';

export const FIELDS = [
  { name: 'horseName',    label: 'Horse Name',      type: 'text',   placeholder: 'Thunder' },
  { name: 'breed',        label: 'Breed',           type: 'text',   placeholder: 'Thoroughbred' },
  { name: 'age',          label: 'Age',             type: 'number', placeholder: '4' },
  { name: 'gender',       label: 'Gender',          type: 'select', options: ['Male', 'Female'] },
  { name: 'speedRating',  label: 'Speed Rating',    type: 'number', placeholder: '85' },
  { name: 'history_rank', label: 'Achievements',    type: 'text',   placeholder: 'Champion 2024' },
  { name: 'avatar_url',   label: 'Avatar',           type: 'file',   placeholder: '' },
  { name: 'weight',       label: 'Weight (kg)',     type: 'number', placeholder: '480' },
  { name: 'status',       label: 'Status',          type: 'select', options: ['ACTIVE', 'INACTIVE', 'RETIRE'] },
];

const REQUIRED_LABELS = {
  horseName: 'Horse Name',
  breed: 'Breed',
  gender: 'Gender',
  status: 'Status',
};

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

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
    case 'avatar_url': {
      if (!value) return '';
      if (typeof value === 'string') {
        const url = value.trim();
        if (url.length > 255) return 'Avatar URL must be shorter than 255 characters';
        if (!/^https?:\/\//i.test(url)) return 'Avatar URL must start with http:// or https://';
      }
      return '';
    }
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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFileName, setAvatarFileName] = useState('');

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

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, avatar_url: 'Avatar must be an image file (PNG, JPG, WEBP)' }));
      e.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setErrors((prev) => ({ ...prev, avatar_url: 'Avatar image must be smaller than 2MB' }));
      e.target.value = '';
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFileName(file.name);
    setErrors((prev) => ({ ...prev, avatar_url: '' }));
    setApiError('');
  };

  const handleAvatarRemove = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview('');
    setAvatarFileName('');
    setForm((prev) => ({ ...prev, avatar_url: '' }));
    setErrors((prev) => ({ ...prev, avatar_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    FIELDS.forEach((f) => {
      const value = f.name === 'avatar_url' ? avatarFile || form.avatar_url : form[f.name];
      const err = validate(f.name, value);
      if (err) newErrors[f.name] = err;
    });
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = form.avatar_url;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      const payload = {
        horseName: form.horseName.trim(),
        breed: form.breed.trim(),
        age: Number(form.age),
        gender: form.gender,
        speedRating: Number(form.speedRating),
        history_rank: form.history_rank.trim(),
        avatar_url: avatarUrl,
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

  return {
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
  };
}
