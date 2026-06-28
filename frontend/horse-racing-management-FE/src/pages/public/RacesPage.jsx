import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { useRaces } from '../../hooks/queries/useRaces';
import { useHorsesByRace } from '../../hooks/queries/useHorsesByRace';
import { getRaceResults } from '../../api/refereeApi';
import RaceStatusBadge from '../../components/race/RaceStatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Seo from '../../components/seo/Seo';
import '../../assets/css/RacesPage.css';

const GATE_COLORS = ['#C8102E','#6C757D','#1A4DBE','#F5C400','#1E8E3E','#1A1A1A','#E8671A','#E91E8C','#56C5D0','#7B2D8B'];

const STANDINGS_TABS = ['HORSES', 'JOCKEYS', 'TRAINERS', 'OWNERS'];

/* ── Race block: entries only ────────────────────────── */
function RaceBlock({ race }) {
  const { entries: allEntries, loading: entriesLoading } = useHorsesByRace(race.id);
  const entriesWithOdds = allEntries.filter((e) => e.odds != null);

  return (
    <div className="rp__race-block">
      {race.bannerImageurl ? (
        <div className="rp__race-banner">
          <img src={race.bannerImageurl} alt={race.raceName} className="rp__race-banner-img" />
          <div className="rp__race-banner-overlay">
            <h2 className="rp__race-banner-title">{race.raceName}</h2>
          </div>
        </div>
      ) : (
        <div className="rp__race-name-header">{race.raceName}</div>
      )}

      <div className="rp__race-info-row">
        <div className="rp__race-info-cell">
          <span className="rp__race-info-label">DISTANCE:</span>
          <span className="rp__race-info-val">{race.distance || '—'}</span>
        </div>
        <div className="rp__race-info-cell">
          <span className="rp__race-info-label">SURFACE:</span>
          <span className="rp__race-info-val">{race.surfaceType || '—'}</span>
        </div>
      </div>

      <div className="rp__race-detail-row">
        <div className="rp__race-detail-left">
          {race.totalprizepool && <p><strong>Prize Pool:</strong> {formatPrize(race.totalprizepool)}</p>}
          {race.trackName && <p><strong>Track:</strong> {race.trackName}</p>}
          {race.location  && <p><strong>Location:</strong> {race.location}</p>}
        </div>
        <div className="rp__race-detail-right">
          {race.trackCondition && <p><strong>Condition:</strong> {race.trackCondition}</p>}
          {race.capacity       && <p><strong>Capacity:</strong> {race.capacity} horses</p>}
          <div className="rp__race-detail-actions">
            <RaceStatusBadge race={race} />
          </div>
        </div>
      </div>

      {entriesLoading ? (
        <div className="rp__entries-loading"><LoadingSpinner size="sm" /></div>
      ) : entriesWithOdds.length === 0 ? (
        <p className="rp__entries-empty">Odds not available yet.</p>
      ) : (
        <table className="rp__entries-table">
          <thead>
            <tr>
              <th className="rp__entries-th rp__entries-th--pg">PG</th>
              <th className="rp__entries-th rp__entries-th--pp">PP</th>
              <th className="rp__entries-th">HORSE / CONNECTIONS</th>
              <th className="rp__entries-th rp__entries-th--odds">M/L</th>
            </tr>
          </thead>
          <tbody>
            {entriesWithOdds.map((entry, idx) => {
              const color = GATE_COLORS[idx % GATE_COLORS.length];
              return (
                <tr key={entry.id} className="rp__entries-row">
                  <td className="rp__entries-td rp__entries-td--pg">
                    <span className="rp__gate-box" style={{ background: color }}>{idx + 1}</span>
                  </td>
                  <td className="rp__entries-td rp__entries-td--pp">
                    {entry.laneNumber ? String(entry.laneNumber).padStart(2, '0') : String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="rp__entries-td">
                    <span className="rp__entries-horse">{entry.horseName ?? '—'}</span>
                    <span className="rp__entries-connections">
                      {[
                        entry.jockeyName  && `JOCKEY: ${entry.jockeyName.toUpperCase()}`,
                        entry.trainerName && `TRAINER: ${entry.trainerName.toUpperCase()}`,
                        entry.ownerName   && `OWNER: ${entry.ownerName.toUpperCase()}`,
                      ].filter(Boolean).join(' · ')}
                    </span>
                  </td>
                  <td className="rp__entries-td rp__entries-td--odds">{entry.odds ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ── Standings section (standalone, below layout) ────── */
function StandingsSection({ races }) {
  const [selectedRaceId, setSelectedRaceId] = useState(races[0]?.id ?? null);
  const [standingsTab,   setStandingsTab]   = useState('HORSES');

  // Reset khi danh sách race thay đổi (chọn ngày khác)
  useEffect(() => {
    setSelectedRaceId(races[0]?.id ?? null);
  }, [races]);

  const selectedRace = races.find((r) => r.id === selectedRaceId) ?? races[0] ?? null;
  const isFinished   = selectedRace?.status === 'FINISHED';

  const { entries: allEntries } = useHorsesByRace(selectedRace?.id ?? null);
  const [results, setResults]   = useState([]);

  useEffect(() => {
    setResults([]);
    if (!isFinished || !selectedRace?.id) return;
    getRaceResults(selectedRace.id)
      .then((data) => setResults([...(data ?? [])].sort((a, b) => a.rank - b.rank)))
      .catch(() => {});
  }, [selectedRace?.id, isFinished]);

  const resultMap = useMemo(() => {
    const m = new Map();
    results.forEach((r) => {
      const name = r?.raceHorse?.horse?.horseName;
      if (name) m.set(name, r);
    });
    return m;
  }, [results]);

  const rows = useMemo(() => {
    return allEntries.map((e) => {
      const r    = resultMap.get(e.horseName);
      const name = standingsTab === 'HORSES'   ? e.horseName
                 : standingsTab === 'JOCKEYS'  ? (e.jockeyName  ?? '—')
                 : standingsTab === 'TRAINERS' ? (e.trainerName ?? '—')
                 :                               (e.ownerName   ?? '—');
      const sub  = standingsTab === 'HORSES'
        ? [e.jockeyName && `Jockey: ${e.jockeyName}`, e.trainerName && `Trainer: ${e.trainerName}`].filter(Boolean).join(' · ')
        : e.horseName;
      return {
        key: e.id, name, sub,
        pp:      e.laneNumber,
        odds:    e.odds,
        rank:    r?.rank           ?? null,
        rewards: r?.rewards        ?? null,
        time:    r?.completiontime ?? null,
      };
    }).sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  }, [allEntries, standingsTab, resultMap]);

  if (!selectedRace || allEntries.length === 0) return null;

  return (
    <section className="rp__std-section">
      <div className="rp__std-section-inner">

        {/* Header */}
        <div className="rp__std-section-header">
          <span className="rp__std-section-title">LEADER STANDINGS</span>
          {races.length > 1 && (
            <div className="rp__std-race-selector">
              {races.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`rp__std-race-btn${r.id === selectedRaceId ? ' rp__std-race-btn--active' : ''}`}
                  onClick={() => setSelectedRaceId(r.id)}
                >
                  {r.raceName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="rp__std-tabs">
          {STANDINGS_TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={`rp__std-tab${standingsTab === t ? ' rp__std-tab--active' : ''}`}
              onClick={() => setStandingsTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rp__standings-table-wrap">
          <table className="rp__standings-table">
            <thead>
              <tr>
                <th className="rp__std-th">NAME</th>
                <th className="rp__std-th rp__std-th--num">PP</th>
                {standingsTab === 'HORSES' && <th className="rp__std-th rp__std-th--num">M/L</th>}
                {isFinished && <th className="rp__std-th rp__std-th--num">RANK</th>}
                {isFinished && <th className="rp__std-th rp__std-th--num">TIME</th>}
                {isFinished && <th className="rp__std-th rp__std-th--num">EARNINGS</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="rp__std-row">
                  <td className="rp__std-td">
                    <span className="rp__std-name">{row.name}</span>
                    {row.sub && <span className="rp__std-sub">{row.sub}</span>}
                  </td>
                  <td className="rp__std-td rp__std-td--num">
                    {row.pp ? String(row.pp).padStart(2, '0') : '—'}
                  </td>
                  {standingsTab === 'HORSES' && (
                    <td className="rp__std-td rp__std-td--num">{row.odds ?? '—'}</td>
                  )}
                  {isFinished && (
                    <td className="rp__std-td rp__std-td--num">
                      {row.rank ? (
                        <span className={`rp__std-rank${
                          row.rank === 1 ? ' rp__std-rank--gold'
                        : row.rank === 2 ? ' rp__std-rank--silver'
                        : row.rank === 3 ? ' rp__std-rank--bronze' : ''}`}>
                          {row.rank}
                        </span>
                      ) : '—'}
                    </td>
                  )}
                  {isFinished && (
                    <td className="rp__std-td rp__std-td--num rp__std-time">
                      {row.time ? formatTime(row.time) : '—'}
                    </td>
                  )}
                  {isFinished && (
                    <td className="rp__std-td rp__std-td--num rp__std-earnings">
                      {row.rewards > 0 ? formatPrize(row.rewards) : '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/* ── Race day group ───────────────────────────────────── */
function RaceDayGroup({ dateKey, races }) {
  return (
    <div className="rp__group">
      <div className="rp__date-header">
        {dateKey === 'TBD' ? 'DATE TBD' : new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
      </div>
      {races.map((race) => <RaceBlock key={race.id} race={race} />)}
    </div>
  );
}

function toDateStr(d) { return d.toISOString().slice(0, 10); }

function formatGroupDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).toUpperCase();
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatPrize(amount) {
  if (!amount) return null;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

/* ── Monthly calendar ─────────────────────────────────── */
function MonthCalendar({ races, selectedDay, onSelectDay }) {
  const [viewDate, setViewDate] = useState(new Date());

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const raceDays = useMemo(() => {
    const set = new Set();
    races.forEach((r) => { if (r.startTime) set.add(new Date(r.startTime).toISOString().slice(0, 10)); });
    return set;
  }, [races]);

  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr   = toDateStr(new Date());

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();

  function handleDay(d) {
    const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onSelectDay(selectedDay === ds ? null : ds);
  }

  return (
    <div className="rp-calendar">
      <div className="rp-calendar__nav">
        <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))}><ChevronLeft size={14} /></button>
        <span className="rp-calendar__month">{monthLabel}</span>
        <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))}><ChevronRight size={14} /></button>
      </div>
      <div className="rp-calendar__grid">
        {DAY_LABELS.map((l, i) => <span key={i} className="rp-calendar__day-label">{l}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={`e-${i}`} />;
          const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const hasRace  = raceDays.has(ds);
          const isToday  = ds === todayStr;
          const isSel    = ds === selectedDay;
          return (
            <button
              key={ds}
              type="button"
              className={[
                'rp-calendar__day',
                hasRace  && 'rp-calendar__day--has-race',
                isToday  && 'rp-calendar__day--today',
                isSel    && 'rp-calendar__day--selected',
              ].filter(Boolean).join(' ')}
              onClick={() => handleDay(d)}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────── */
export default function RacesPage() {
  const [searchParams] = useSearchParams();
  const [activeTab,    setActiveTab]   = useState('');
  const [selectedDay,  setSelectedDay] = useState(() => searchParams.get('date') ?? toDateStr(new Date()));

  // Sync selectedDay khi navigate từ dropdown header với ?date=
  useEffect(() => {
    const d = searchParams.get('date');
    if (d) setSelectedDay(d);
  }, [searchParams]);

  const { races, loading, error, refetch } = useRaces({ page: 0, size: 200 });

  const filtered = useMemo(() => {
    let list = [...races];
    if (activeTab) list = list.filter((r) => r.status === activeTab);
    if (selectedDay) list = list.filter((r) => r.startTime && new Date(r.startTime).toISOString().slice(0, 10) === selectedDay);
    return list.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [races, activeTab, selectedDay]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const key = r.startTime ? new Date(r.startTime).toISOString().slice(0, 10) : 'TBD';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return map;
  }, [filtered]);

  const totalRaces   = races.length;
  const upcomingCount = races.filter((r) => ['UPCOMING', 'OPEN_REGISTRATION', 'CLOSED_REGISTRATION', 'ONGOING'].includes(r.status)).length;

  return (
    <div className="rp">
      <Seo title="Race Schedule — Royal Derby" description="Browse upcoming and past horse races on Royal Derby." />

      <div className="rp__layout">

        {/* ── LEFT: race list ─────────────────────────── */}
        <main className="rp__main">

          {error && (
            <div className="rp__error">
              <span>{error}</span>
              <button type="button" onClick={refetch}>Try again</button>
            </div>
          )}

          {loading ? (
            <LoadingSpinner size="lg" />
          ) : grouped.size === 0 ? (
            <EmptyState icon={Flag} title="No races found" subtitle="Try a different filter or date." />
          ) : (
            <div className="rp__list">
              {[...grouped.entries()].map(([dateKey, dayRaces]) => (
                <RaceDayGroup key={dateKey} dateKey={dateKey} races={dayRaces} />
              ))}
            </div>
          )}
        </main>

        {/* ── RIGHT: sidebar ──────────────────────────── */}
        <aside className="rp__sidebar">
          <div className="rp__sidebar-panel">

            {/* Info card */}
            <div className="rp__info-card__header">
              <Flag size={16} />
              <div>
                <p className="rp__info-card__eyebrow">Racing Information for</p>
                <p className="rp__info-card__name">Royal Derby</p>
              </div>
            </div>
            <div className="rp__info-card__stats">
              <div className="rp__info-card__stat">
                <span className="rp__info-card__stat-label">Total Races</span>
                <span className="rp__info-card__stat-val">{totalRaces}</span>
              </div>
              <div className="rp__info-card__stat">
                <span className="rp__info-card__stat-label">Upcoming</span>
                <span className="rp__info-card__stat-val">{upcomingCount}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="rp__panel-divider" />

            {/* Calendar */}
            <MonthCalendar races={races} selectedDay={selectedDay} onSelectDay={setSelectedDay} />

            {/* Divider */}
            <div className="rp__panel-divider" />

            {/* CTA buttons */}
            <div className="rp__cta-group">
              <Link to="/results" className="rp__cta-btn">View Results</Link>
              <Link to="/races"   className="rp__cta-btn rp__cta-btn--accent">Bet Now</Link>
            </div>

          </div>
        </aside>
      </div>

      {/* ── Standings section: chỉ hiện với races đã kết thúc ── */}
      {filtered.some((r) => r.status === 'FINISHED') && (
        <StandingsSection races={filtered.filter((r) => r.status === 'FINISHED')} />
      )}
    </div>
  );
}
