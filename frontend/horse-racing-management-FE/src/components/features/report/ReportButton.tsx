import { useState } from 'react';
import {
  Flag, Rabbit, User, ShieldAlert, Zap, MessageSquareWarning, BadgeAlert, Gavel, MoreHorizontal,
  CheckCircle2, type LucideIcon,
} from 'lucide-react';
import { createReport } from '@/api/reportApi';
import { getErrorMessage } from '@/utils/errors';
import { useToast } from '@/components/ui/ToastProvider';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { ReportTargetType, ReportReason } from '@/types';

const REASONS: { value: ReportReason; label: string; hint: string; icon: LucideIcon }[] = [
  { value: 'CHEATING', label: 'Cheating', hint: 'Race manipulation, exploiting bugs, etc.', icon: Zap },
  { value: 'ABUSE', label: 'Abuse or harassment', hint: 'Threatening or abusive behaviour', icon: MessageSquareWarning },
  { value: 'FAKE_INFO', label: 'Fake information', hint: 'Impersonation or false profile details', icon: BadgeAlert },
  { value: 'RULE_VIOLATION', label: 'Rule violation', hint: 'Breaking Royal Derby race rules', icon: Gavel },
  { value: 'OTHER', label: 'Other', hint: 'Something else not listed above', icon: MoreHorizontal },
];

const DETAIL_MAX = 500;

/** Self-contained report trigger — renders its own small "Report" button and,
 *  once clicked, its own modal. Drop it onto any public profile page (horse,
 *  jockey, referee, horse owner) without any parent-managed state. */
export default function ReportButton({
  targetType,
  targetId,
  targetName,
  className,
}: {
  targetType: ReportTargetType;
  targetId: number;
  targetName?: string;
  className?: string;
}) {
  const addToast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('CHEATING');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const close = () => {
    if (submitting) return;
    setOpen(false);
    // Reset shortly after the close animation/unmount so the form isn't visibly
    // blank while the modal is still fading out.
    setTimeout(() => { setReason('CHEATING'); setDetail(''); setSubmitted(false); }, 200);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createReport({ targetType, targetId, reason, detail: detail.trim() || undefined });
      setSubmitted(true);
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Failed to submit report.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const TargetIcon = targetType === 'HORSE' ? Rabbit : User;

  const footer = submitted ? (
    <div className="flex justify-end">
      <Button variant="outline" onClick={close}>Done</Button>
    </div>
  ) : (
    <div className="flex justify-end gap-2.5">
      <Button variant="outline" onClick={close} disabled={submitting}>Cancel</Button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="inline-flex items-center gap-1.5 bg-fail px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fail/85 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Flag size={14} /> {submitting ? 'Submitting…' : 'Submit Report'}
      </button>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Report ${targetType === 'HORSE' ? 'this horse' : 'this profile'}`}
        className={className ?? 'inline-flex items-center gap-1.5 text-xs font-semibold text-ink-4 transition-colors hover:text-fail'}
      >
        <Flag size={13} /> Report
      </button>

      <Modal
        open={open}
        onClose={close}
        size="sm"
        footer={submitted ? undefined : footer}
        accentClassName="bg-fail"
        title={
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fail-subtle text-fail">
              <ShieldAlert size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-fail">Submit a Report</p>
              <h3 className="truncate font-serif text-base font-bold text-ink">
                {targetName ?? (targetType === 'HORSE' ? 'This horse' : 'This profile')}
              </h3>
            </div>
          </div>
        }
      >
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ok-subtle text-ok">
              <CheckCircle2 size={26} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Report submitted</p>
              <p className="mt-1 max-w-xs text-sm text-ink-3">
                Thanks for flagging this — our team will review it shortly.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Confirms exactly what's being reported before the user commits */}
            <div className="flex items-center gap-2.5 border border-rim bg-surface-overlay/60 px-3 py-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-raised text-ink-3">
                <TargetIcon size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-4">Reporting {targetType === 'HORSE' ? 'horse' : 'user'}</p>
                <p className="truncate text-sm font-semibold text-ink">{targetName ?? `#${targetId}`}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-4">Reason</p>
              <div className="flex flex-col gap-1.5">
                {REASONS.map((r) => {
                  const Icon = r.icon;
                  const selected = reason === r.value;
                  return (
                    <label
                      key={r.value}
                      className={`flex cursor-pointer items-center gap-3 border px-3 py-2.5 transition-colors ${
                        selected ? 'border-fail/40 bg-fail-subtle' : 'border-rim hover:border-rim-hi'
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        checked={selected}
                        onChange={() => setReason(r.value)}
                        className="accent-fail"
                      />
                      <Icon size={15} className={selected ? 'shrink-0 text-fail' : 'shrink-0 text-ink-4'} />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${selected ? 'text-ink' : 'text-ink-2'}`}>{r.label}</p>
                        <p className="text-xs text-ink-4">{r.hint}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="report-detail" className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-4">
                <span>Details (optional)</span>
                <span className="tnum font-normal normal-case text-ink-4">{detail.length}/{DETAIL_MAX}</span>
              </label>
              <textarea
                id="report-detail"
                rows={3}
                maxLength={DETAIL_MAX}
                placeholder="Tell us what happened…"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className="w-full resize-none border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>

            <p className="text-xs text-ink-4">
              Reports are reviewed by Royal Derby admins. Submitting false or malicious reports may result in action against your own account.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
