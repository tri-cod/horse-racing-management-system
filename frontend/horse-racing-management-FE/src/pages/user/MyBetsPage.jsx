import { useState, useEffect, useCallback, useContext } from 'react';
import { Ticket, TrendingUp, DollarSign, CheckCircle, ChevronDown, ChevronUp, Calendar, Trophy, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyBets } from '../../api/betApi';
import { AuthContext } from '../../context/AuthContext';
import BetStatusBadge from '../../components/bet/BetStatusBadge';
import DashboardPageHeader from '../../components/shared/DashboardPageHeader';
import StatCard from '../../components/shared/StatCard';
import Seo from '../../components/seo/Seo';
import '../../assets/css/bet/MyBetsPage.css';
import '../../assets/css/shared/workspace.css';

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const RESULT_CLS = { WON: 'result-pill--won', LOST: 'result-pill--lost', PENDING: 'result-pill--pending', PENDING_FINISHED: 'result-pill--pending' };

function BetItemsDetail({ items = [] }) {
  if (!items.length) return <p className="bet-items-empty">No details available.</p>;
  return (
    <div className="bet-items-wrap">
      <table className="ws-table">
        <thead>
          <tr><th>Horse</th><th>Stake</th><th>Odds</th><th>Payout</th><th>Result</th></tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td className="bet-items-table__horse">{it.horseName ?? '—'}</td>
              <td className="tnum">{fmt(it.betAmount)}</td>
              <td className="tnum bet-items-table__odds">{it.odds != null ? `×${parseFloat(it.odds).toFixed(2)}` : '—'}</td>
              <td className="tnum">{it.payout != null ? <strong>{fmt(it.payout)}</strong> : '—'}</td>
              <td>
                <span className={`result-pill ${RESULT_CLS[it.resultStatus] ?? ''}`}>
                  {it.resultStatus ?? '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BetRow({ bet }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bet-row${open ? ' bet-row--open' : ''}`}>
      <button type="button" className="bet-row__trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <div className="bet-row__col bet-row__col--race">
          <span className="bet-row__race-name">{bet.raceName ?? `Race #${bet.raceId}`}</span>
          <span className="bet-row__date"><Calendar size={11} /><span className="tnum">{fmtDate(bet.createdAt)}</span></span>
        </div>
        <div className="bet-row__col bet-row__col--horses">
          <Target size={13} />
          <span>{bet.betItems?.length ?? 0} horse{(bet.betItems?.length ?? 0) !== 1 ? 's' : ''}</span>
        </div>
        <div className="bet-row__col bet-row__col--amount">
          <span className="bet-row__amount tnum">{fmt(bet.totalAmount)}</span>
          <span className="bet-row__amount-label">Total stake</span>
        </div>
        <div className="bet-row__col bet-row__col--status"><BetStatusBadge status={bet.status} /></div>
        <div className="bet-row__col bet-row__col--toggle">{open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</div>
      </button>
      {open && (
        <div className="bet-row__detail">
          <BetItemsDetail items={bet.betItems ?? []} />
          <div className="bet-row__detail-footer">
            <Link to={`/races/${bet.raceId}`} className="ui-btn ui-btn--outline ui-btn--sm">View race</Link>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'PENDING_FINISHED', label: 'Pending Result' },
  { key: 'WON', label: 'Won' },
  { key: 'LOST', label: 'Lost' },
];

export default function MyBetsPage() {
  const { user }          = useContext(AuthContext);
  const [bets, setBets]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchBets = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const data = await getMyBets();
      setBets(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load bet history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBets(); }, [fetchBets]);

  const totalWagered = bets.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
  const wonBets      = bets.filter((b) => b.status === 'WON');
  const totalPayout  = wonBets.reduce((s, b) => s + (b.betItems ?? []).reduce((si, it) => si + (Number(it.payout) || 0), 0), 0);
  const winRate      = bets.length ? Math.round((wonBets.length / bets.length) * 100) : 0;
  const filtered     = activeTab === 'ALL' ? bets : bets.filter((b) => b.status === activeTab);

  return (
    <div className="ws-page">
      <Seo title="Betting History" description="Track your Royal Derby race bets." />
      <DashboardPageHeader eyebrow="My Account" title="Betting History" subtitle="Track every wager, review results and monitor your win rate." />

      <div className="ws-body ws-body--narrow">
        {/* Stats */}
        <div className="ws-stat-row">
          <StatCard icon={Ticket}      label="Total Bets"    value={bets.length} tileVariant="default" />
          <StatCard icon={DollarSign}  label="Total Wagered" value={fmt(totalWagered)} tileVariant="default" />
          <StatCard icon={CheckCircle} label="Wins"          value={wonBets.length}  tileVariant="ok" />
          <StatCard icon={TrendingUp}  label="Win Rate"      value={`${winRate}%`}   tileVariant="brass" />
        </div>

        {/* Tabs */}
        <div className="my-bets-page__toolbar">
          <div className="my-bets-page__tabs" role="tablist">
            {TABS.map((tab) => {
              const cnt = tab.key === 'ALL' ? bets.length : bets.filter((b) => b.status === tab.key).length;
              return (
                <button key={tab.key} role="tab" aria-selected={activeTab === tab.key}
                  className={`my-bets-page__tab${activeTab === tab.key ? ' my-bets-page__tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}>
                  {tab.label}{cnt > 0 && <span className="my-bets-page__tab-cnt">{cnt}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {error && <div className="ws-error"><span>{error}</span><button type="button" onClick={fetchBets}>Retry</button></div>}
        {loading && !error && <div className="my-bets-page__skeletons">{[1,2,3].map((i) => <div key={i} className="bet-skeleton" />)}</div>}
        {!loading && !error && (
          filtered.length === 0 ? (
            <div className="ws-panel">
              <div className="ws-empty">
                <Ticket size={40} className="ws-empty__icon" />
                <p className="ws-empty__title">{activeTab === 'ALL' ? "No bets placed yet" : 'No bets in this category'}</p>
                <p>{activeTab === 'ALL' ? 'Head to a live race and try your luck!' : 'Try a different filter.'}</p>
                {activeTab === 'ALL' && <Link to="/races" className="ui-btn ui-btn--primary ui-btn--md" style={{ marginTop: '1rem' }}>Browse races</Link>}
              </div>
            </div>
          ) : (
            <div className="my-bets-page__list">{filtered.map((bet) => <BetRow key={bet.id} bet={bet} />)}</div>
          )
        )}
      </div>
    </div>
  );
}
