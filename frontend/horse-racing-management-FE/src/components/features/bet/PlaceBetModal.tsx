import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Trophy, TrendingUp } from 'lucide-react';
import { placeBet } from '@/api/betApi';
import { assignLanes } from '@/utils/laneUtils';
import { getErrorMessage } from '@/utils/errors';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import type { Race, RaceHorse } from '@/types';

const fmt = (n?: number) =>
 n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : '—';

const QUICK = [50_000, 100_000, 200_000, 500_000];

interface BetItem { raceHorseId: string; betAmount: string }

interface PlaceBetModalProps {
 open: boolean;
 onClose: () => void;
 race: Race;
 raceHorses?: RaceHorse[];
 onSuccess?: (result: unknown) => void;
}

export default function PlaceBetModal({ open, onClose, race, raceHorses = [], onSuccess }: PlaceBetModalProps) {
 const horsesWithLanes = assignLanes(raceHorses as Parameters<typeof assignLanes>[0]);
 const [items, setItems] = useState<BetItem[]>([{ raceHorseId: '', betAmount: '' }]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => { if (open) { setItems([{ raceHorseId: '', betAmount: '' }]); setError(''); } }, [open]);

 const total = items.reduce((s, it) => s + (parseInt(it.betAmount, 10) || 0), 0);
 const addItem = () => setItems((p) => [...p, { raceHorseId: '', betAmount: '' }]);
 const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
 const update = (i: number, field: keyof BetItem, val: string) =>
 setItems((p) => p.map((it, idx) => idx === i ? { ...it, [field]: val } : it));
 const quickSet = (i: number, amt: number) =>
 setItems((p) => p.map((it, idx) => idx === i ? { ...it, betAmount: String(amt) } : it));

 const validate = () => {
 for (const it of items) {
 if (!it.raceHorseId) return 'Please select a horse for every entry.';
 const amt = parseInt(it.betAmount, 10);
 if (isNaN(amt) || amt < 1000) return 'Minimum bet amount is 1,000 ₫.';
 }
 const ids = items.map((it) => it.raceHorseId);
 if (new Set(ids).size !== ids.length) return 'Each horse can only be selected once.';
 return null;
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 const err = validate();
 if (err) { setError(err); return; }
 try {
 setLoading(true); setError('');
 const result = await placeBet({ raceId: race.id, betItems: items.map((it) => ({ raceHorseId: parseInt(it.raceHorseId, 10), betAmount: parseInt(it.betAmount, 10) })) });
 onSuccess?.(result);
 onClose();
 } catch (e: unknown) {
 setError(getErrorMessage(e, 'Failed to place bet. Please try again.'));
 } finally { setLoading(false); }
 };

 const header = (
 <div>
 <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Place a Bet</p>
 <h3 className="font-serif text-lg font-bold text-ink">{race.raceName}</h3>
 </div>
 );

 const footer = (
 <div className="space-y-3">
 <div className="flex items-center justify-between text-sm">
 <span className="text-ink-3">Horses selected</span><span className="font-semibold text-ink">{items.length}</span>
 </div>
 <div className="flex items-center justify-between text-sm">
 <span className="text-ink-3">Total Bet Amount</span><span className="tnum font-serif text-lg font-bold text-navy">{fmt(total)}</span>
 </div>
 <div className="flex gap-3">
 <Button type="button" variant="ghost" size="md" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
 <Button type="submit" variant="primary" size="md" className="flex-1" disabled={loading || total < 1000}>
 {loading ? 'Processing...' : 'Confirm Bet'}
 </Button>
 </div>
 </div>
 );

 return (
 <form onSubmit={handleSubmit}>
 <Modal open={open} onClose={onClose} title={header} size="lg" rounded bodyClassName="px-6 py-5 space-y-4" footer={footer}>
 <div className="flex items-center justify-between text-xs text-ink-3">
 <span className="flex items-center gap-1.5"><Trophy size={14} className="text-gold" />{race.location ?? 'Racetrack'}</span>
 <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-navy" />Total: <strong className="tnum text-ink">{fmt(total)}</strong></span>
 </div>

 {items.map((item, idx) => {
 const usedIds = items.map((it, i) => i !== idx ? it.raceHorseId : null).filter(Boolean);
 return (
 <div key={idx} className="rounded-md border border-rim bg-surface p-4 space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-bold uppercase tracking-wider text-ink-4">Entry #{idx + 1}</span>
 {items.length > 1 && (
 <button type="button" onClick={() => removeItem(idx)} className="text-ink-4 hover:text-fail transition-colors">
 <Trash2 size={14} />
 </button>
 )}
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-medium text-ink-3">Horse</label>
 <select
 className="w-full rounded border border-rim bg-surface-input px-3 py-2.5 text-sm text-ink outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
 value={item.raceHorseId} onChange={(e) => update(idx, 'raceHorseId', e.target.value)} required>
 <option value="">— Select a horse —</option>
 {(horsesWithLanes as (RaceHorse & { laneNumber?: number; registerAt?: string })[])
 .filter((rh) => !usedIds.includes(String(rh.id)))
 .map((rh) => (
 <option key={rh.id} value={rh.id}>
 #{rh.laneNumber} · {rh.horseName}{rh.jockeyName ? ` — ${rh.jockeyName}` : ''}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-medium text-ink-3">Bet Amount (VND)</label>
 <div className="relative">
 <input type="number"
 className="w-full appearance-none rounded border border-rim bg-surface-input px-3 py-2.5 pr-9 text-sm font-semibold text-ink outline-none transition [appearance:textfield] focus:border-navy focus:ring-2 focus:ring-navy/10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
 placeholder="100,000" min="1000" step="1000" value={item.betAmount}
 onChange={(e) => update(idx, 'betAmount', e.target.value)} required />
 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-4">₫</span>
 </div>
 <div className="mt-2 grid grid-cols-4 gap-1.5">
 {QUICK.map((amt) => (
 <button key={amt} type="button" onClick={() => quickSet(idx, amt)}
 className={`rounded border px-1.5 py-1.5 text-[11px] font-semibold transition-colors ${
 item.betAmount === String(amt) ? 'border-navy bg-navy text-on-blue' : 'border-rim text-ink-2 hover:border-navy hover:text-navy'
 }`}>
 {fmt(amt).replace('₫', '').trim()}
 </button>
 ))}
 </div>
 </div>
 </div>
 );
 })}

 {(horsesWithLanes as RaceHorse[]).length > items.length && (
 <button type="button" onClick={addItem}
 className="flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-rim-hi py-2.5 text-xs font-semibold text-ink-3 transition-colors hover:border-navy hover:text-navy">
 <Plus size={14} /> Add another horse
 </button>
 )}

 {error && (
 <div className="flex items-center gap-2 rounded bg-fail-subtle px-3 py-2.5 text-xs text-fail">
 <AlertCircle size={14} className="shrink-0" />{error}
 </div>
 )}
 </Modal>
 </form>
 );
}
