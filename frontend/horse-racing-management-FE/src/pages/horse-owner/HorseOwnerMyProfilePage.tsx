import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil, X, Check, Camera, Loader2, AlertCircle,
  IdCard, MapPin, CheckCircle, FileText, Shield, LogOut, Image as ImageIcon,
} from 'lucide-react';
import { useMyHorseOwnerProfile } from '@/hooks/useMyHorseOwnerProfile';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/utils/errors';
import { uploadAvatar } from '@/api/authApi';
import UserAvatar from '@/components/features/admin/UserAvatar';
import ImageCropModal from '@/components/ui/ImageCropModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Seo from '@/components/seo/Seo';

const val = (v?: string | number | null) =>
  v === null || v === undefined || v === '' ? '—' : v;

const inputCls =
  'w-full border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none ' +
  'placeholder:text-ink-4 focus:border-gold focus:ring-1 focus:ring-gold/20 transition-colors';

interface FieldErrors {
  name?: string;
}

export default function HorseOwnerMyProfilePage() {
  const { profile, loading, error, refetch, save } = useMyHorseOwnerProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const addToast = useToast();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  // Avatar upload (crop-on-upload, same flow as Jockey/Referee profile)
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // Cover upload (direct upload, no crop — it's a wide banner)
  const [coverUploading, setCoverUploading] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile?.name ?? '');
    setDescription(profile?.description ?? '');
    setAddress(profile?.address ?? '');
    setAvatarUrl(profile?.avatarUrl ?? '');
    setCoverImageUrl(profile?.coverImageUrl ?? '');
  }, [profile]);

  // The backend seeds `name` from the registration full name, so its presence alone
  // can't signal an incomplete profile — use description/address instead.
  const isNew = !profile || (profile.description == null && profile.address == null);
  const isEditing = editing || isNew;

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (avatarFileRef.current) avatarFileRef.current.value = '';
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    setUploading(true);
    setUploadError('');
    try {
      const croppedFile = new File([blob], 'avatar.png', { type: 'image/png' });
      const url = await uploadAvatar(croppedFile);
      setAvatarUrl(url);
    } catch (err: unknown) {
      setUploadError(getErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    setUploadError('');
    try {
      const url = await uploadAvatar(file);
      setCoverImageUrl(url);
    } catch (err: unknown) {
      setUploadError(getErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setCoverUploading(false);
      if (coverFileRef.current) coverFileRef.current.value = '';
    }
  };

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = 'Name is required.';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await save({
        name: name.trim(),
        description: description.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        coverImageUrl: coverImageUrl.trim() || null,
        address: address.trim() || null,
      });
      addToast('Profile saved.', 'success');
      setEditing(false);
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Failed to save profile.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setName(profile?.name ?? '');
    setDescription(profile?.description ?? '');
    setAddress(profile?.address ?? '');
    setAvatarUrl(profile?.avatarUrl ?? '');
    setCoverImageUrl(profile?.coverImageUrl ?? '');
    setErrors({});
    setUploadError('');
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="px-8 py-10 text-center">
        <p className="mb-4 text-sm text-fail">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="border border-rim px-4 py-2 text-xs font-bold uppercase tracking-widest text-ink-2 transition-colors hover:bg-surface-overlay"
        >
          Try Again
        </button>
      </div>
    );
  }

  const status = profile?.status;
  const statusOk = status === 'ACTIVE' || status === 'APPROVED' || status === 'Active';

  return (
    <div className="px-8 py-6">
      <Seo title="Horse Owner Profile" description="Manage your Royal Derby horse owner profile." />

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onCancel={() => setCropSrc(null)}
          onConfirm={handleCropConfirm}
        />
      )}

      <div className="mx-auto max-w-2xl space-y-3">
        {/* Main card */}
        <div className="overflow-hidden border border-rim bg-surface-raised">

          {/* Header */}
          <div className="relative bg-navy px-6 py-6">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gold" />
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <UserAvatar name={profile?.name ?? 'Horse Owner'} avatarUrl={avatarUrl} size={64} />
                {isEditing && (
                  <>
                    <input
                      ref={avatarFileRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarSelect}
                      id="horse-owner-avatar-file"
                    />
                    <label
                      htmlFor="horse-owner-avatar-file"
                      className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-navy bg-gold text-navy transition-colors hover:bg-gold-hi"
                    >
                      {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                    </label>
                  </>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-blue/60">
                  Royal Derby Horse Owner
                </p>
                <h2 className="font-serif text-xl font-bold text-on-blue">
                  {profile?.name ?? 'My Profile'}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="border border-on-blue/20 bg-on-blue/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-blue/70">
                    Horse Owner
                  </span>
                  {status && (
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      statusOk
                        ? 'border-ok/30 bg-ok/15 text-ok'
                        : 'border-on-blue/20 bg-on-blue/10 text-on-blue/60'
                    }`}>
                      {status}
                    </span>
                  )}
                </div>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="shrink-0 inline-flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-gold transition-colors hover:bg-gold/20"
                >
                  <Pencil size={12} /> Edit
                </button>
              )}
            </div>

            {isEditing && uploadError && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-fail">
                <AlertCircle size={12} className="shrink-0" /> {uploadError}
              </p>
            )}
          </div>

          {/* Stat */}
          <div className="border-b border-rim">
            <div className="flex items-center gap-3 px-6 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-4">
                <Shield size={16} />
              </div>
              <div>
                <p className="tnum text-xl font-bold text-ink">{profile?.totalHorses ?? 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Horses Owned</p>
              </div>
            </div>
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="border-t border-rim">
              <div className="border-b border-rim bg-surface-overlay/50 px-6 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                  {isNew ? 'Complete Your Profile' : 'Edit Profile'}
                </p>
                <p className="mt-0.5 text-xs text-ink-3">Changes apply immediately after saving.</p>
              </div>

              <div className="divide-y divide-rim">
                {/* Name */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center text-gold">
                    <IdCard size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                      Display Name <span className="text-fail">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Golden Stables"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputCls}
                      autoFocus
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-fail">{errors.name}</p>}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center text-gold">
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                      Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Stable address…"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center text-gold">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tell others about your stable…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                </div>

                {/* Cover image — file upload, not a URL field */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center text-gold">
                    <ImageIcon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                      Cover Image
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-20 shrink-0 overflow-hidden border border-rim bg-surface-overlay">
                        {coverImageUrl ? (
                          <img src={coverImageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-ink-4">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </div>
                      <input
                        ref={coverFileRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleCoverSelect}
                        id="horse-owner-cover-file"
                      />
                      <label
                        htmlFor="horse-owner-cover-file"
                        className="inline-flex cursor-pointer items-center gap-1.5 border border-rim px-3 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface-overlay"
                      >
                        {coverUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                        {coverImageUrl ? 'Change' : 'Upload'}
                      </label>
                      {coverImageUrl && (
                        <button
                          type="button"
                          onClick={() => setCoverImageUrl('')}
                          className="text-xs font-medium text-ink-3 transition-colors hover:text-fail"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-rim px-6 py-4">
                {!isNew && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 border border-rim py-2.5 text-xs font-bold uppercase tracking-widest text-ink-2 transition-colors hover:bg-surface-overlay disabled:opacity-50"
                  >
                    <X size={13} /> Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || uploading || coverUploading}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 bg-gold py-2.5 text-xs font-bold uppercase tracking-widest text-navy transition-colors hover:bg-gold/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={13} /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-rim border-t border-rim">
              {/* Address */}
              <div className="flex items-center gap-4 px-6 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-4">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Address</p>
                  <p className="mt-0.5 whitespace-pre-line text-sm font-medium text-ink">{val(profile?.address)}</p>
                </div>
              </div>
              {/* Status */}
              <div className="flex items-center gap-4 px-6 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-4">
                  <CheckCircle size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Status</p>
                  <p className="mt-0.5 text-sm font-medium text-ink">{val(status)}</p>
                </div>
              </div>
              {/* Description */}
              <div className="flex items-start gap-4 px-6 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-4">
                  <FileText size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Description</p>
                  <p className="mt-0.5 whitespace-pre-line text-sm font-medium text-ink">
                    {val(profile?.description)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="border-t border-rim px-6 py-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 border border-fail/30 bg-fail-subtle px-4 py-2.5 text-sm font-semibold text-fail transition-colors hover:bg-fail/10"
            >
              <LogOut size={15} /> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
