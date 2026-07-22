import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rabbit, FileText } from 'lucide-react';
import {
  getTrainerProfile, getTrainerHorses, getMyTrainerUpcomingRaces,
} from '@/api/trainerApi';
import { getMyContractsAsTrainer } from '@/api/trainingContractApi';
import { getErrorMessage } from '@/utils/errors';
import { isStatus } from '@/utils/trainingContractStatus';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import TrainerHorseDetailModal from '@/components/features/trainer/TrainerHorseDetailModal';
import type { TrainerHorse, TrainingContract, TrainerRaceParticipation } from '@/types';

const HORSE_STATUS_CLS: Record<string, string> = {
  ACTIVE: 'bg-ok-subtle text-ok border-ok/30',
  RACING: 'bg-ok-subtle text-ok border-ok/30',
  FINISHED: 'bg-gold/10 text-gold border-gold/30',
  INACTIVE: 'bg-surface-overlay text-ink-3 border-rim',
  RETIRED: 'bg-warn-subtle text-warn border-warn/30',
};
const HORSE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Available', RACING: 'Racing', FINISHED: 'Finished', INACTIVE: 'Resting', RETIRED: 'Retired',
};

const statusOf = (h: TrainerHorse) => (h.status ?? '').toUpperCase();

function TableSkeleton() {
  return (
    <div className="divide-y divide-rim border border-rim bg-surface-raised">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-overlay" />
          <div className="h-3.5 w-40 animate-pulse rounded-full bg-surface-overlay" />
        </div>
      ))}
    </div>
  );
}

export default function TrainerHorsesPage() {
  const [horses, setHorses] = useState<TrainerHorse[]>([]);
  const [contracts, setContracts] = useState<TrainingContract[]>([]);
  const [upcoming, setUpcoming] = useState<TrainerRaceParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('ALL');
  const [selected, setSelected] = useState<TrainerHorse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getTrainerProfile();
      const [h, c, up] = await Promise.all([
        getTrainerHorses(profile.id),
        getMyContractsAsTrainer(),
        getMyTrainerUpcomingRaces(),
      ]);
      setHorses(h ?? []); setContracts(c ?? []); setUpcoming(up ?? []);
      setError('');
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Unable to load your horses.'));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Tabs = All + the statuses actually present, in a sensible order.
  const tabs = useMemo(() => {
    const present = new Set(horses.map(statusOf).filter(Boolean));
    const order = ['ACTIVE', 'RACING', 'FINISHED', 'INACTIVE', 'RETIRED'];
    return ['ALL', ...order.filter((s) => present.has(s))];
  }, [horses]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { ALL: horses.length };
    horses.forEach((h) => { const s = statusOf(h); m[s] = (m[s] ?? 0) + 1; });
    return m;
  }, [horses]);

  const visible = useMemo(
    () => (tab === 'ALL' ? horses : horses.filter((h) => statusOf(h) === tab)),
    [horses, tab],
  );

  const contractFor = (horseId: number) =>
    contracts.find((c) => c.horseId === horseId && isStatus(c.status, 'ACTIVE')) ?? null;

  return (
    <div className="px-8 py-6">
      <Seo title="Managed Horses" description="Manage the horses under your training." />
      <DashboardPageHeader
        eyebrow="Trainer"
        title="Managed Horses"
        subtitle={horses.length > 0 ? `${horses.length} horse${horses.length !== 1 ? 's' : ''} in training` : 'Horses assigned to you'}
      />

      <TrainerHorseDetailModal
        horse={selected}
        upcoming={selected ? upcoming.filter((r) => r.horseId === selected.horseId) : []}
        onClose={() => setSelected(null)}
      />

      {error && (
        <div className="mb-5 flex items-center justify-between border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <button type="button" onClick={load} className="font-semibold underline hover:no-underline">Try again</button>
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : horses.length === 0 ? (
        <EmptyState
          icon={Rabbit}
          title="No horses yet"
          subtitle="Horses will appear here once you accept a training contract from a horse owner."
        />
      ) : (
        <div className="overflow-hidden border border-rim bg-surface-raised">
          {/* Tabs */}
          <div className="border-b border-rim px-5 pt-4">
            <div className="flex flex-wrap gap-1.5">
              {tabs.map((t) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${active ? 'border-gold text-ink' : 'border-transparent text-ink-3 hover:text-ink-2'}`}
                  >
                    {t === 'ALL' ? 'All' : HORSE_STATUS_LABEL[t] ?? t}
                    <span className={`tnum inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold ${active ? 'bg-gold/15 text-gold' : 'bg-surface-overlay text-ink-4'}`}>
                      {counts[t] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-rim bg-surface-overlay">
                  {['Horse', 'Owner', 'Age', 'Speed', 'Contract', 'Status', 'View'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rim">
                {visible.map((h) => {
                  const status = statusOf(h);
                  const hasContract = contractFor(h.horseId) != null;
                  return (
                    <tr key={h.horseId} className="transition-colors hover:bg-surface-overlay/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {h.avatarUrl ? (
                            <img src={h.avatarUrl} alt={h.horseName} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy"><Rabbit size={18} /></div>
                          )}
                          <div className="min-w-0">
                            <Link to={`/horses/${h.horseId}`} className="font-serif text-sm font-bold text-ink transition-colors hover:text-gold-hi">
                              {h.horseName ?? `Horse #${h.horseId}`}
                            </Link>
                            {h.breed && <p className="text-[11px] text-ink-4">{h.breed}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm">
                        {h.ownerId != null && h.ownerName ? (
                          <Link to={`/horse-owners/${h.ownerId}`} className="text-ink-2 transition-colors hover:text-gold-hi hover:underline">
                            {h.ownerName}
                          </Link>
                        ) : ''}
                      </td>
                      <td className="tnum px-5 py-3.5 text-sm text-ink-2">{h.age ?? ''}</td>
                      <td className="tnum px-5 py-3.5 text-sm text-ink-2">{h.speedRating ?? ''}</td>
                      <td className="px-5 py-3.5">
                        {hasContract
                          ? <span className="inline-flex items-center rounded-full bg-ok-subtle px-2 py-0.5 text-[10px] font-semibold text-ok">Under contract</span>
                          : ''}
                      </td>
                      <td className="px-5 py-3.5">
                        {status && <Badge className={HORSE_STATUS_CLS[status] ?? 'bg-surface-overlay text-ink-3 border-rim'}>{HORSE_STATUS_LABEL[status] ?? status}</Badge>}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => setSelected(h)}
                          className="inline-flex items-center gap-1 whitespace-nowrap border border-rim-hi px-2.5 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-gold/40 hover:bg-surface-overlay hover:text-gold-hi"
                        >
                          <FileText size={12} /> Details
                        </button>
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
