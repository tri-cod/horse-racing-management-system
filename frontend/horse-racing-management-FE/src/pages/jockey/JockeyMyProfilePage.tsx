import { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useMyJockeyProfile } from '@/hooks/useMyJockeyProfile';
import { useToast } from '@/components/ui/ToastProvider';
import { getErrorMessage } from '@/utils/errors';
import JockeyProfileForm from '@/components/features/jockey/JockeyProfileForm';
import JockeyProfileView from '@/components/features/jockey/JockeyProfileView';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Seo from '@/components/seo/Seo';

/* Inline avatar — larger size than the badge shown elsewhere */
function HeaderAvatar({ url, name }: { url?: string; name?: string }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'J';
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-gold/30">
      {url ? (
        <img src={url} alt={name ?? 'Jockey'} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gold text-2xl font-bold text-on-gold">
          {initials}
        </div>
      )}
    </div>
  );
}

export default function JockeyMyProfilePage() {
  const { profile, loading, error, refetch, save } = useMyJockeyProfile();
  const addToast = useToast();
  const reduce = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isNew = !profile || (profile.age == null && profile.experienceYear == null);
  const isEditing = editing || isNew;

  const handleSave = async (payload: Parameters<typeof save>[0]) => {
    setSaving(true);
    try {
      await save(payload);
      addToast('Profile saved.', 'success');
      setEditing(false);
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Failed to save profile.'), 'error');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="px-8 py-10 text-center">
      <p className="mb-4 text-sm text-fail">{error}</p>
      <Button variant="outline" onClick={refetch}>Try Again</Button>
    </div>
  );

  const hasStats = !isNew && (profile?.age != null || profile?.experienceYear != null);

  return (
    <div>
      <Seo title="Jockey Profile" description="Manage your Royal Derby jockey profile." />

      {/* ── Identity header band ──────────────────────────────────── */}
      <div className="border-b border-on-blue/10 bg-navy">
        <div className="mx-auto max-w-4xl px-8 py-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Left: avatar + name + status */}
            <div className="flex items-center gap-5">
              <HeaderAvatar url={profile?.avatarUrl} name={profile?.name} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold/55">
                  Royal Derby · Jockey
                </p>
                <h1 className="mt-0.5 font-serif text-2xl font-bold text-on-blue sm:text-3xl">
                  {profile?.name ?? 'My Profile'}
                </h1>
                {profile?.status && (
                  <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    profile.status === 'APPROVED' || profile.status === 'Active'
                      ? 'bg-ok/15 text-ok'
                      : profile.status === 'REJECTED'
                      ? 'bg-fail/15 text-fail'
                      : 'bg-on-blue/10 text-on-blue/50'
                  }`}>
                    {profile.status}
                  </span>
                )}
              </div>
            </div>

            {/* Right: display stats */}
            {hasStats && (
              <motion.div
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-8 sm:border-l sm:border-on-blue/15 sm:pl-8"
              >
                {profile?.experienceYear != null && (
                  <div>
                    <p className="tnum text-4xl font-bold leading-none text-gold">
                      {profile.experienceYear}
                    </p>
                    <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-on-blue/35">
                      Yrs Exp.
                    </p>
                  </div>
                )}
                {profile?.experienceYear != null && profile?.age != null && (
                  <div className="h-10 w-px self-center bg-on-blue/12" />
                )}
                {profile?.age != null && (
                  <div>
                    <p className="tnum text-4xl font-bold leading-none text-on-blue">
                      {profile.age}
                    </p>
                    <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-on-blue/35">
                      Age
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-md border border-rim bg-surface-raised"
          >
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-rim px-6 py-4">
              <h2 className="font-serif text-lg font-bold text-ink">
                {isEditing ? (isNew ? 'Complete Your Profile' : 'Edit Profile') : 'Profile'}
              </h2>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 rounded border border-rim px-3 py-1.5 text-xs font-semibold text-ink-3 transition-colors hover:border-navy/30 hover:text-navy">
                  <Pencil size={12} /> Edit
                </button>
              ) : !isNew ? (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 text-xs font-medium text-ink-3 transition-colors hover:text-ink">
                  <X size={13} /> Cancel
                </button>
              ) : null}
            </div>

            {isEditing
              ? <JockeyProfileForm initialValues={profile ?? {}} onSubmit={handleSave} loading={saving} />
              : profile
                ? <JockeyProfileView profile={profile} />
                : (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm text-ink-3">No profile data available.</p>
                  </div>
                )
            }
          </motion.div>
        </div>
      </div>
    </div>
  );
}
