interface TabDef {
  value: string;              // key định danh tab (dùng cho active state + ?tab=)
  label: string;
  statuses: string[];         // rỗng = All (không lọc)
}

const TABS: TabDef[] = [
  { value: '', label: 'All', statuses: [] },
  { value: 'UPCOMING', label: 'Upcoming', statuses: ['UPCOMING', 'OPEN_REGISTRATION', 'CLOSED_REGISTRATION', 'SETTING_ODDS', 'OPEN_BETTING'] },
  { value: 'ONGOING', label: 'Ongoing', statuses: ['ONGOING'] },
  { value: 'FINISHED', label: 'Finished', statuses: ['FINISHED'] },
  { value: 'CANCELLED', label: 'Cancelled', statuses: ['CANCELLED'] },
];

// Map từ tab value → danh sách status mà tab đó bao phủ. RacesPanel dùng để lọc.
export const STATUSES_FOR_TAB: Record<string, string[]> = Object.fromEntries(
  TABS.map((t) => [t.value, t.statuses]),
);

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