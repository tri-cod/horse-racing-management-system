import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { useRaces } from '../hooks/useRaces';
import RaceCard from '../components/race/RaceCard';
import RaceFilterTabs from '../components/race/RaceFilterTabs';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/rd/PageHeader';
import Seo from '../components/seo/Seo';
import '../assets/css/RacesPage.css';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PAGE_SIZE = 9;

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function toDateStr(date) { return date.toISOString().slice(0, 10); }
function formatWeekLabel(monday) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
}

export default function RacesPage() {
  const [weekOffset, setWeekOffset]   = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeTab, setActiveTab]     = useState('');
  const [page, setPage]               = useState(0);

  const { races, loading, error, refetch } = useRaces({ page: 0, size: 100 });

  const monday = useMemo(() => {
    const m = getMonday(new Date());
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
  }, [weekOffset]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; }),
    [monday]);

  const racesPerDay = useMemo(() => {
    const map = {};
    races.forEach((r) => { if (r.startTime) { const k = new Date(r.startTime).toISOString().slice(0,10); map[k]=(map[k]||0)+1; } });
    return map;
  }, [races]);

  const filtered = useMemo(() => {
    let list = [...races];
    if (selectedDay) {
      list = list.filter((r) => r.startTime && new Date(r.startTime).toISOString().slice(0,10) === selectedDay);
    } else {
      const ws = toDateStr(weekDays[0]), we = toDateStr(weekDays[6]);
      list = list.filter((r) => { if (!r.startTime) return false; const d = new Date(r.startTime).toISOString().slice(0,10); return d>=ws && d<=we; });
    }
    if (activeTab) list = list.filter((r) => r.status === activeTab);
    return list;
  }, [races, selectedDay, weekDays, activeTab]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice(page * PAGE_SIZE, (page+1) * PAGE_SIZE);
  const todayStr   = toDateStr(new Date());

  const handleDayClick  = (ds) => { setSelectedDay((p) => p === ds ? null : ds); setPage(0); };
  const handleWeekChange = (dir) => { setWeekOffset((p) => p + dir); setSelectedDay(null); setPage(0); };
  const handleTabChange  = (v)   => { setActiveTab(v); setPage(0); };

  return (
    <div className="races-page">
      <Seo title="Race Schedule" description="Browse upcoming and past horse races on Royal Derby." />
      <PageHeader eyebrow="Royal Derby" title="Race Schedule" subtitle="Follow every race from qualification to the final lap" />

      <div className="races-page__content">
        {/* Week navigator */}
        <div className="races-week">
          <div className="races-week__nav">
            <button type="button" className="races-week__arrow" onClick={() => handleWeekChange(-1)}><ChevronLeft size={18} /></button>
            <span className="races-week__label tnum">{formatWeekLabel(monday)}</span>
            <button type="button" className="races-week__arrow" onClick={() => handleWeekChange(1)}><ChevronRight size={18} /></button>
          </div>
          <div className="races-week__days">
            {weekDays.map((d, i) => {
              const ds = toDateStr(d), isToday = ds === todayStr, isSel = selectedDay === ds, count = racesPerDay[ds] || 0;
              return (
                <button key={ds} type="button"
                  className={['races-week__day', isSel && 'races-week__day--selected', isToday && 'races-week__day--today'].filter(Boolean).join(' ')}
                  onClick={() => handleDayClick(ds)}>
                  <span className="races-week__day-name">{DAY_NAMES[i]}</span>
                  <span className="races-week__day-num tnum">{d.getDate()}</span>
                  {count > 0 && <span className="races-week__day-badge tnum">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="races-page__toolbar">
          <RaceFilterTabs active={activeTab} onChange={handleTabChange} />
        </div>

        {error && <div className="races-page__error"><span>{error}</span><button type="button" onClick={refetch}>Try again</button></div>}

        {loading ? <LoadingSpinner size="lg" /> : paginated.length === 0 ? (
          <EmptyState icon={Flag} title={selectedDay ? 'No races on this day' : 'No races this week'} subtitle="Try another day or adjust the status filter." />
        ) : (
          <div className="races-page__grid">
            {paginated.map((r) => <RaceCard key={r.id} race={r} isAdmin={false} />)}
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
