import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { useRaces } from '../../hooks/queries/useRaces';
import RaceCard from '../../components/race/RaceCard';
import RaceFilterTabs from '../../components/race/RaceFilterTabs';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import DashboardPageHeader from '../../components/shared/DashboardPageHeader';
import Seo from '../../components/seo/Seo';
import '../../assets/css/AdminRaceListPage.css';
import '../../assets/css/shared/workspace.css';

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

export default function AdminRaceListPage() {
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
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    }), [monday]);

  const filtered = useMemo(() => {
    let list = [...races];
    if (selectedDay) {
      list = list.filter((r) => r.startTime && new Date(r.startTime).toISOString().slice(0, 10) === selectedDay);
    } else {
      const weekStart = toDateStr(weekDays[0]);
      const weekEnd   = toDateStr(weekDays[6]);
      list = list.filter((r) => {
        if (!r.startTime) return false;
        const d = new Date(r.startTime).toISOString().slice(0, 10);
        return d >= weekStart && d <= weekEnd;
      });
    }
    if (activeTab) list = list.filter((r) => r.status === activeTab);
    return list;
  }, [races, selectedDay, weekDays, activeTab]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const todayStr   = toDateStr(new Date());

  const handleDayClick = (dateStr) => {
    setSelectedDay((prev) => (prev === dateStr ? null : dateStr));
    setPage(0);
  };

  const handleWeekChange = (dir) => {
    setWeekOffset((prev) => prev + dir);
    setSelectedDay(null);
    setPage(0);
  };

  return (
    <div className="ws-page">
      <Seo title="Manage Races" description="View and manage all horse races." />
      <DashboardPageHeader eyebrow="Admin" title="Manage Races" subtitle="Edit or delete existing races" />

      <div className="ws-body">
        {/* Week navigator */}
        <div className="races-week">
          <div className="races-week__nav">
            <button type="button" className="races-week__arrow" onClick={() => handleWeekChange(-1)}>
              <ChevronLeft size={18} />
            </button>
            <span className="races-week__label tnum">{formatWeekLabel(monday)}</span>
            <button type="button" className="races-week__arrow" onClick={() => handleWeekChange(1)}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="races-week__days">
            {weekDays.map((d, i) => {
              const dateStr = toDateStr(d);
              const isToday = dateStr === todayStr;
              const isSel   = selectedDay === dateStr;
              return (
                <button key={dateStr} type="button"
                  className={['races-week__day', isSel && 'races-week__day--selected', isToday && 'races-week__day--today'].filter(Boolean).join(' ')}
                  onClick={() => handleDayClick(dateStr)}>
                  <span className="races-week__day-name">{DAY_NAMES[i]}</span>
                  <span className="races-week__day-num tnum">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="admin-race-list__toolbar">
          <RaceFilterTabs active={activeTab} onChange={(v) => { setActiveTab(v); setPage(0); }} />
        </div>

        {error && <div className="ws-error"><span>{error}</span><button type="button" onClick={refetch}>Try again</button></div>}

        {loading ? <LoadingSpinner size="lg" /> : paginated.length === 0 ? (
          <EmptyState icon={Flag} title="No races" subtitle="Try another day or filter." />
        ) : (
          <div className="races-page__grid">
            {paginated.map((r) => <RaceCard key={r.id} race={r} isAdmin={true} onRefetch={refetch} />)}
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
