import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, Pencil, Trash2, Lock, LockOpen, TrendingUp, MapPin, Calendar,
  Trophy, Users, CheckCircle2, XCircle, Flag, PlayCircle, Gauge, Award, Check, X, ShieldAlert,
  Rabbit, User,
} from 'lucide-react';
import { useRaceDetail } from '@/hooks/useRaceDetail';
import { useHorsesByRace } from '@/hooks/useHorsesByRace';
import { useRefereeProfile } from '@/hooks/useRefereeProfile';
import { approveRaceHorse, rejectRaceHorse, approveWithdrawal, rejectWithdrawal, setOdds } from '@/api/raceHorseApi';
import { updateRace, deleteRace, reopenRace, startRace, closeRace, openBetting } from '@/api/raceApi';
import { getHorseById } from '@/api/horseOwnerApi';
import { useToast } from '@/components/ui/ToastProvider';
import RaceStatusBadge from '@/components/features/race/RaceStatusBadge';
import RaceHorseStatusBadge from '@/components/features/race-horse/RaceHorseStatusBadge';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Seo from '@/components/seo/Seo';
import { isStatus, isAnyStatus, type RaceHorseStatusKey } from '@/utils/raceHorseStatus';
import { assignLanes } from '@/utils/laneUtils';
import type { Horse } from '@/types';

const CLOSEABLE = new Set(['UPCOMING', 'OPEN_REGISTRATION']);
const REOPENABLE = new Set(['CLOSED_REGISTRATION', 'SETTING_ODDS']);
const OPENBETTABLE = new Set(['SETTING_ODDS']);
const STARTABLE = new Set(['OPEN_BETTING']);
const TRACK_CONDITIONS = ['Dry', 'Wet', 'Muddy', 'Fast', 'Soft'];
const SURFACE_TYPES = ['Turf', 'Dirt', 'Synthetic'];
// Every race runs at the same physical venue — locked here too, mirroring RaceForm.tsx.
const LOCKED_TRACK_NAME = 'Derby Track';
const LOCKED_LOCATION = 'Santa Anita Park';

// One table per status group instead of one mixed table — each tab only
// carries the columns/actions that are actually relevant to that status.
// FINISHED/DISQUALIFIED are intentionally excluded: FINISHED duplicates the
// dedicated race-results view (which also has rank/rewards this page's API
// doesn't return), and DISQUALIFIED is a transient state that folds back
// into FINISHED as soon as results are recorded.
type EntryTabKey =
  | 'JOCKEY_STATUS' | 'PENDING_ADMIN' | 'WITHDRAW_PENDING'
  | 'APPROVED' | 'REJECTED' | 'WITHDRAW_HISTORY';

