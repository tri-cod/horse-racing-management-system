import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, Ban, User, Rabbit, Eye } from 'lucide-react';
import { getPendingReports, getAllReports, reviewReport } from '@/api/adminApi';
import { getErrorMessage } from '@/utils/errors';
import { useToast } from '@/components/ui/ToastProvider';
import EmptyState from '@/components/ui/EmptyState';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { Report, ReportReviewAction, ReportStatus } from '@/types';

const REASON_LABEL: Record<string, string> = {
  CHEATING: 'Cheating',
  ABUSE: 'Abuse or harassment',
  FAKE_INFO: 'Fake information',
  RULE_VIOLATION: 'Rule violation',
  OTHER: 'Other',
};

const STATUS_STYLES: Record<ReportStatus, string> = {
  PENDING: 'border-warn/30 bg-warn-subtle text-warn',
  REVIEWED: 'border-navy/20 bg-navy/10 text-navy',
  DISMISSED: 'border-rim-hi bg-surface-overlay text-ink-3',
  ACTION_TAKEN: 'border-fail/30 bg-fail-subtle text-fail',
};

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'all', label: 'All Reports' },
] as const;
type TabKey = typeof TABS[number]['key'];

function fmtDateTime(iso?: string) {
  return iso
    ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden border border-rim bg-surface-raised">
      <div className="border-b border-rim bg-surface-overlay px-5 py-3">
        <div className="flex gap-10">
          {[140, 100, 120, 90, 90].map((w, i) => (
            <div key={i} className="h-3 animate-pulse rounded-full bg-surface-input" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-rim">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-5 py-4">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-overlay" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-40 animate-pulse rounded-full bg-surface-overlay" />
              <div className="h-2.5 w-56 animate-pulse rounded-full bg-surface-overlay" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const addToast = useToast();
  const [tab, setTab] = useState<TabKey>('pending');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<number, string>>({});

  const fetchReports = useCallback(async (which: TabKey) => {
    setLoading(true);
    try {
      const list = which === 'pending' ? await getPendingReports() : await getAllReports();
      setReports(list ?? []);
      setError('');
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Unable to load reports.'));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReports(tab); }, [tab, fetchReports]);

  const handleReview = async (report: Report, action: ReportReviewAction, successMsg: string) => {
    setActionId(report.id);
    try {
      await reviewReport(report.id, action, noteDraft[report.id]?.trim() || undefined);
      addToast(successMsg, 'success');
      if (tab === 'pending') {
        setReports((prev) => prev.filter((r) => r.id !== report.id));
      } else {
        fetchReports('all');
      }
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Failed to review report.'), 'error');
    } finally { setActionId(null); }
  };

  const pendingCount = tab === 'pending' ? reports.length : reports.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="px-8 py-6">
      <Seo title="Reports" description="Review reports submitted by members about users or horses." />
      <DashboardPageHeader
        eyebrow="Admin"
        title="Reports"
        subtitle={pendingCount > 0 ? `${pendingCount} pending review` : 'No pending reports'}
      />

      {/* Tabs */}
      <div className="mb-5 flex items-center border-b border-rim">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'border-navy text-navy' : 'border-transparent text-ink-3 hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <button type="button" onClick={() => fetchReports(tab)} className="font-semibold underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title={tab === 'pending' ? 'No pending reports' : 'No reports yet'}
          subtitle="Reports submitted by members about users or horses will appear here."
        />
      ) : (
        <div className="overflow-hidden border border-rim bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-b border-rim bg-surface-overlay">
                  {['Target', 'Reason', 'Reporter', 'Detail', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rim">
                {reports.map((r) => {
                  const isLoading = actionId === r.id;
                  const isPending = r.status === 'PENDING';
                  const href = r.targetType === 'HORSE'
                    ? `/horses/${r.targetId}`
                    : `/admin/users?keyword=${encodeURIComponent(r.targetName ?? '')}`;
                  return (
                    <tr key={r.id} className="align-top transition-colors hover:bg-surface-overlay/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex shrink-0 items-center gap-1 border border-rim-hi px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-3">
                            {r.targetType === 'HORSE' ? <Rabbit size={10} /> : <User size={10} />}
                            {r.targetType}
                          </span>
                          <span className="truncate text-sm font-semibold text-ink">{r.targetName ?? `#${r.targetId}`}</span>
                        </div>
                        <Link
                          to={href}
                          title={r.targetType === 'HORSE' ? 'View reported horse' : 'Search for this user in Manage Users'}
                          className="mt-1.5 inline-flex items-center gap-1 border border-rim-hi px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-3 transition-colors hover:border-gold/40 hover:bg-surface-overlay hover:text-gold-hi"
                        >
                          <Eye size={11} /> {r.targetType === 'HORSE' ? 'View Horse' : 'Find User'}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex border border-warn/30 bg-warn-subtle px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warn">
                          {REASON_LABEL[r.reason] ?? r.reason}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-ink-2">{r.reporterName ?? `User #${r.reporterId}`}</td>
                      <td className="max-w-[220px] px-5 py-3.5 text-xs text-ink-3">
                        {r.detail ? <span className="line-clamp-3 whitespace-pre-line">{r.detail}</span> : <span className="text-ink-4">—</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink-3">{fmtDateTime(r.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[r.status]}`}>
                          {r.status.replace('_', ' ')}
                        </span>
                        {!isPending && r.adminNote && (
                          <p className="mt-1 max-w-[180px] text-[11px] italic text-ink-4">{r.adminNote}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {isPending ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              placeholder="Admin note (optional)"
                              value={noteDraft[r.id] ?? ''}
                              onChange={(e) => setNoteDraft((prev) => ({ ...prev, [r.id]: e.target.value }))}
                              className="w-44 border border-rim bg-surface-input px-2 py-1 text-xs text-ink outline-none focus:border-gold"
                            />
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleReview(r, 'DISMISS', 'Report dismissed.')}
                                className="inline-flex items-center gap-1 border border-rim-hi px-2 py-1 text-[11px] font-semibold text-ink-2 transition-colors hover:bg-surface-overlay disabled:opacity-50"
                              >
                                <CheckCircle2 size={11} /> Dismiss
                              </button>
                              {r.targetType === 'USER' && (
                                <button
                                  type="button"
                                  disabled={isLoading}
                                  onClick={() => {
                                    if (!window.confirm(`Ban the reported user "${r.targetName ?? r.targetId}"?`)) return;
                                    handleReview(r, 'BAN_USER', 'User banned.');
                                  }}
                                  className="inline-flex items-center gap-1 border border-fail/30 bg-fail-subtle px-2 py-1 text-[11px] font-semibold text-fail transition-colors hover:bg-fail hover:text-white disabled:opacity-50"
                                >
                                  <Ban size={11} /> Ban User
                                </button>
                              )}
                              {r.targetType === 'HORSE' && (
                                <button
                                  type="button"
                                  disabled={isLoading}
                                  onClick={() => {
                                    if (!window.confirm(`Ban the reported horse "${r.targetName ?? r.targetId}"?`)) return;
                                    handleReview(r, 'BAN_HORSE', 'Horse banned.');
                                  }}
                                  className="inline-flex items-center gap-1 border border-fail/30 bg-fail-subtle px-2 py-1 text-[11px] font-semibold text-fail transition-colors hover:bg-fail hover:text-white disabled:opacity-50"
                                >
                                  <Ban size={11} /> Ban Horse
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-4">
                            {r.reviewedAt ? `Reviewed ${fmtDateTime(r.reviewedAt)}` : '—'}
                          </span>
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
  );
}
