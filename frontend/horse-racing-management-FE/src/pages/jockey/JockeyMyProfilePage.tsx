import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil, X, Check, Camera, Loader2, AlertCircle,
  Calendar, Award, CheckCircle, FileText, LogOut,
} from 'lucide-react';
import { useMyJockeyProfile } from '@/hooks/useMyJockeyProfile';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/utils/errors';
import { humanizeStatus } from '@/utils/text';
import { uploadImage } from '@/api/fileApi';
import { isoDateYearsAgo, calculateAge } from '@/utils/age';
import UserAvatar from '@/components/features/admin/UserAvatar';
import ImageCropModal from '@/components/ui/ImageCropModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const MIN_AGE = 14;
const MAX_AGE = 70;
const MIN_DOB = isoDateYearsAgo(MAX_AGE);
const MAX_DOB = isoDateYearsAgo(MIN_AGE);

const val = (v?: string | number | null) =>
  v === null || v === undefined || v === '' ? '—' : v;

const fieldCls = (err?: string) =>
  'w-full border bg-surface-input px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-4 transition-colors ' +
  (err
    ? 'border-fail focus:border-fail focus:ring-1 focus:ring-fail/20'
    : 'border-rim focus:border-gold focus:ring-1 focus:ring-gold/20');

interface FieldErrors {
  dateOfBirth?: string;
  experienceYear?: string;
}

export default function JockeyMyProfilePage() {
  const { profile, loading, error, refetch, save } = useMyJockeyProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const addToast = useToast();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [experienceYear, setExperienceYear] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  // Avatar upload (crop-on-upload, same flow as the Horse Owner account page)
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const avatarFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDateOfBirth(profile?.dateOfBirth ?? '');
    setExperienceYear(profile?.experienceYear != null ? String(profile.experienceYear) : '');
    setDescription(profile?.description ?? '');
    setAvatarUrl(profile?.avatarUrl ?? '');
  }, [profile]);

  const isNew = !profile || (profile.dateOfBirth == null && profile.experienceYear == null);
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
      const url = await uploadImage(croppedFile);
      setAvatarUrl(url);
    } catch (err: unknown) {
      setUploadError(getErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (!dateOfBirth || dateOfBirth < MIN_DOB || dateOfBirth > MAX_DOB) {
      errs.dateOfBirth = `Age must be between ${MIN_AGE} and ${MAX_AGE}.`;
    }
    const exp = Number(experienceYear);
    if (experienceYear === '' || isNaN(exp) || exp < 0 || exp > 50) {
      errs.experienceYear = 'Experience must be between 0 and 50.';
    }
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
        dateOfBirth,
        experienceYear: Number(experienceYear),
        description: description.trim() || undefined,
        avatarUrl: avatarUrl.trim() || null,
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
    setDateOfBirth(profile?.dateOfBirth ?? '');
    setExperienceYear(profile?.experienceYear != null ? String(profile.experienceYear) : '');
    setDescription(profile?.description ?? '');
    setAvatarUrl(profile?.avatarUrl ?? '');
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

  const age = profile?.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;
  const dobDisplay = profile?.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      }) + (age != null ? ` · Age ${age}` : '')
    : '—';

  return (
    <div className="px-8 py-6">

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
                <UserAvatar name={profile?.name ?? 'Jockey'} avatarUrl={avatarUrl} size={64} />
                {isEditing && (
                  <>
                    <input
                      ref={avatarFileRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarSelect}
                      id="jockey-avatar-file"
                    />
                    <label
                      htmlFor="jockey-avatar-file"
                      className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-navy bg-gold text-navy transition-colors hover:bg-gold-hi"
                    >
                      {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                    </label>
                  </>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-blue/60">
                  Royal Derby Jockey
                </p>
                <h2 className="font-serif text-xl font-bold text-on-blue">
                  {profile?.name ?? 'My Profile'}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="border border-on-blue/20 bg-on-blue/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-blue/70">
                    Jockey
                  </span>
                  {status && (
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      statusOk
                        ? 'border-ok/30 bg-ok/15 text-ok'
                        : 'border-on-blue/20 bg-on-blue/10 text-on-blue/60'
                    }`}>
                      {humanizeStatus(status)}
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
                {/* Date of birth */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center text-gold">
                    <Calendar size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                      Date of Birth <span className="text-fail">*</span>
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      min={MIN_DOB}
                      max={MAX_DOB}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className={fieldCls(errors.dateOfBirth)}
                    />
                    {errors.dateOfBirth && <p className="mt-1.5 text-xs text-fail">{errors.dateOfBirth}</p>}
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center text-gold">
                    <Award size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                      Experience Years <span className="text-fail">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      placeholder="e.g. 5"
                      value={experienceYear}
                      onChange={(e) => setExperienceYear(e.target.value)}
                      className={fieldCls(errors.experienceYear)}
                    />
                    {errors.experienceYear && <p className="mt-1.5 text-xs text-fail">{errors.experienceYear}</p>}
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
                      placeholder="Tell horse owners about your riding style and achievements…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`${fieldCls()} resize-none`}
                    />
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
                  disabled={saving || uploading}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 bg-gold py-2.5 text-xs font-bold uppercase tracking-widest text-navy transition-colors hover:bg-gold/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={13} /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-rim border-t border-rim">
              {/* Date of birth */}
              <div className="flex items-center gap-4 px-6 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-4">
                  <Calendar size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Date of Birth</p>
                  <p className="mt-0.5 text-sm font-medium text-ink">{dobDisplay}</p>
                </div>
              </div>
              {/* Experience */}
              <div className="flex items-center gap-4 px-6 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-4">
                  <Award size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Experience</p>
                  <p className="mt-0.5 text-sm font-medium text-ink">
                    {profile?.experienceYear != null ? `${profile.experienceYear} years` : '—'}
                  </p>
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