import { useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flag, Plus } from 'lucide-react';
import RacesPanel from '@/components/features/admin/RacesPanel';
import CreateRacePanel from '@/components/features/admin/CreateRacePanel';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';

type Tab = 'races' | 'create';

const TABS: { value: Tab; label: string; icon: typeof Flag; subtitle: string }[] = [
  { value: 'races', label: 'Races', icon: Flag, subtitle: 'Browse and manage every race on the calendar' },
  { value: 'create', label: 'Create Race', icon: Plus, subtitle: 'Set up a new race for the upcoming season' },
];

/* ── Toggle switch — sliding pill measures each button's real width/position
 * instead of assuming equal slots, since "Races" and "Create Race" differ in length. */
function TabSwitch({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const btnRefs = useRef<Partial<Record<Tab, HTMLButtonElement>>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = btnRefs.current[tab];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [tab]);

  return (
    <div className="relative inline-flex items-center border border-rim bg-surface-overlay p-1">
      <div
        className="absolute inset-y-1 bg-navy transition-all duration-200 ease-out"
        style={{ left: indicator.left, width: indicator.width }}
      />
      {TABS.map((t) => (
        <button
          key={t.value}
          ref={(el) => { if (el) btnRefs.current[t.value] = el; }}
          type="button"
          onClick={() => onChange(t.value)}
          className={`relative z-10 flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
            tab === t.value ? 'text-on-blue' : 'text-ink-3 hover:text-ink'
          }`}
        >
          <t.icon size={13} /> {t.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminRaceListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab');
  const tab: Tab = TABS.some((t) => t.value === requested) ? (requested as Tab) : 'races';
  const active = TABS.find((t) => t.value === tab)!;

  const setTab = (t: Tab) => {
    setSearchParams(t === 'races' ? {} : { tab: t }, { replace: true });
  };

  return (
    <div className="px-8 py-6">
      <Seo title="Manage Races" />
      <DashboardPageHeader
        eyebrow="Admin"
        title="Manage Races"
        subtitle={active.subtitle}
        action={<TabSwitch tab={tab} onChange={setTab} />}
      />

      {tab === 'races' && <RacesPanel />}
      {tab === 'create' && <CreateRacePanel />}
    </div>
  );
}