const ENTRY_TABS: { key: EntryTabKey; label: string; statuses: RaceHorseStatusKey[]; emptyText: string }[] = [
  // PENDING_JOCKEY (still waiting on the jockey to respond) and JOCKEY_REJECTED
  // (jockey declined) are both non-actionable for admin — same "not real yet"
  // holding area — so they share one tab, distinguished by a Status column.
  { key: 'JOCKEY_STATUS', label: 'Jockey Status', statuses: ['PENDING_JOCKEY', 'JOCKEY_REJECTED'], emptyText: 'No registrations awaiting a jockey.' },
  { key: 'PENDING_ADMIN', label: 'Pending Approval', statuses: ['PENDING_ADMIN'], emptyText: 'No entries awaiting approval.' },
  { key: 'WITHDRAW_PENDING', label: 'Withdrawal Requests', statuses: ['WITHDRAW_PENDING'], emptyText: 'No withdrawal requests.' },
  { key: 'APPROVED', label: 'Approved', statuses: ['APPROVED'], emptyText: 'No approved horses yet.' },
  { key: 'REJECTED', label: 'Rejected', statuses: ['REJECTED'], emptyText: 'No rejected entries.' },
  { key: 'WITHDRAW_HISTORY', label: 'Withdrawal History', statuses: ['WITHDRAW_REJECTED', 'WITHDRAWN'], emptyText: 'No withdrawal history yet.' },
];

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
  const [openingBetting, setOpeningBetting] = useState(false);
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
  const [activeTab, setActiveTab] = useState<EntryTabKey>('PENDING_ADMIN');

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
      // Locked regardless of what the race was saved with — track/location are fixed venue info now.
      location: LOCKED_LOCATION,
      capacity: race.capacity != null ? String(race.capacity) : '',
      trackName: LOCKED_TRACK_NAME,
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
        trackName: LOCKED_TRACK_NAME,
        trackCondition: editForm.trackCondition,
        surfaceType: editForm.surfaceType,
        totalprizepool: editForm.totalprizepool ? Number(editForm.totalprizepool) : undefined,
        distance: editForm.distance.trim(),
        location: LOCKED_LOCATION,
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

  const handleOpenBetting = async () => {
    if (!race) return;
    if (!window.confirm(`Open betting for "${race.raceName}"? Every approved horse must already have odds set.`)) return;
    setOpeningBetting(true);
    try {
      await openBetting(race.id);
      addToast('Betting is now open.', 'success');
      refetchRace();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to open betting.', 'error');
    } finally { setOpeningBetting(false); }
  };

  const handleCloseRegistration = async () => {
    if (!race) return;
    if (!window.confirm(`Close registration for "${race.raceName}"? Odds can be set right after.`)) return;
    setClosing(true);
    try {
      await closeRace(race.id);
      addToast('Registration closed. You can set odds now.', 'success');
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

  // Per-tab counts, shown as badges on the tab bar.
  const tabCounts = Object.fromEntries(
    ENTRY_TABS.map((t) => [t.key, entries.filter((e) => isAnyStatus(e.status, t.statuses)).length]),
  ) as Record<EntryTabKey, number>;

  const activeTabConfig = ENTRY_TABS.find((t) => t.key === activeTab)!;
  let tabEntries = entries.filter((e) => isAnyStatus(e.status, activeTabConfig.statuses));
  if (activeTab === 'APPROVED') {
    // Lane assignment is keyed off registration order — assign it before the
    // odds sort below reorders the rows for display.
    tabEntries = assignLanes(tabEntries as Parameters<typeof assignLanes>[0]);
    // Sort by odds ascending (smallest first); horses without odds set (null)
    // fall to the bottom. odds is a BigDecimal → may arrive as a string over
    // JSON, so coerce to Number before comparing.
    tabEntries = [...tabEntries].sort(
      (a, b) => (a.odds != null ? Number(a.odds) : Infinity) - (b.odds != null ? Number(b.odds) : Infinity),
    );
  }

  const { invalid: invalidOdds, changed: changedOdds } = oddsDiff();
  const settableCount = activeTab === 'APPROVED' && registrationClosed && !isFinished ? tabEntries.length : 0;

  const showLaneColumn = activeTab === 'APPROVED';
  const showOddsColumn = activeTab === 'APPROVED';
  const showStatusColumn = activeTab === 'WITHDRAW_HISTORY' || activeTab === 'JOCKEY_STATUS';
  const showRegisteredColumn = activeTab === 'REJECTED';
  const showActionsColumn = activeTab === 'PENDING_ADMIN' || activeTab === 'WITHDRAW_PENDING';

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
              {OPENBETTABLE.has(race.status) && (
                <button
                  type="button"
                  disabled={openingBetting}
                  onClick={handleOpenBetting}
                  className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-ok-subtle hover:text-ok disabled:opacity-50"
                >
                  <TrendingUp size={13} /> {openingBetting ? 'Opening…' : 'Open Betting'}
                </button>
              )}
              {STARTABLE.has(race.status) && (
                <>
                  {!race.raceInspectedAt && (
                    <span
                      title="The assigned referee must run a clean pre-race inspection before this race can start."
                      className="inline-flex items-center gap-1.5 border border-warn/30 bg-warn-subtle px-3 py-2 text-xs font-semibold text-warn"
                    >
                      <ShieldAlert size={13} /> Not inspected yet
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={starting}
                    onClick={handleStartRace}
                    className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-ok-subtle hover:text-ok disabled:opacity-50"
                  >
                    <PlayCircle size={13} /> {starting ? 'Starting…' : 'Start Race'}
                  </button>
                </>
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
              <input value={editForm.location} disabled className={`${editInputCls} cursor-not-allowed bg-surface-overlay text-ink-3`} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-4">Capacity</span>
              <input type="number" min={1} value={editForm.capacity} onChange={(e) => setField('capacity', e.target.value)} className={editInputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-4">Track Name</span>
              <input value={editForm.trackName} disabled className={`${editInputCls} cursor-not-allowed bg-surface-overlay text-ink-3`} />
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
        <div className="mb-4">
          <h2 className="font-serif text-lg font-bold text-ink">Race Entries</h2>
        </div>

        {/* Tab bar — one status group per tab, each with its own count badge */}
        <div className="flex flex-wrap gap-1.5 border-b border-rim">
          {ENTRY_TABS.map((t) => {
            const count = tabCounts[t.key];
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-gold text-ink'
                    : 'border-transparent text-ink-3 hover:text-ink-2'
                }`}
              >
                {t.label}
                <span
                  className={`tnum inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold ${
                    active ? 'bg-gold/15 text-gold' : 'bg-surface-overlay text-ink-4'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 mb-4 flex items-end justify-end gap-4">
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
        ) : tabEntries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border border-rim bg-surface-raised py-12 text-center">
            <Flag size={20} className="text-ink-4" />
            <p className="text-sm text-ink-2">{activeTabConfig.emptyText}</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-rim bg-surface-raised">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-rim bg-surface-overlay">
                    {[
                      'Horse', 'Owner', 'Jockey',
                      ...(showLaneColumn ? ['Lane'] : []),
                      ...(showOddsColumn ? ['Odds'] : []),
                      ...(showStatusColumn ? ['Status'] : []),
                      ...(showRegisteredColumn ? ['Registered'] : []),
                      ...(showActionsColumn ? ['Actions'] : []),
                    ].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rim">
                  {tabEntries.map((e) => {
                    const isLoading = actionId === e.id;
                    const initial = e.horseName?.charAt(0)?.toUpperCase() ?? '?';
                    const detail = horseDetails[e.horseId];
                    const canSetOdds = showOddsColumn && registrationClosed && !isFinished;
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
                              <p className="flex items-center gap-2 font-serif text-sm font-bold text-ink">
                                {e.horseName ?? `Horse #${e.horseId}`}
                                <Link
                                  to={`/horses/${e.horseId}`}
                                  title="View horse profile and race record"
                                  className="inline-flex shrink-0 items-center gap-1 border border-rim-hi px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-3 transition-colors hover:border-gold/40 hover:bg-surface-overlay hover:text-gold-hi"
                                >
                                  <Rabbit size={10} /> View
                                </Link>
                              </p>
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
                        <td className="px-5 py-3.5">
                          {e.ownerId != null ? (
                            <Link
                              to={`/horse-owners/${e.ownerId}`}
                              title="View owner's stable profile and track record"
                              className="inline-flex items-center gap-1.5 border border-rim-hi px-2.5 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-gold/40 hover:bg-surface-overlay hover:text-gold-hi"
                            >
                              <User size={12} className="shrink-0 text-ink-4" />
                              {e.ownerName ?? `Owner #${e.ownerId}`}
                            </Link>
                          ) : (
                            <span className="text-sm text-ink-4">{e.ownerName ?? '—'}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {e.jockeyId != null ? (
                            <Link
                              to={`/jockeys/${e.jockeyId}`}
                              title="View jockey profile and record"
                              className="inline-flex items-center gap-1.5 border border-rim-hi px-2.5 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-gold/40 hover:bg-surface-overlay hover:text-gold-hi"
                            >
                              <Flag size={12} className="shrink-0 text-ink-4" />
                              {e.jockeyName ?? `Jockey #${e.jockeyId}`}
                            </Link>
                          ) : (
                            <span className="text-sm text-ink-2">—</span>
                          )}
                        </td>

                        {showLaneColumn && (
                          <td className="px-5 py-3.5">
                            <span className="tnum inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy/10 text-xs font-bold text-navy">
                              {e.laneNumber ?? '—'}
                            </span>
                          </td>
                        )}

                        {showOddsColumn && (
                          <td className="px-5 py-3.5">
                            {/* Editable only once registration has closed — saving is handled
                                by the single "Set Odds" button above the table. */}
                            {canSetOdds ? (
                              <div className="relative w-20">
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
                                  className={`w-full border bg-surface-input py-1.5 pl-5 pr-2 text-xs font-semibold text-ink outline-none transition-colors focus:border-gold disabled:opacity-50 ${isOddsInvalid(e.id) ? 'border-fail' : 'border-rim'
                                    }`}
                                />
                              </div>
                            ) : (
                              <span className="tnum text-sm font-semibold text-ink">{e.odds != null ? `×${Number(e.odds).toFixed(2)}` : '—'}</span>
                            )}
                          </td>
                        )}

                        {showStatusColumn && (
                          <td className="px-5 py-3.5"><RaceHorseStatusBadge status={e.status} /></td>
                        )}

                        {showRegisteredColumn && (
                          <td className="px-5 py-3.5 text-sm text-ink-3">{fmtDate(e.registerAt)}</td>
                        )}

                        {showActionsColumn && (
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {activeTab === 'PENDING_ADMIN' && !isFinished && (
                                <>
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
                                </>
                              )}
                              {activeTab === 'WITHDRAW_PENDING' && !isFinished && (
                                <>
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
                                </>
                              )}
                            </div>
                          </td>
                        )}
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