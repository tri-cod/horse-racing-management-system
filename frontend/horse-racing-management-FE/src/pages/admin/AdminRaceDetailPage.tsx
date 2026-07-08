import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, Pencil, Trash2, Lock, TrendingUp, MapPin, Calendar,
  Trophy, Users, CheckCircle2, XCircle, Flag,
} from 'lucide-react';
import { useRaceDetail } from '@/hooks/useRaceDetail';
import { useHorsesByRace } from '@/hooks/useHorsesByRace';
import { useRaceResults } from '@/hooks/useRaceResults';
import { approveRaceHorse, rejectRaceHorse } from '@/api/raceHorseApi';
import { updateRace, deleteRace } from '@/api/raceApi';
import { useToast } from '@/components/ui/ToastProvider';
import RaceStatusBadge from '@/components/features/race/RaceStatusBadge';
import RaceHorseStatusBadge from '@/components/features/race-horse/RaceHorseStatusBadge';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Seo from '@/components/seo/Seo';

const CLOSEABLE = new Set(['UPCOMING', 'OPEN_REGISTRATION']);

const fmtPrize = (n?: number) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function fmtTime(seconds?: number) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(2);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function AdminRaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const raceId = Number(id);
  const addToast = useToast();

  const { race, loading: raceLoading, refetch: refetchRace } = useRaceDetail(raceId);
  const { entries, loading: entriesLoading, error: entriesError, refetch: refetchEntries } = useHorsesByRace(raceId);
  const { results, loading: resultsLoading } = useRaceResults(raceId);

  const [actionId, setActionId] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleApprove = async (entryId: number, horseName?: string) => {
    setActionId(entryId);
    try {
      await approveRaceHorse(entryId);
      addToast(`"${horseName ?? 'Horse'}" approved`, 'success');
      refetchEntries();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Approval failed.', 'error');
    } finally { setActionId(null); }
  };

  const handleReject = async (entryId: number, horseName?: string) => {
    setActionId(entryId);
    try {
      await rejectRaceHorse(entryId);
      addToast(`"${horseName ?? 'Horse'}" rejected`, 'success');
      refetchEntries();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Rejection failed.', 'error');
    } finally { setActionId(null); }
  };

  const handleCloseRegistration = async () => {
    if (!race) return;
    if (!window.confirm(`Close registration for "${race.raceName}"?`)) return;
    setClosing(true);
    try {
      await updateRace(race.id, { ...race, distance: race.distance?.toString(), status: 'CLOSED_REGISTRATION' });
      addToast('Registration closed.', 'success');
      refetchRace();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to close registration.', 'error');
    } finally { setClosing(false); }
  };

  const handleDelete = async () => {
    if (!race) return;
    if (!window.confirm(`Delete race "${race.raceName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteRace(race.id);
      addToast('Race deleted.', 'success');
      window.location.href = '/admin/races';
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to delete race.', 'error');
      setDeleting(false);
    }
  };

  if (raceLoading) {
    return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;
  }

  if (!race) {
    return (
      <div className="px-8 py-6">
        <p className="text-sm text-ink-3">Race not found.</p>
        <Link to="/admin/races" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-navy-hi">
          <ChevronLeft size={14} /> Back to Races
        </Link>
      </div>
    );
  }

const pendingCount = entries.filter((e) => (e.status as string) === 'Pending').length;

  return (
    <div className="px-8 py-6">
      <Seo title={race.raceName} description={`Admin details for ${race.raceName}`} />

      <Link to="/admin/races" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-3 transition-colors hover:text-ink">
        <ChevronLeft size={14} /> Back to Races
      </Link>

      <DashboardPageHeader
        eyebrow="Admin · Race"
        title={race.raceName}
        subtitle="Manage entries, odds and race status"
        action={
          <div className="flex items-center gap-2">
            {CLOSEABLE.has(race.status) && (
              <button
                type="button"
                disabled={closing}
                onClick={handleCloseRegistration}
                className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-warn-subtle hover:text-warn disabled:opacity-50"
              >
                <Lock size={13} /> {closing ? 'Closing…' : 'Close Registration'}
              </button>
            )}
            <Link
              to={`/admin/races/${race.id}/edit`}
              className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface-overlay hover:text-gold"
            >
              <Pencil size={13} /> Edit
            </Link>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 border border-fail/30 px-3 py-2 text-xs font-semibold text-fail transition-colors hover:bg-fail-subtle disabled:opacity-50"
            >
              <Trash2 size={13} /> {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        }
      />

      {/* Race info */}
      <div className="overflow-hidden border border-rim bg-surface-raised">
        <div className="relative h-48 overflow-hidden bg-navy sm:h-56">
          {race.bannerImageurl
            ? <img src={race.bannerImageurl} alt={race.raceName} className="h-full w-full object-cover" />
            : <div className="h-full w-full bg-[radial-gradient(ellipse_at_30%_50%,rgba(168,132,59,0.14),transparent_60%)]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
          <div className="absolute left-5 top-5"><RaceStatusBadge race={race} /></div>
          {race.totalprizepool != null && (
            <div className="absolute bottom-5 right-5 inline-flex items-center gap-1.5 bg-gold/90 px-3 py-1 text-xs font-bold text-navy">
              <Trophy size={12} /> {fmtPrize(race.totalprizepool)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-6 py-5 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="shrink-0 text-ink-4" />
            <span className="text-ink-2">{fmtDateTime(race.startTime)}</span>
          </div>
          {race.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} className="shrink-0 text-ink-4" />
              <span className="text-ink-2">{race.location}</span>
            </div>
          )}
          {race.capacity != null && (
            <div className="flex items-center gap-2 text-sm">
              <Users size={14} className="shrink-0 text-ink-4" />
              <span className="text-ink-2">{entries.length} / {race.capacity} entries</span>
            </div>
          )}
          <div className="text-sm"><span className="text-ink-4">Track: </span><span className="text-ink-2">{race.trackName ?? '—'}</span></div>
          <div className="text-sm"><span className="text-ink-4">Surface: </span><span className="text-ink-2">{race.surfaceType ?? '—'}</span></div>
          <div className="text-sm"><span className="text-ink-4">Distance: </span><span className="text-ink-2">{race.distance ?? '—'}</span></div>
          <div className="text-sm"><span className="text-ink-4">Condition: </span><span className="text-ink-2">{race.trackCondition ?? '—'}</span></div>
          <div className="text-sm"><span className="text-ink-4">Reg. deadline: </span><span className="text-ink-2">{fmtDate(race.registrationDeadline)}</span></div>
          <div className="text-sm"><span className="text-ink-4">Referee: </span><span className="text-ink-2">{race.refereeId ? `#${race.refereeId}` : 'Not assigned'}</span></div>
        </div>
      </div>

      {/* Entries */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              {pendingCount > 0 ? `${pendingCount} awaiting approval` : 'Entries'}
            </p>
            <h2 className="font-serif text-lg font-bold text-ink">Race Entries</h2>
          </div>
          <Link
            to="/admin/set-odds"
            className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface-overlay hover:text-gold"
          >
            <TrendingUp size={13} /> Set Odds
          </Link>
        </div>

        {entriesError && (
          <div className="mb-4 border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">{entriesError}</div>
        )}

        {entriesLoading ? (
          <div className="divide-y divide-rim border border-rim bg-surface-raised">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="h-8 w-8 animate-pulse rounded-full bg-surface-overlay" />
                <div className="h-3.5 w-32 animate-pulse bg-surface-overlay" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border border-rim bg-surface-raised py-12 text-center">
            <Flag size={20} className="text-ink-4" />
            <p className="text-sm text-ink-2">No horses registered for this race yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-rim bg-surface-raised">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-rim bg-surface-overlay">
                    {['Horse', 'Jockey', 'Status', 'Odds', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rim">
                  {entries.map((e) => {
                    const isLoading = actionId === e.id;
                    const initial = e.horseName?.charAt(0)?.toUpperCase() ?? '?';
                    return (
                      <tr key={e.id} className="transition-colors hover:bg-surface-overlay/40">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {e.horseAvatarUrl ? (
                              <img src={e.horseAvatarUrl} alt={e.horseName} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-sm font-bold text-navy">
                                {initial}
                              </div>
                            )}
                            <span className="font-serif text-sm font-bold text-ink">{e.horseName ?? `Horse #${e.horseId}`}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-ink-2">{e.jockeyName ?? '—'}</td>
                        <td className="px-5 py-3.5"><RaceHorseStatusBadge status={e.status} /></td>
                        <td className="tnum px-5 py-3.5 text-sm font-semibold text-ink">{e.odds != null ? `×${Number(e.odds).toFixed(2)}` : '—'}</td>
                        <td className="px-5 py-3.5">
{(e.status as string) === 'Pending' ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleApprove(e.id, e.horseName)}
                                className="inline-flex items-center gap-1 border border-ok/30 bg-ok-subtle px-2.5 py-1.5 text-xs font-semibold text-ok transition-colors hover:bg-ok hover:text-white disabled:opacity-50"
                              >
                                <CheckCircle2 size={12} /> Approve
                              </button>
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleReject(e.id, e.horseName)}
                                className="inline-flex items-center gap-1 border border-fail/30 bg-fail-subtle px-2.5 py-1.5 text-xs font-semibold text-fail transition-colors hover:bg-fail hover:text-white disabled:opacity-50"
                              >
                                <XCircle size={12} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-ink-4">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Results — only relevant once the race has finished */}
      {race.status === 'FINISHED' && (
        <div className="mt-8">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Results</p>
            <h2 className="font-serif text-lg font-bold text-ink">Final Standings</h2>
          </div>

          {resultsLoading ? (
            <div className="border border-rim bg-surface-raised py-10 text-center text-sm text-ink-3">Loading results…</div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 border border-rim bg-surface-raised py-12 text-center">
              <Trophy size={20} className="text-ink-4" />
              <p className="text-sm text-ink-2">Results have not been submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-rim bg-surface-raised">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-rim bg-surface-overlay">
                    {['Pos.', 'Horse', 'Jockey', 'Time', 'Odds'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rim">
                  {results.map((r) => (
                    <tr key={r.id} className={r.position === 1 ? 'bg-gold/[0.04]' : ''}>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${r.position === 1 ? 'bg-gold text-on-gold' : 'bg-surface-overlay text-ink-3'}`}>
                          {r.position}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-serif text-sm font-bold text-ink">{r.horseName}</td>
                      <td className="px-5 py-3.5 text-sm text-ink-2">{r.jockeyName}</td>
                      <td className="tnum px-5 py-3.5 text-sm text-ink-3">{r.time ?? fmtTime(undefined)}</td>
                      <td className="tnum px-5 py-3.5 text-sm text-ink-2">{r.odds != null ? `×${Number(r.odds).toFixed(2)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}