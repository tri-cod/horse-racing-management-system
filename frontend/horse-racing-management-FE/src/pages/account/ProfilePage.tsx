import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, IdCard, Shield, CheckCircle,
  LogOut, Pencil, X, Check, AlertCircle, Camera, Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateInfo, uploadAvatar } from '@/api/authApi';
import { getErrorMessage } from '@/utils/errors';
import UserAvatar from '@/components/features/admin/UserAvatar';
import ImageCropModal from '@/components/ui/ImageCropModal';
import Seo from '@/components/seo/Seo';

const val = (v?: string | null) => v || '—';

const inputCls =
  'w-full border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none ' +
  'placeholder:text-ink-4 focus:border-gold focus:ring-1 focus:ring-gold/20 transition-colors';

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden border border-rim bg-surface-raised">
        <div className="h-28 animate-pulse bg-navy/60" />
        <div className="space-y-4 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-8 w-8 animate-pulse bg-surface-overlay" />
              <div className="space-y-1.5">
                <div className="h-2.5 w-20 animate-pulse bg-surface-overlay" />
                <div className="h-3.5 w-40 animate-pulse bg-surface-overlay" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    // if (!window.confirm('Are you sure you want to log out?')) return;
    logout();
    navigate('/');
  };

  const openEdit = () => {
    setForm({ fullName: user?.fullName ?? '', phoneNumber: user?.phoneNumber ?? '', avatarUrl: user?.avatarUrl ?? '' });
    setSaveError('');
    setSaveSuccess(false);
    setUploadError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaveError('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    setUploading(true);
    setUploadError('');
    try {
      const croppedFile = new File([blob], 'avatar.png', { type: 'image/png' });
      const url = await uploadAvatar(croppedFile);
      setForm((p) => ({ ...p, avatarUrl: url }));
    } catch (err: unknown) {
      setUploadError(getErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await updateInfo({
        fullName: form.fullName || undefined,
        phoneNumber: form.phoneNumber || undefined,
        avatarUrl: form.avatarUrl || undefined,
      });
      await refreshUser();
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(getErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="px-8 py-6">
        <Seo title="My Profile" />
        <ProfileSkeleton />
      </div>
    );
  }

  const readonlyFields = [
    { icon: User,   label: 'Username', value: user.username },
    { icon: Mail,   label: 'Email',    value: user.email },
    { icon: Shield, label: 'Role',     value: user.role?.replace(/_/g, ' ') },
    { icon: CheckCircle, label: 'Status', value: user.status },
  ];

  return (
    <div className="px-8 py-6">
      <Seo title="My Profile" description="Manage your Royal Derby account." />

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
                <UserAvatar name={user.fullName || user.username} avatarUrl={editing ? form.avatarUrl : user.avatarUrl} size={64} />
                {editing && (
                  <>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarChange}
                      id="profile-avatar-file"
                    />
                    <label
                      htmlFor="profile-avatar-file"
                      className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-navy bg-gold text-navy transition-colors hover:bg-gold-hi"
                    >
                      {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                    </label>
                  </>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-xl font-bold text-on-blue">
                  {val(user.fullName ?? user.username)}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="border border-on-blue/20 bg-on-blue/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-blue/70">
                    {user.role?.toLowerCase().replace(/_/g, ' ')}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    user.status === 'ACTIVE'
                      ? 'border-ok/30 bg-ok/15 text-ok'
                      : 'border-on-blue/20 bg-on-blue/10 text-on-blue/60'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
              {!editing && (
                <button
                  type="button"
                  onClick={openEdit}
                  className="shrink-0 inline-flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-gold transition-colors hover:bg-gold/20"
                >
                  <Pencil size={12} /> Edit
                </button>
              )}
            </div>
            {editing && uploadError && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-fail">
                <AlertCircle size={12} className="shrink-0" /> {uploadError}
              </p>
            )}
          </div>

          {/* Read-only fields */}
          <div className="divide-y divide-rim">
            {readonlyFields.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-4">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">{label}</p>
                  <p className="mt-0.5 text-sm font-medium capitalize text-ink">{val(value)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Editable section */}
          {editing ? (
            <form onSubmit={handleSave} className="border-t border-rim">
              <div className="border-b border-rim bg-surface-overlay/50 px-6 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Edit Profile</p>
                <p className="mt-0.5 text-xs text-ink-3">Changes apply immediately after saving.</p>
              </div>

              <div className="divide-y divide-rim">
                {/* Full name */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center text-gold">
                    <IdCard size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={form.fullName}
                      onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                      className={inputCls}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center text-gold">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +84 90 123 4567"
                      value={form.phoneNumber}
                      onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {saveError && (
                <div className="mx-6 mb-1 mt-3 flex items-center gap-2 border border-fail/20 bg-fail-subtle px-3 py-2.5 text-xs text-fail">
                  <AlertCircle size={13} className="shrink-0" /> {saveError}
                </div>
              )}

              <div className="flex gap-3 border-t border-rim px-6 py-4">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 border border-rim py-2.5 text-xs font-bold uppercase tracking-widest text-ink-2 transition-colors hover:bg-surface-overlay disabled:opacity-50"
                >
                  <X size={13} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 bg-gold py-2.5 text-xs font-bold uppercase tracking-widest text-navy transition-colors hover:bg-gold/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={13} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-rim border-t border-rim">
              {/* Full name (read mode) */}
              <div className="flex items-center gap-4 px-6 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-4">
                  <IdCard size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Full Name</p>
                  <p className="mt-0.5 text-sm font-medium text-ink">{val(user.fullName)}</p>
                </div>
              </div>
              {/* Phone (read mode) */}
              <div className="flex items-center gap-4 px-6 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-4">
                  <Phone size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Phone Number</p>
                  <p className="mt-0.5 text-sm font-medium text-ink">{val(user.phoneNumber)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="border-t border-rim px-6 py-4">
            {saveSuccess && (
              <div className="mb-3 flex items-center gap-2 border border-ok/20 bg-ok-subtle px-3 py-2.5 text-xs font-semibold text-ok">
                <CheckCircle size={13} className="shrink-0" /> Profile updated successfully.
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 border border-fail/30 bg-fail-subtle px-4 py-2.5 text-sm font-semibold text-fail transition-colors hover:bg-fail/10"
            >
              <LogOut size={15} /> Log Out
            </button>
          </div>
        </div>

        {/* Account info card */}
        {user.createdAt && (
          <div className="border border-rim bg-surface-raised px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Member since</p>
            <p className="mt-0.5 text-sm font-medium text-ink-2">
              {new Date(user.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
