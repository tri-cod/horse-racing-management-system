import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Flag, Rabbit, User, Gauge, Award } from 'lucide-react';
import { getJockeyRequests, jockeyAcceptRequest, jockeyDeclineRequest } from '@/api/raceHorseApi';
import { getHorseById } from '@/api/horseOwnerApi';
import { getErrorMessage } from '@/utils/errors';
import { useToast } from '@/components/ui/ToastProvider';
import EmptyState from '@/components/ui/EmptyState';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { RaceHorse, Horse } from '@/types';

function RequestsSkeleton() {
  return (
    <div className="divide-y divide-rim border border-rim bg-surface-raised">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-overlay" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-40 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-surface-overlay" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JockeyRaceRequestsPage() {
  const addToast = useToast();
  const [requests, setRequests] = useState<RaceHorse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  // Requests only carry the horse's name/avatar — fetch breed/age/speed/rank per
  // unique horse (same pattern as the admin race-detail approval table) so the
  // jockey can judge the horse before accepting a ride, not just its name.
  const [horseDetails, setHorseDetails] = useState<Record<number, Horse>>({});
  const fetchedHorseIdsRef = useRef<Set<number>>(new Set());

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getJockeyRequests();
      setRequests(list ?? []);
      setError('');
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Unable to load jockey requests.'));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    const toFetch = [...new Set(requests.map((r) => r.horseId))].filter((hid) => !fetchedHorseIdsRef.current.has(hid));
    toFetch.forEach((hid) => {
      fetchedHorseIdsRef.current.add(hid);
      getHorseById(hid)
        .then((horse) => setHorseDetails((prev) => ({ ...prev, [hid]: horse })))
        .catch(() => { fetchedHorseIdsRef.current.delete(hid); });
    });
  }, [requests]);

  const handleAccept = async (r: RaceHorse) => {
    setActionId(r.id);
    try {
      await jockeyAcceptRequest(r.id);
      addToast(`Accepted ride on "${r.horseName ?? 'horse'}".`, 'success');
      setRequests((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Failed to accept request.'), 'error');
    } finally { setActionId(null); }
  };

  const handleDecline = async (r: RaceHorse) => {
    setActionId(r.id);
    try {
      await jockeyDeclineRequest(r.id);
      addToast(`Declined ride on "${r.horseName ?? 'horse'}".`, 'success');
      setRequests((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Failed to decline request.'), 'error');
    } finally { setActionId(null); }
  };

  return (
    <div className="px-8 py-6">
      <Seo title="Race Requests" description="Review and respond to horse owner requests to ride." />
      <DashboardPageHeader
        eyebrow="Jockey"
        title="Race Requests"
        subtitle={requests.length > 0 ? `${requests.length} awaiting your response` : 'Requests from horse owners'}
      />

      {error && (
        <div className="mb-5 flex items-center justify-between border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <button type="button" onClick={fetchRequests} className="font-semibold underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <RequestsSkeleton />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No pending requests"
          subtitle="Horse owners will appear here when they invite you to ride."
        />
      ) : (
        <div className="overflow-hidden border border-rim bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-rim bg-surface-overlay">
                  {['Horse', 'Owner', 'Race', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rim">
                {requests.map((r) => {
                  const isLoading = actionId === r.id;
                  const initial = r.horseName?.charAt(0)?.toUpperCase() ?? '?';
                  const detail = horseDetails[r.horseId];
                  return (
                    <tr key={r.id} className="transition-colors hover:bg-surface-overlay/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {r.horseAvatarUrl ? (
                            <img src={r.horseAvatarUrl} alt={r.horseName} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-sm font-bold text-navy">
                              {initial}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 font-serif text-sm font-bold text-ink">
                              {r.horseName ?? `Horse #${r.horseId}`}
                              <Link
                                to={`/horses/${r.horseId}`}
                                title="View horse profile and race record"
                                className="inline-flex shrink-0 items-center gap-1 border border-rim-hi px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-3 transition-colors hover:border-gold/40 hover:bg-surface-overlay hover:text-gold-hi"
                              >
                                <Rabbit size={11} /> View
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
                        {r.ownerId != null ? (
                          <Link
                            to={`/horse-owners/${r.ownerId}`}
                            title="View owner's stable profile and track record"
                            className="inline-flex items-center gap-1.5 border border-rim-hi px-2.5 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-gold/40 hover:bg-surface-overlay hover:text-gold-hi"
                          >
                            <User size={12} className="shrink-0 text-ink-4" />
                            {r.ownerName ?? `Owner #${r.ownerId}`}
                          </Link>
                        ) : (
                          <span className="text-sm text-ink-4">{r.ownerName ?? '—'}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-ink-2">{r.raceName ?? `Race #${r.raceId}`}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleAccept(r)}
                            className="inline-flex items-center gap-1 border border-ok/30 bg-ok-subtle px-2.5 py-1.5 text-xs font-semibold text-ok transition-colors hover:bg-ok hover:text-white disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} /> Accept
                          </button>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleDecline(r)}
                            className="inline-flex items-center gap-1 border border-fail/30 bg-fail-subtle px-2.5 py-1.5 text-xs font-semibold text-fail transition-colors hover:bg-fail hover:text-white disabled:opacity-50"
                          >
                            <XCircle size={12} /> Decline
                          </button>
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
  );
}
