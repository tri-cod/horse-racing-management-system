import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { signHorse, updateHorse, uploadAvatar } from '@/api/horseOwnerApi';
import { getErrorMessage } from '@/utils/errors';
import type { Horse } from '@/types';

// ─── Field definitions (exported so the form component can render them) ───────

export interface FieldDef {
 name: string;
 label: string;
 type: 'text' | 'number' | 'select' | 'file';
 placeholder?: string;
 options?: string[];
}

export const FIELDS: FieldDef[] = [
 { name: 'horseName', label: 'Horse Name', type: 'text', placeholder: 'Thunder' },
 { name: 'breed', label: 'Breed', type: 'text', placeholder: 'Thoroughbred' },
 { name: 'age', label: 'Age', type: 'number', placeholder: '4' },
 { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
 { name: 'speedRating', label: 'Speed Rating', type: 'number', placeholder: '85' },
 { name: 'history_rank', label: 'Achievements', type: 'text', placeholder: 'Champion 2024' },
 { name: 'avatar_url', label: 'Avatar', type: 'file', placeholder: '' },
 { name: 'weight', label: 'Weight (kg)', type: 'number', placeholder: '480' },
 { name: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE', 'RETIRE'] },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HorseFormData {
 horseName: string;
 breed: string;
 age: string;
 gender: string;
 speedRating: string;
 history_rank: string;
 avatar_url: string;
 weight: string;
 status: string;
 [key: string]: string;
}

type FormErrors = Partial<Record<keyof HorseFormData, string>>;

// ─── Validation ───────────────────────────────────────────────────────────────

const REQUIRED_LABELS: Partial<Record<keyof HorseFormData, string>> = {
 horseName: 'Horse Name',
 breed: 'Breed',
 gender: 'Gender',
 status: 'Status',
};

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

function validate(name: keyof HorseFormData, value: unknown): string {
 switch (name) {
 case 'horseName':
 case 'breed':
 case 'gender':
 case 'status':
 if (!value || !String(value).trim()) return`${REQUIRED_LABELS[name]} is required`;
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
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const initialForm: HorseFormData = {
 horseName: '', breed: '', age: '', gender: 'Male',
 speedRating: '', history_rank: '', avatar_url: '', weight: '', status: 'ACTIVE',
};

function formFromHorse(horse: Horse): HorseFormData {
 return {
 horseName: horse.horseName ?? '',
 breed: horse.breed ?? '',
 age: horse.age != null ? String(horse.age) : '',
 gender: horse.gender ?? 'Male',
 speedRating: horse.speedRating != null ? String(horse.speedRating) : '',
 history_rank: horse.historyRank ?? '',
 avatar_url: horse.avatarUrl ?? '',
 weight: horse.weight != null ? String(horse.weight) : '',
 status: horse.status ?? 'ACTIVE',
 };
}

interface UseHorseFormOptions {
 mode?: 'create' | 'edit';
 horseId?: number;
 initialValues?: Horse;
}

export function useHorseForm({ mode = 'create', horseId, initialValues }: UseHorseFormOptions = {}) {
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [form, setForm] = useState<HorseFormData>(() =>
 mode === 'edit' && initialValues ? formFromHorse(initialValues) : initialForm,
 );
 const [errors, setErrors] = useState<FormErrors>({});
 const [loading, setLoading] = useState(false);
 const [apiError, setApiError] = useState('');
 const [avatarFile, setAvatarFile] = useState<File | null>(null);
 const [avatarPreview, setAvatarPreview] = useState(initialValues?.avatarUrl ?? '');
 const [avatarFileName, setAvatarFileName] = useState('');

 const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 setForm((prev) => ({ ...prev, [name]: value }));
 setApiError('');
 setErrors((prev) => ({ ...prev, [name]: validate(name as keyof HorseFormData, value) }));
 };

 const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 setErrors((prev) => ({ ...prev, [name]: validate(name as keyof HorseFormData, value) }));
 };

 const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
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
 if (avatarPreview) URL.revokeObjectURL(avatarPreview);
 setAvatarFile(null);
 setAvatarPreview('');
 setAvatarFileName('');
 setForm((prev) => ({ ...prev, avatar_url: '' }));
 setErrors((prev) => ({ ...prev, avatar_url: '' }));
 };

 const handleSubmit = async (e: FormEvent) => {
 e.preventDefault();
 const newErrors: FormErrors = {};
 FIELDS.forEach((f) => {
 const value = f.name === 'avatar_url' ? avatarFile ?? form.avatar_url : form[f.name as keyof HorseFormData];
 const err = validate(f.name as keyof HorseFormData, value);
 if (err) newErrors[f.name as keyof HorseFormData] = err;
 });
 if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

 setLoading(true);
 try {
 const avatarUrl = avatarFile ? await uploadAvatar(avatarFile) : form.avatar_url || undefined;

 const payload = {
 horseName: form.horseName.trim(),
 breed: form.breed.trim() || undefined,
 age: form.age ? Number(form.age) : undefined,
 gender: form.gender || undefined,
 speedRating: form.speedRating ? Number(form.speedRating) : undefined,
 history_rank: form.history_rank.trim() || undefined,
 avatar_url: avatarUrl || undefined,
 weight: form.weight ? Number(form.weight) : undefined,
 status: form.status || undefined,
 };

 if (mode === 'edit' && horseId) {
 await updateHorse(horseId, payload);
 // Same staleTime gotcha as race edits — without this the detail/list pages
 // would keep showing the pre-edit values for up to 30s.
 await queryClient.invalidateQueries({ queryKey: ['horse', horseId] });
 await queryClient.invalidateQueries({ queryKey: ['my-horses'] });
 navigate(`/horse-owner/horses/${horseId}`);
 } else {
 const newHorse = await signHorse(payload);
 await queryClient.invalidateQueries({ queryKey: ['my-horses'] });
 navigate(`/horse-owner/horses/${newHorse.id}`);
 }
 } catch (e: unknown) {
 setApiError(getErrorMessage(e, mode === 'edit' ? 'Failed to update horse. Please try again.' : 'Horse registration failed. Please try again.'));
 } finally {
 setLoading(false);
 }
 };

 return {
 form, errors, loading, apiError,
 avatarPreview, avatarFileName,
 handleChange, handleBlur,
 handleAvatarChange, handleAvatarRemove,
 handleSubmit,
 };
}
