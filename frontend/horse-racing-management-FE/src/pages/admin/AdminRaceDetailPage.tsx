import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, Pencil, Trash2, Lock, LockOpen, TrendingUp, MapPin, Calendar,
  Trophy, Users, CheckCircle2, XCircle, Flag, PlayCircle, Gauge, Award, Check, X,
} from 'lucide-react';
import { useRaceDetail } from '@/hooks/useRaceDetail';
import { useHorsesByRace } from '@/hooks/useHorsesByRace';
import { useRefereeProfile } from '@/hooks/useRefereeProfile';
import { approveRaceHorse, rejectRaceHorse, approveWithdrawal, rejectWithdrawal, setOdds } from '@/api/raceHorseApi';
import { updateRace, deleteRace, reopenRace, startRace } from '@/api/raceApi';
import { getHorseById } from '@/api/horseOwnerApi';
import { useToast } from '@/components/ui/ToastProvider';
import RaceStatusBadge from '@/components/features/race/RaceStatusBadge';
import RaceHorseStatusBadge from '@/components/features/race-horse/RaceHorseStatusBadge';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Seo from '@/components/seo/Seo';
import { isStatus } from '@/utils/raceHorseStatus';
import type { Horse } from '@/types';

const CLOSEABLE = new Set(['UPCOMING', 'OPEN_REGISTRATION']);
const REOPENABLE = new Set(['CLOSED_REGISTRATION']);
const STARTABLE = new Set(['CLOSED_REGISTRATION']);
const TRACK_CONDITIONS = ['Dry', 'Wet', 'Muddy', 'Fast', 'Soft'];
const SURFACE_TYPES = ['Turf', 'Dirt', 'Synthetic'];

const fmtPrize = (n?: number) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// Round-trips an ISO datetime through an <input type="datetime-local"> value.
function toLocalDatetime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function toISO(local: string) {
  return local ? new Date(local).toISOString() : undefined;
}

const editInputCls =
  'w-full border border-rim bg-surface-input px-2.5 py-1.5 text-sm text-ink outline-none transition-colors focus:border-gold';

