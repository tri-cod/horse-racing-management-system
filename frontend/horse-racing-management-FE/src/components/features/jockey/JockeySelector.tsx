import { useJockeys } from '@/hooks/useJockeys';

interface JockeySelectorProps {
 value?: number | null;
 onChange?: (id: number | null) => void;
 placeholder?: string;
 disabled?: boolean;
}

export default function JockeySelector({ value, onChange, placeholder, disabled }: JockeySelectorProps) {
 const { jockeys, loading, error } = useJockeys();

 return (
 <div className="flex flex-col gap-1">
 <select
 className="w-full border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
 value={value ?? ''}
 onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : null)}
 disabled={disabled || loading || !!error}
 >
 <option value="">{placeholder ?? 'Select a jockey'}</option>
 {jockeys.map((j) => (
 <option key={j.id} value={j.id}>
 {j.name} ({j.experienceYear} yrs exp.)
 </option>
 ))}
 </select>
 {loading && <p className="text-xs text-ink-4">Loading…</p>}
 {error && <p className="text-xs text-fail">{error}</p>}
 </div>
 );
}
