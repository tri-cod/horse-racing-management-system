import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { signHorse, uploadAvatar } from '../../api/horseOwnerApi';

export const FIELDS = [
  { name: 'horseName',    label: 'Horse Name',      type: 'text',   placeholder: 'Thunder' },
  { name: 'breed',        label: 'Breed',           type: 'text',   placeholder: 'Thoroughbred' },
  { name: 'age',          label: 'Age',             type: 'number', placeholder: '4' },
  { name: 'gender',       label: 'Gender',          type: 'select', options: ['Male', 'Female'] },
  { name: 'speedRating',  label: 'Speed Rating',    type: 'number', placeholder: '85' },
  { name: 'history_rank', label: 'Achievements',    type: 'text',   placeholder: 'Champion 2024' },
  { name: 'avatar_url',   label: 'Avatar',          type: 'file',   placeholder: '' },
  { name: 'weight',       label: 'Weight (kg)',     type: 'number', placeholder: '480' },
  { name: 'status',       label: 'Status',          type: 'select', options: ['ACTIVE', 'INACTIVE', 'RETIRE'] },
];

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export function useHorseForm() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFileName, setAvatarFileName] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    getValues,
  } = useForm({
    defaultValues: {
      horseName: '',
      breed: '',
      age: '',
      gender: 'Male',
      speedRating: '',
      history_rank: '',
      avatar_url: '',
      weight: '',
      status: 'ACTIVE',
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('avatar_url', { message: 'Avatar must be an image file (PNG, JPG, WEBP)' });
      e.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError('avatar_url', { message: 'Avatar image must be smaller than 2MB' });
      e.target.value = '';
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFileName(file.name);
    clearErrors('avatar_url');
    setApiError('');
  };

  const handleAvatarRemove = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview('');
    setAvatarFileName('');
    clearErrors('avatar_url');
  };

  const onSubmit = async (formData) => {
    setApiError('');
    try {
      let avatarUrl = formData.avatar_url;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      const payload = {
        horseName: formData.horseName.trim(),
        breed: formData.breed.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        speedRating: Number(formData.speedRating),
        history_rank: formData.history_rank.trim(),
        avatar_url: avatarUrl,
        weight: Number(formData.weight),
        status: formData.status,
      };

      const newHorse = await signHorse(payload);
      navigate(`/horse-owner/horses/${newHorse.id}`);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Horse registration failed. Please try again.');
    }
  };

  // RHF validation rules for each field
  const validationRules = {
    horseName: { required: 'Horse Name is required' },
    breed:     { required: 'Breed is required' },
    gender:    { required: 'Gender is required' },
    status:    { required: 'Status is required' },
    age: {
      required: 'Age is required',
      validate: (v) => {
        const n = Number(v);
        if (!Number.isInteger(n) || n < 1 || n > 40) return 'Age must be a whole number from 1 to 40';
      },
    },
    speedRating: {
      required: 'Speed Rating is required',
      validate: (v) => {
        const n = Number(v);
        if (isNaN(n) || n < 0 || n > 100) return 'Speed Rating must be between 0 and 100';
      },
    },
    weight: {
      required: 'Weight is required',
      validate: (v) => {
        const n = Number(v);
        if (isNaN(n) || n <= 0) return 'Weight must be greater than 0';
      },
    },
    avatar_url: {
      validate: (v) => {
        if (!v) return;
        const url = String(v).trim();
        if (url.length > 255) return 'Avatar URL must be shorter than 255 characters';
        if (!/^https?:\/\//i.test(url)) return 'Avatar URL must start with http:// or https://';
      },
    },
  };

  return {
    register,
    errors,
    loading: isSubmitting,
    apiError,
    avatarPreview,
    avatarFileName,
    validationRules,
    handleAvatarChange,
    handleAvatarRemove,
    handleSubmit: handleSubmit(onSubmit),
  };
}
