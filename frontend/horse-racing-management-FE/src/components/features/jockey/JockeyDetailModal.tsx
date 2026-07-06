import { useEffect } from 'react';
import { X, User, Calendar, Award, Star } from 'lucide-react';
import type { Jockey } from '@/types';

interface JockeyDetailModalProps {
 jockey: Jockey | null;
 onClose: () => void;
}

export default function JockeyDetailModal({ jockey, onClose }: JockeyDetailModalProps) {
 useEffect(() => {
 if (!jockey) return;
 const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
 window.addEventListener('keydown', handleKey);
 return () => window.removeEventListener('keydown', handleKey);
 }, [jockey, onClose]);

 if (!jockey) return null;

 const rows = [
 { icon: User, label: 'Jockey ID', value:`#${jockey.id}` },
 { icon: Calendar, label: 'Age', value: jockey.age ?`${jockey.age} yrs old` : '—' },
 { icon: Award, label: 'Experience', value: jockey.experienceYear ?`${jockey.experienceYear} years` : '—' },
 { icon: Star, label: 'Status', value: 'Active' },
 ];

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
 onClick={onClose}>
 <div className="relative w-full max-w-sm border border-rim bg-surface-raised shadow-2xl"
 onClick={(e) => e.stopPropagation()}>
 <div className="flex flex-col items-center gap-3 border-b border-rim px-6 pt-6 pb-4">
 <button type="button" onClick={onClose} aria-label="Close"
 className="absolute right-4 top-4 p-1 text-ink-4 hover:text-ink hover:bg-surface-overlay transition-colors">
 <X size={18} />
 </button>
 <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-overlay text-ink-3">
 <User size={36} />
 </div>
 <h2 className="text-lg font-semibold text-ink">{jockey.name}</h2>
 </div>
 <div className="flex flex-col divide-y divide-rim px-6 py-2">
 {rows.map(({ icon: Icon, label, value }) => (
 <div key={label} className="flex items-center justify-between gap-4 py-3">
 <div className="flex items-center gap-2">
 <Icon size={16} className="text-ink-4" />
 <span className="text-sm text-ink-3">{label}</span>
 </div>
 <span className="text-sm font-medium text-ink">{value}</span>
 </div>
 ))}
 </div>
 <div className="border-t border-rim px-6 py-4">
 <p className="text-xs text-ink-4">More details (bio, achievements) will be added once the backend supports them.</p>
 </div>
 </div>
 </div>
 );
}
