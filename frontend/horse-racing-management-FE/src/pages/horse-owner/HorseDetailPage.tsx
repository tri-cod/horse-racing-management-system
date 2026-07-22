import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Dna, Cake, VenetianMask, Scale, Zap, Trophy, UserCog, Pencil, Trash2, Dumbbell } from 'lucide-react';
import { useHorseDetail } from '@/hooks/useHorseDetail';
import { deleteHorse } from '@/api/horseOwnerApi';
import { useToast } from '@/components/ui/ToastProvider';
import HorseStatusBadge from '@/components/features/horse-owner/HorseStatusBadge';
import Button from '@/components/ui/Button';
import Seo from '@/components/seo/Seo';
import { getErrorMessage } from '@/utils/errors';
import type { Horse } from '@/types';

type FullHorse = Horse & { history_rank?: string };

function PageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_272px]">
      <div className="space-y-5">
        <div className="h-56 animate-pulse border border-rim bg-surface-overlay" />
        <div className="overflow-hidden border border-rim bg-surface-raised">
          <div className="h-[60px] animate-pulse border-b border-rim bg-surface-overlay" />
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2 px-5 py-4">
                <div className="h-2.5 w-14 animate-pulse rounded-full bg-surface-overlay" />
                <div className="h-4 w-20 animate-pulse rounded-full bg-surface-overlay" />
              </div>
            ))}
          </div>
        </div>
        <div className="h-32 animate-pulse border border-rim bg-surface-overlay" />
      </div>
      <div className="h-48 animate-pulse border border-rim bg-surface-overlay" />
    </div>
  );
}

export default function HorseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useToast();
  const { horse, loading, error, refetch } = useHorseDetail(id ? Number(id) : undefined);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!horse) return;
    if (!window.confirm(`Delete "${horse.horseName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteHorse(horse.id);
      addToast(`"${horse.horseName}" deleted.`, 'success');
      navigate('/horse-owner/horses');
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Failed to delete horse.'), 'error');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-8 py-6">
        <div className="mb-6 h-5 w-32 animate-pulse rounded-full bg-surface-overlay" />
        <PageSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <p className="text-sm text-fail">{error}</p>
        <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (!horse) return null;

  const h = horse as FullHorse;
  const achievements = h.historyRank ?? h.history_rank;

  const physicalFields = [
    { icon: Dna,          label: 'Breed',  value: h.breed ?? '—',                                    mono: false },
    { icon: Cake,         label: 'Age',    value: h.age    != null ? `${h.age} yrs`  : '—',          mono: true  },
    { icon: VenetianMask, label: 'Gender', value: h.gender ?? '—',                                   mono: false },
    { icon: Scale,        label: 'Weight', value: h.weight != null ? `${h.weight} kg` : '—',         mono: true  },
  ];

  return (
    <div className="px-8 py-6">
      <Seo title={h.horseName} description={`Horse detail — ${h.horseName}`} />

      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} /> Back to My Horses
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost" size="sm"
            onClick={() => navigate(`/horse-owner/horses/${h.id}/edit`)}
          >
            <Pencil size={13} /> Edit
          </Button>
          <Button
            variant="ghost" size="sm" disabled={deleting}
            onClick={handleDelete}
            className="!border-fail/40 !text-fail hover:!bg-fail-subtle"
          >
            <Trash2 size={13} /> {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_272px]">

        {/* ── Main column ──────────────────────────────── */}
        <div className="space-y-5">

          {/* Hero identity */}
          <div className="relative overflow-hidden border border-rim">
            <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-gold" />

            <div className="relative h-56 bg-navy">
              {h.avatarUrl && (
                <img
                  src={h.avatarUrl}
                  alt={h.horseName}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {!h.avatarUrl && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_60%,rgba(168,132,59,0.18),transparent_55%)]" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-navy to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 px-6 pb-6">
                {h.avatarUrl ? (
                  <img
                    src={h.avatarUrl}
                    alt={h.horseName}
                    className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-gold/40"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold/15 ring-2 ring-gold/30">
                    <span className="font-serif text-2xl font-bold text-gold">
                      {h.horseName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="font-serif text-2xl font-bold uppercase tracking-wide text-on-blue">
                    {h.horseName}
                  </h1>
                  {h.breed && (
                    <p className="mt-0.5 text-sm text-on-blue/55">{h.breed}</p>
                  )}
                  <div className="mt-2">
                    <HorseStatusBadge status={h.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Physical profile */}
          <div className="overflow-hidden border border-rim bg-surface-raised">
            <div className="border-b border-rim px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Physical</p>
              <h2 className="mt-0.5 font-serif text-base font-bold text-ink">Profile</h2>
            </div>
            <div className="grid grid-cols-2 divide-y divide-rim sm:grid-cols-4 sm:divide-x sm:divide-y-0">
              {physicalFields.map(({ icon: Icon, label, value, mono }) => (
                <div key={label} className="flex flex-col gap-1.5 px-5 py-4">
                  <div className="flex items-center gap-1.5 text-ink-4">
                    <Icon size={13} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
                  </div>
                  <p className={`text-base font-semibold text-ink ${mono ? 'tnum' : ''}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance */}
          {(h.speedRating != null || achievements) && (
            <div className="overflow-hidden border border-rim bg-surface-raised">
              <div className="border-b border-rim px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Performance</p>
                <h2 className="mt-0.5 font-serif text-base font-bold text-ink">Race Record</h2>
              </div>
              <div className="flex divide-x divide-rim">
                {h.speedRating != null && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-6 py-6">
                    <div className="flex items-center gap-1.5 text-ink-4">
                      <Zap size={13} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Speed Rating</span>
                    </div>
                    <p className="tnum text-4xl font-bold text-ink">{h.speedRating}</p>
                    <div className="mt-0.5 h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-surface-overlay">
                      <div
                        className="h-full rounded-full bg-gold transition-all duration-500"
                        style={{ width: `${Math.min(h.speedRating, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {achievements && (
                  <div className="flex flex-1 flex-col justify-center gap-1.5 px-6 py-6">
                    <div className="flex items-center gap-1.5 text-ink-4">
                      <Trophy size={13} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Achievements</span>
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-ink">{achievements}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ──────────────────────────────────── */}
        <div>
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="overflow-hidden border border-rim bg-surface-raised">
              <div className="border-b border-rim px-5 py-4">
                <div className="flex items-center gap-2">
                  <UserCog size={14} className="text-gold" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Connections</p>
                </div>
                <h2 className="mt-0.5 font-serif text-base font-bold text-ink">Trainer</h2>
              </div>
              <div className="px-5 py-5">
                {h.trainerName ? (
                  <div className="flex items-center gap-3 rounded border border-rim bg-surface px-3 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-sm font-bold text-navy">
                      {h.trainerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{h.trainerName}</p>
                      <p className="text-xs text-ink-4">Assigned Trainer</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mb-3 text-sm text-ink-3">No trainer assigned yet.</p>
                    {/* Trainer assignment goes through the training-contract flow now. */}
                    <Link
                      to="/horse-owner/training-contracts"
                      className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:border-gold/40 hover:bg-surface-overlay hover:text-gold-hi"
                    >
                      <Dumbbell size={13} /> Hire via Training Contracts
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
