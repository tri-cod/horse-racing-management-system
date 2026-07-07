import { Calendar, MapPin, Ruler, Trophy } from 'lucide-react';
import type { Race } from '@/types';

function formatDate(iso?: string) {
 if (!iso) return '—';
 return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatPrize(amount?: number) {
 if (!amount) return '—';
 return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

export default function RaceMetaStrip({ race }: { race: Race }) {
 const items = [
 { icon: Calendar, label: 'Start Time', value: formatDate(race.startTime) },
 { icon: MapPin, label: 'Location', value: race.location ?? '—' },
 { icon: Ruler, label: 'Distance', value: race.distance?.toString() ?? '—' },
 { icon: Trophy, label: 'Prize Pool', value: formatPrize(race.totalprizepool) },
 ];

 return (
 <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
 {items.map(({ icon: Icon, label, value }) => (
 <div key={label} className="flex items-center gap-3 border border-rim bg-surface-raised p-4">
 <Icon size={20} className="shrink-0 text-gold" />
 <div>
 <div className="text-xs text-ink-4">{label}</div>
 <div className="text-sm font-medium text-ink">{value}</div>
 </div>
 </div>
 ))}
 </div>
 );
}
