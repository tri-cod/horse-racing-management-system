import '../../assets/css/race/RaceFilterTabs.css';

const TABS = [
  { value: '', label: 'All' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function RaceFilterTabs({ active, onChange }) {
  return (
    <div className="race-filter-tabs" role="tablist">
      {TABS.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={active === t.value}
          className={`race-filter-tabs__tab${active === t.value ? ' race-filter-tabs__tab--active' : ''}`}
          onClick={() => onChange(t.value)}
          type="button"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