export default function AdminRaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const raceId = Number(id);
  const addToast = useToast();

  const { race, loading: raceLoading, refetch: refetchRace } = useRaceDetail(raceId);
  const { entries, loading: entriesLoading, error: entriesError, refetch: refetchEntries } = useHorsesByRace(raceId);

  // Resolve the officiating referee's name for display + link to their public profile.
  // Passing undefined when no referee is assigned keeps the hook from fetching.
  const { referee } = useRefereeProfile(race?.refereeId ?? undefined);

  const [actionId, setActionId] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [horseDetails, setHorseDetails] = useState<Record<number, Horse>>({});
  const fetchedHorseIdsRef = useRef<Set<number>>(new Set());

  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    raceName: '', startTime: '', location: '', capacity: '', trackName: '',
    surfaceType: '', distance: '', trackCondition: '', registrationDeadline: '', totalprizepool: '',
  });
  const setField = (field: keyof typeof editForm, value: string) =>
    setEditForm((prev) => ({ ...prev, [field]: value }));
  const [oddsInputs, setOddsInputs] = useState<Record<number, string>>({});
  const [savingAllOdds, setSavingAllOdds] = useState(false);

  // Race-horse entries don't carry breed/age/speed/rank — fetch them per unique
  // horse (same N+1 pattern used in SetOddsPanel), deduped via a ref
  // so re-renders never re-fetch a horse already loaded.
  useEffect(() => {
    const toFetch = [...new Set(entries.map((e) => e.horseId))].filter((hid) => !fetchedHorseIdsRef.current.has(hid));
    toFetch.forEach((hid) => {
      fetchedHorseIdsRef.current.add(hid);
      getHorseById(hid)
        .then((horse) => setHorseDetails((prev) => ({ ...prev, [hid]: horse })))
        .catch(() => { fetchedHorseIdsRef.current.delete(hid); });
    });
  }, [entries]);

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

  const handleApproveWithdrawal = async (entryId: number, horseName?: string) => {
    setActionId(entryId);
    try {
      await approveWithdrawal(entryId);
      addToast(`Withdrawal approved for "${horseName ?? 'horse'}".`, 'success');
      refetchEntries();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to approve withdrawal.', 'error');
    } finally { setActionId(null); }
  };

  const handleRejectWithdrawal = async (entryId: number, horseName?: string) => {
    setActionId(entryId);
    try {
      await rejectWithdrawal(entryId);
      addToast(`Withdrawal rejected for "${horseName ?? 'horse'}".`, 'success');
      refetchEntries();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to reject withdrawal.', 'error');
    } finally { setActionId(null); }
  };

  // ── Odds ─────────────────────────────────────────────────────
  // Gom các entry đủ điều kiện set odds + giá trị đang nhập trong ô input.
  const collectOddsRows = () => {
    if (!race || CLOSEABLE.has(race.status)) return [];
    return entries
      .filter((e) => isStatus(e.status, 'APPROVED'))
      .map((e) => {
        const raw = (oddsInputs[e.id] ?? (e.odds != null ? String(e.odds) : '')).trim();
        return { entry: e, raw, odds: parseFloat(raw) };
      })
      .filter(({ raw }) => raw !== '');
  };

  // invalid = nhập sai; changed = hợp lệ VÀ khác giá trị đang lưu (chỉ gửi những cái này).
  const oddsDiff = () => {
    const rows = collectOddsRows();
    return {
      invalid: rows.filter((r) => isNaN(r.odds) || r.odds <= 1),
      changed: rows.filter(
        (r) => !isNaN(r.odds) && r.odds > 1 && (r.entry.odds == null || Number(r.entry.odds) !== r.odds),
      ),
    };
  };

  const isOddsInvalid = (entryId: number) => {
    const raw = (oddsInputs[entryId] ?? '').trim();
    if (raw === '') return false;
    const n = parseFloat(raw);
    return isNaN(n) || n <= 1;
  };

  const handleSaveAllOdds = async () => {
    if (!race) return;
    const { invalid, changed } = oddsDiff();
    if (invalid.length > 0) {
      addToast(`${invalid.length} horse(s) have invalid odds. Odds must be a number greater than 1.`, 'error');
      return;
    }
    if (changed.length === 0) {
      addToast('No odds changes to save.', 'error');
      return;
    }

    setSavingAllOdds(true);
    try {
      // 1 request bulk (PUT /race-horse/odds) — backend set trong cùng transaction.
      await setOdds(race.id, changed.map(({ entry, odds }) => ({ raceHorseId: entry.id, odds })));
      addToast(`Odds updated for ${changed.length} horse(s).`, 'success');
      setOddsInputs({});
      refetchEntries();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to update odds.', 'error');
    } finally {
      setSavingAllOdds(false);
    }
  };

  const startEdit = () => {
    // A finished race is frozen — its fields can no longer be edited.
    if (!race || race.status === 'FINISHED') return;
    setEditForm({
      raceName: race.raceName ?? '',
      startTime: toLocalDatetime(race.startTime),
      location: race.location ?? '',
      capacity: race.capacity != null ? String(race.capacity) : '',
      trackName: race.trackName ?? '',
      surfaceType: race.surfaceType ?? SURFACE_TYPES[0],
      distance: race.distance != null ? String(race.distance) : '',
      trackCondition: race.trackCondition ?? TRACK_CONDITIONS[0],
      registrationDeadline: toLocalDatetime(race.registrationDeadline),
      totalprizepool: race.totalprizepool != null ? String(race.totalprizepool) : '',
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!race) return;
    if (!editForm.raceName.trim() || !editForm.startTime || !editForm.trackName.trim()) {
      addToast('Race name, start time and track name are required.', 'error');
      return;
    }
    setSavingEdit(true);
    try {
      await updateRace(race.id, {
        raceName: editForm.raceName.trim(),
        startTime: toISO(editForm.startTime)!,
        endTime: race.endTime,
        trackName: editForm.trackName.trim(),
        trackCondition: editForm.trackCondition,
        surfaceType: editForm.surfaceType,
        totalprizepool: editForm.totalprizepool ? Number(editForm.totalprizepool) : undefined,
        distance: editForm.distance.trim(),
        location: editForm.location.trim(),
        capacity: editForm.capacity ? Number(editForm.capacity) : undefined,
        bannerImageurl: race.bannerImageurl,
        registrationDeadline: toISO(editForm.registrationDeadline),
        refereeId: race.refereeId ?? null,
        status: race.status,
      });
      addToast('Race updated.', 'success');
      setEditing(false);
      refetchRace();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to update race.', 'error');
    } finally { setSavingEdit(false); }
  };

  const handleReopenRegistration = async () => {
    if (!race) return;
    setReopening(true);
    try {
      await reopenRace(race.id);
      addToast('Registration reopened.', 'success');
      refetchRace();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to reopen registration.', 'error');
    } finally { setReopening(false); }
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

  const handleStartRace = async () => {
    if (!race) return;
    if (!window.confirm(`Start "${race.raceName}"? Betting and registration will close.`)) return;
    setStarting(true);
    try {
      await startRace(race.id);
      addToast('Race started.', 'success');
      refetchRace();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to start race.', 'error');
    } finally { setStarting(false); }
  };

  const handleDelete = async () => {
    // A race that's currently running must not be deleted mid-run.
    if (!race || race.status === 'ONGOING') return;
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

  const pendingCount = entries.filter((e) => isStatus(e.status, 'PENDING_ADMIN')).length;
  const withdrawCount = entries.filter((e) => isStatus(e.status, 'WITHDRAW_PENDING')).length;
  // A finished race is a closed historical record — none of its information
  // (fields, odds, or entry decisions) may be changed anymore. This flag freezes
  // every mutating control below.
  const isFinished = race.status === 'FINISHED';
  // An ONGOING race is mid-run — deleting it now would wipe a race in progress,
  // so the Delete action is withheld until the race is no longer running.
  const isOngoing = race.status === 'ONGOING';
  // Odds can only be set once registration is closed — before that the field is
  // still open to new entries, so pricing them early would be premature.
  const registrationClosed = !CLOSEABLE.has(race.status);
  // Hide entries still waiting on the jockey to accept — they aren't a real part
  // of the field yet, so they shouldn't clutter admin's approval queue.
  // Then sort by odds ascending (smallest first); horses without odds set (null)
  // fall to the bottom. odds is a BigDecimal → may arrive as a string over JSON,
  // so coerce to Number before comparing. .filter() already returns a fresh array,
  // so .sort() here never mutates the original `entries`.
  const visibleEntries = entries
    .filter((e) => !isStatus(e.status, 'PENDING_JOCKEY'))
    .sort((a, b) => (a.odds != null ? Number(a.odds) : Infinity) - (b.odds != null ? Number(b.odds) : Infinity));

  const { invalid: invalidOdds, changed: changedOdds } = oddsDiff();
  const settableCount = registrationClosed && !isFinished
    ? visibleEntries.filter((e) => isStatus(e.status, 'APPROVED')).length
    : 0;

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
          editing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={savingEdit}
                className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface-overlay disabled:opacity-50"
              >
                <X size={13} /> Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="inline-flex items-center gap-1.5 bg-navy px-3 py-2 text-xs font-semibold text-on-blue transition-colors hover:bg-navy-hi disabled:opacity-50"
              >
                <Check size={13} /> {savingEdit ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          ) : (
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
              {REOPENABLE.has(race.status) && (
                <button
                  type="button"
                  disabled={reopening}
                  onClick={handleReopenRegistration}
                  className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-ok-subtle hover:text-ok disabled:opacity-50"
                >
                  <LockOpen size={13} /> {reopening ? 'Reopening…' : 'Reopen Registration'}
                </button>
              )}
              {STARTABLE.has(race.status) && (
                <button
                  type="button"
                  disabled={starting}
                  onClick={handleStartRace}
                  className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-ok-subtle hover:text-ok disabled:opacity-50"
                >
                  <PlayCircle size={13} /> {starting ? 'Starting…' : 'Start Race'}
                </button>
              )}
              {isFinished ? (
                <span className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-4">
                  <Lock size={13} /> Finished · read-only
                </span>
              ) : (
                <button
                  type="button"
                  onClick={startEdit}
                  className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface-overlay hover:text-gold"
                >
                  <Pencil size={13} /> Edit
                </button>
              )}
              {!isOngoing && (
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 border border-fail/30 px-3 py-2 text-xs font-semibold text-fail transition-colors hover:bg-fail-subtle disabled:opacity-50"
                >
                  <Trash2 size={13} /> {deleting ? 'Deleting…' : 'Delete'}
                </button>
              )}
            </div>
          )
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

        {editing ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 sm:grid-cols-3">
            <label className="col-span-2 flex flex-col gap-1 sm:col-span-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-4">Race Name</span>
              <input value={editForm.raceName} onChange={(e) => setField('raceName', e.target.value)} className={editInputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-4">Start Time</span>
              <input type="datetime-local" value={editForm.startTime} onChange={(e) => setField('startTime', e.target.value)} className={editInputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-4">Location</span>
              <input value={editForm.location} onChange={(e) => setField('location', e.target.value)} className={editInputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-4">Capacity</span>
              <input type="number" min={1} value={editForm.capacity} onChange={(e) => setField('capacity', e.target.value)} className={editInputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-4">Track Name</span>
              <input value={editForm.trackName} onChange={(e) => setField('trackName', e.target.value)} className={editInputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-4">Surface</span>
              <select value={editForm.surfaceType} onChange={(e) => setField('surfaceType', e.target.value)} className={editInputCls}>
                {SURFACE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-4">Distance</span>
              <input value={editForm.distance} onChange={(e) => setField('distance', e.target.value)} className={editInputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-4">Condition</span>
              <select value={editForm.trackCondition} onChange={(e) => setField('trackCondition', e.target.value)} className={editInputCls}>
                {TRACK_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-4">Reg. Deadline</span>
              <input type="datetime-local" value={editForm.registrationDeadline} onChange={(e) => setField('registrationDeadline', e.target.value)} className={editInputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-4">Prize Pool (VND)</span>
              <input type="number" min={0} value={editForm.totalprizepool} onChange={(e) => setField('totalprizepool', e.target.value)} className={editInputCls} />
            </label>
          </div>
        ) : (
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

            {/* Referee — name (resolved via useRefereeProfile) + link to public profile */}
            <div className="text-sm">
              <span className="text-ink-4">Referee: </span>
              {race.refereeId ? (
                <>
                  <span className="text-ink-2">{referee?.name ?? `Referee #${race.refereeId}`}</span>{' '}
<Link
  to={`/referees/${race.refereeId}`}
  className="rounded border border-gold px-2 py-0.5 text-xs font-semibold text-gold transition-colors hover:bg-gold hover:text-white"
>
  View
</Link>
                </>
              ) : (
                <span className="text-ink-4">Not assigned</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Entries */}
      <div className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              {[
                pendingCount > 0 ? `${pendingCount} awaiting approval` : null,
                withdrawCount > 0 ? `${withdrawCount} awaiting withdrawal review` : null,
              ].filter(Boolean).join(' · ') || 'Entries'}
            </p>
            <h2 className="font-serif text-lg font-bold text-ink">Race Entries</h2>
          </div>

          {/* One button saves odds for every horse that has a changed, valid value. */}
          {settableCount > 0 && (
            <button
              type="button"
              disabled={savingAllOdds || changedOdds.length === 0 || invalidOdds.length > 0}
              onClick={handleSaveAllOdds}
              className="inline-flex shrink-0 items-center gap-1.5 border border-gold-hi bg-gold px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-navy shadow-md transition-colors hover:bg-gold-hi disabled:cursor-not-allowed disabled:border-rim-hi disabled:bg-surface-overlay disabled:text-ink-3 disabled:shadow-none"
            >
              <TrendingUp size={13} />
              {savingAllOdds ? 'Saving…' : changedOdds.length > 0 ? `Set Odds (${changedOdds.length})` : 'Set Odds'}
            </button>
          )}
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
        ) : visibleEntries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border border-rim bg-surface-raised py-12 text-center">
            <Flag size={20} className="text-ink-4" />
            <p className="text-sm text-ink-2">
              {entries.length > 0 ? 'No entries yet — all registrations are still awaiting jockey confirmation.' : 'No horses registered for this race yet.'}
            </p>
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
                  {visibleEntries.map((e) => {
                    const isLoading = actionId === e.id;
                    const initial = e.horseName?.charAt(0)?.toUpperCase() ?? '?';
                    const detail = horseDetails[e.horseId];
                    const canApprove = isStatus(e.status, 'PENDING_ADMIN') && !isFinished;
                    const canReviewWithdrawal = isStatus(e.status, 'WITHDRAW_PENDING') && !isFinished;
                    const canSetOdds = isStatus(e.status, 'APPROVED') && registrationClosed && !isFinished;
                    return (
                      <tr key={e.id} className="transition-colors hover:bg-surface-overlay/40">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {e.horseAvatarUrl ? (
                              <img src={e.horseAvatarUrl} alt={e.horseName} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-sm font-bold text-navy">
                                {initial}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-serif text-sm font-bold text-ink">{e.horseName ?? `Horse #${e.horseId}`}</p>
                              <p className="mt-0.5 flex items-center gap-2.5 truncate text-[10px] font-medium text-ink-4">
                                {detail ? (
                                  <>
                                    {detail.breed && <span className="truncate">{detail.breed}</span>}
                                    {detail.age != null && <span className="shrink-0">Age {detail.age}</span>}
                                    {detail.speedRating != null && (
                                      <span className="flex shrink-0 items-center gap-0.5">
                                        <Gauge size={10} className="text-ink-4" /> {detail.speedRating}
                                      </span>
                                    )}
                                    {detail.historyRank && (
                                      <span className="flex shrink-0 items-center gap-0.5 text-gold">
                                        <Award size={10} /> {detail.historyRank}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="italic text-ink-4/60">Loading stats…</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-ink-2">{e.jockeyName ?? '—'}</td>
                        <td className="px-5 py-3.5"><RaceHorseStatusBadge status={e.status} /></td>
                        <td className="tnum px-5 py-3.5 text-sm font-semibold text-ink">{e.odds != null ? `×${Number(e.odds).toFixed(2)}` : '—'}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Approve/Reject — only while awaiting admin approval */}
                            {canApprove && (
                              <div className="flex gap-1.5">
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
                            )}

                            {/* Withdrawal review — only while a withdrawal request is pending */}
                            {canReviewWithdrawal && (
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  disabled={isLoading}
                                  onClick={() => handleApproveWithdrawal(e.id, e.horseName)}
                                  className="inline-flex items-center gap-1 border border-ok/30 bg-ok-subtle px-2.5 py-1.5 text-xs font-semibold text-ok transition-colors hover:bg-ok hover:text-white disabled:opacity-50"
                                >
                                  <CheckCircle2 size={12} /> Approve Withdrawal
                                </button>
                                <button
                                  type="button"
                                  disabled={isLoading}
                                  onClick={() => handleRejectWithdrawal(e.id, e.horseName)}
                                  className="inline-flex items-center gap-1 border border-fail/30 bg-fail-subtle px-2.5 py-1.5 text-xs font-semibold text-fail transition-colors hover:bg-fail hover:text-white disabled:opacity-50"
                                >
                                  <XCircle size={12} /> Reject Withdrawal
                                </button>
                              </div>
                            )}

                            {/* Odds input — only once approved AND registration has closed.
                                Saving is handled by the single "Set Odds" button above the table. */}
                            {canSetOdds && (
                              <div className="relative">
                                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-4">×</span>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="3.50"
                                  disabled={savingAllOdds}
                                  value={oddsInputs[e.id] ?? (e.odds != null ? String(e.odds) : '')}
                                  onChange={(ev) =>
                                    setOddsInputs((prev) => ({
                                      ...prev,
                                      [e.id]: ev.target.value.replace(',', '.').replace(/[^0-9.]/g, ''),
                                    }))
                                  }
                                  onKeyDown={(ev) => { if (ev.key === 'Enter') handleSaveAllOdds(); }}
                                  className={`w-20 border bg-surface-input py-1.5 pl-5 pr-2 text-xs font-semibold text-ink outline-none transition-colors focus:border-gold disabled:opacity-50 ${isOddsInvalid(e.id) ? 'border-fail' : 'border-rim'
                                    }`}
                                />
                              </div>
                            )}

                            {/* Nothing actionable right now (e.g. still open for registration, or jockey hasn't confirmed yet) */}
                            {!canApprove && !canReviewWithdrawal && !canSetOdds && (
                              <span className="text-xs text-ink-4">—</span>
                            )}
                          </div>
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
    </div>
  );
}