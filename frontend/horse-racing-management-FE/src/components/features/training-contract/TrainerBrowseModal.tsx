import { useEffect, useState } from 'react';
import { ArrowLeft, Award, Cake, FileSignature, Wallet } from 'lucide-react';
import { getTrainerList } from '@/api/trainerApi';
import { getErrorMessage } from '@/utils/errors';
import { calculateAge } from '@/utils/age';
import Modal from '@/components/ui/Modal';
import type { Trainer } from '@/types';

const fmtVnd = (n?: number) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(n)) : null;

interface Props {
  open: boolean;
  onClose: () => void;
  // Fired when the owner clicks "Sign Contract" on a trainer's detail view.
  onSign: (trainer: Trainer) => void;
}

function TrainerAvatar({ trainer, size }: { trainer: Trainer; size: number }) {
  const initial = (trainer.name ?? trainer.fullName ?? 'T').charAt(0).toUpperCase();
  return trainer.avatarUrl ? (
    <img src={trainer.avatarUrl} alt="" className="shrink-0 rounded-full object-cover" style={{ height: size, width: size }} />
  ) : (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif font-bold text-navy"
      style={{ height: size, width: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}

export default function TrainerBrowseModal({ open, onClose, onSign }: Props) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Trainer | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setLoading(true);
    getTrainerList()
      .then((list) => { setTrainers(list ?? []); setError(''); })
      .catch((e) => setError(getErrorMessage(e, 'Failed to load trainers.')))
      .finally(() => setLoading(false));
  }, [open]);

  const header = (
    <div className="flex items-center gap-2">
      {selected && (
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="shrink-0 p-1 text-ink-3 transition-colors hover:text-ink"
          aria-label="Back to trainers"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">Training Contract</p>
        <h3 className="font-serif text-base font-bold text-ink">
          {selected ? (selected.name ?? selected.fullName ?? 'Trainer') : 'Choose a Trainer'}
        </h3>
      </div>
    </div>
  );

  const footer = selected ? (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => onSign(selected)}
        className="inline-flex items-center gap-1.5 bg-navy px-4 py-2 text-sm font-semibold text-on-blue transition-colors hover:bg-navy-hi"
      >
        <FileSignature size={15} /> Sign Contract
      </button>
    </div>
  ) : undefined;

  return (
    <Modal open={open} onClose={onClose} title={header} backdrop="navy" size="xl" footer={footer}>
      {loading ? (
        <p className="py-10 text-center text-sm text-ink-3">Loading trainers…</p>
      ) : error ? (
        <p className="py-10 text-center text-sm text-fail">{error}</p>
      ) : selected ? (
        /* ── Trainer detail ─────────────────────────── */
        <div>
          {/* Identity */}
          <div className="flex items-center gap-4">
            <TrainerAvatar trainer={selected} size={64} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-serif text-xl font-bold text-ink">{selected.name ?? selected.fullName ?? 'Trainer'}</h4>
                {selected.status && (
                  <span className="inline-flex items-center rounded-full bg-ok-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ok">
                    {selected.status}
                  </span>
                )}
              </div>
              {selected.specialization && (
                <p className="mt-0.5 text-xs text-ink-4">{selected.specialization}</p>
              )}
            </div>
          </div>

          {/* Stat tiles */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-rim border border-rim">
            <div className="px-3 py-3">
              <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-4"><Award size={11} className="text-gold" /> Experience</p>
              <p className="tnum mt-1 text-sm font-bold text-ink">{selected.experienceYears ?? 0} <span className="text-xs font-normal text-ink-4">yrs</span></p>
            </div>
            <div className="px-3 py-3">
              <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-4"><Cake size={11} className="text-ink-4" /> Age</p>
              <p className="tnum mt-1 text-sm font-bold text-ink">{calculateAge(selected.dateOfBirth) ?? '—'}</p>
            </div>
            <div className="bg-gold/5 px-3 py-3">
              <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-4"><Wallet size={11} className="text-gold" /> Monthly Fee</p>
              <p className="mt-1 text-sm font-bold text-gold-hi">
                {fmtVnd(selected.monthlyFee) ?? <span className="text-xs font-normal text-ink-4">Not set</span>}
              </p>
            </div>
          </div>

          {/* About */}
          <div className="mt-4 border border-rim bg-surface-overlay/30 px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">About</p>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-2">
              {selected.description?.trim() || 'This trainer has not added a description yet.'}
            </p>
          </div>
        </div>
      ) : trainers.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-3">No trainers available right now.</p>
      ) : (
        /* ── Trainer cards ──────────────────────────── */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {trainers.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t)}
              className="flex items-start gap-3 border border-rim bg-surface-raised p-4 text-left transition-colors hover:border-gold/40 hover:bg-surface-overlay/40"
            >
              <TrainerAvatar trainer={t} size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-sm font-bold text-ink">{t.name ?? t.fullName ?? `Trainer #${t.id}`}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-ink-4">
                  <span className="flex items-center gap-1"><Award size={11} className="text-gold" /> {t.experienceYears ?? 0} yr exp</span>
                  {fmtVnd(t.monthlyFee) && (
                    <span className="tnum font-semibold text-gold-hi">{fmtVnd(t.monthlyFee)}/mo</span>
                  )}
                </p>
                {t.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-ink-3">{t.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
