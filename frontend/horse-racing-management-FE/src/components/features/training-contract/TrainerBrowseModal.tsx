import { useEffect, useMemo, useState } from 'react';
import { Search, Target, FileSignature } from 'lucide-react';
import { getTrainerList } from '@/api/trainerApi';
import { getErrorMessage } from '@/utils/errors';
import { calculateAge } from '@/utils/age';
import Modal from '@/components/ui/Modal';
import type { Trainer } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  // Fired when the owner confirms a trainer to draw up a contract with.
  onSign: (trainer: Trainer) => void;
}

// Blank when there's no value (owner asked for empty, not a dash).
const fmtVnd = (n?: number) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(n)) : '';

function Avatar({ trainer, size }: { trainer: Trainer; size: number }) {
  const name = trainer.name ?? trainer.fullName ?? 'T';
  return trainer.avatarUrl ? (
    <img src={trainer.avatarUrl} alt="" className="shrink-0 rounded-full object-cover" style={{ height: size, width: size }} />
  ) : (
    <div className="flex shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif font-bold text-navy"
      style={{ height: size, width: size, fontSize: size * 0.4 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function TrainerBrowseModal({ open, onClose, onSign }: Props) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Trainer | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelected(null); setSearch('');
    setLoading(true);
    getTrainerList()
      .then((list) => { setTrainers(list ?? []); setError(''); })
      .catch((e) => setError(getErrorMessage(e, 'Failed to load trainers.')))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return trainers;
    return trainers.filter((t) =>
      (t.name ?? t.fullName ?? '').toLowerCase().includes(kw) ||
      (t.specialization ?? '').toLowerCase().includes(kw),
    );
  }, [trainers, search]);

  const header = (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold">Training Contract</p>
      <h3 className="font-serif text-lg font-bold text-ink">Choose a Trainer</h3>
    </div>
  );

  const footer = (
    <div className="flex justify-end">
      <button
        type="button"
        disabled={!selected}
        onClick={() => selected && onSign(selected)}
        className="inline-flex items-center gap-2 bg-navy px-6 py-3 text-sm font-semibold text-on-blue transition-colors hover:bg-navy-hi disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FileSignature size={16} /> Sign Contract
      </button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={header} backdrop="navy" size="4xl" bodyClassName="p-0" footer={footer}>
      <div className="flex h-[82vh]">
        {/* ── Left: selected trainer detail ─────────── */}
        <aside className="hidden w-96 shrink-0 flex-col border-r border-rim bg-surface-overlay/30 md:flex">
          {selected ? (
            <div className="flex flex-1 flex-col overflow-y-auto p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar trainer={selected} size={132} />
                <h4 className="mt-4 font-serif text-3xl font-bold text-ink">{selected.name ?? selected.fullName ?? 'Trainer'}</h4>
                {selected.status && (
                  <span className="mt-2.5 inline-flex items-center rounded-full bg-ok-subtle px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ok">
                    {selected.status}
                  </span>
                )}
              </div>

              <div className="mt-7 space-y-4">
                <div className="flex items-center justify-between border-b border-rim pb-4 text-lg">
                  <span className="text-ink-4">Experience</span>
                  <span className="font-semibold text-ink">{selected.experienceYears != null ? `${selected.experienceYears} yrs` : ''}</span>
                </div>
                <div className="flex items-center justify-between border-b border-rim pb-4 text-lg">
                  <span className="text-ink-4">Age</span>
                  <span className="font-semibold text-ink">{calculateAge(selected.dateOfBirth) ?? ''}</span>
                </div>
                <div className="flex items-center justify-between border-b border-rim pb-4 text-lg">
                  <span className="text-ink-4">Fee / mo</span>
                  <span className="tnum font-bold text-gold-hi">{fmtVnd(selected.monthlyFee)}</span>
                </div>
                <div className="flex items-start justify-between gap-3 text-lg">
                  <span className="shrink-0 text-ink-4">Specialization</span>
                  <span className="text-right font-medium text-ink">{selected.specialization?.trim() || ''}</span>
                </div>
              </div>

              {selected.description && (
                <div className="mt-7">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">About</p>
                  <p className="mt-2.5 text-base leading-relaxed text-ink-3">{selected.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <Target size={30} className="text-ink-4" />
              <p className="text-sm text-ink-3">Pick a trainer from the list to see their details.</p>
            </div>
          )}
        </aside>

        {/* ── Right: search + table ─────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-rim p-4">
            <div className="relative">
              <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4" />
              <input
                type="text"
                placeholder="Search by name or specialization…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-rim bg-surface-input py-3 pl-11 pr-3 text-lg text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="py-20 text-center text-sm text-ink-3">Loading trainers…</p>
            ) : error ? (
              <p className="py-20 text-center text-sm text-fail">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="py-20 text-center text-sm text-ink-3">No trainers found.</p>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-surface-overlay">
                  <tr className="border-b border-rim">
                    {['Trainer', 'Exp', 'Fee / mo', 'Specialization'].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-ink-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rim">
                  {filtered.map((t) => {
                    const active = selected?.id === t.id;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelected(t)}
                        className={`cursor-pointer transition-colors ${active ? 'bg-gold/10' : 'hover:bg-surface-overlay/50'}`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <Avatar trainer={t} size={50} />
                            <div className="min-w-0">
                              <p className="truncate font-serif text-lg font-bold text-ink">{t.name ?? t.fullName ?? `Trainer #${t.id}`}</p>
                              {t.status && <p className="text-xs uppercase tracking-wide text-ink-4">{t.status}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="tnum px-6 py-5 text-lg text-ink-2">{t.experienceYears != null ? `${t.experienceYears} yrs` : ''}</td>
                        <td className="tnum px-6 py-5 text-lg font-semibold text-gold-hi">{fmtVnd(t.monthlyFee)}</td>
                        <td className="px-6 py-5 text-lg text-ink-3">{t.specialization ?? ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
