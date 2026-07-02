const TABS = [
 { value: '', label: 'All' },
 { value: 'UPCOMING', label: 'Upcoming' },
 { value: 'ONGOING', label: 'Ongoing' },
 { value: 'FINISHED', label: 'Finished' },
 { value: 'CANCELLED', label: 'Cancelled' },
];

interface RaceFilterTabsProps {
 active: string;
 onChange: (value: string) => void;
}

export default function RaceFilterTabs({ active, onChange }: RaceFilterTabsProps) {
 return (
 <div className="flex gap-1 overflow-x-auto border border-rim bg-surface-raised p-1" role="tablist">
 {TABS.map((t) => (
 <button
 key={t.value}
 role="tab"
 aria-selected={active === t.value}
 type="button"
 className={`shrink-0 px-3 py-1.5 text-sm font-medium transition-colors ${active === t.value ? 'bg-gold text-on-gold' : 'text-ink-3 hover:text-ink hover:bg-surface-overlay'}`}
 onClick={() => onChange(t.value)}
 >
 {t.label}
 </button>
 ))}
 </div>
 );
}
