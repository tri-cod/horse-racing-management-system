import { useState, useEffect, useCallback, useContext } from 'react';
import { Ticket, RefreshCw, TrendingUp, DollarSign, CheckCircle, ChevronDown, ChevronUp, Calendar, Trophy, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyBets } from '../api/betApi';
import { AuthContext } from '../context/AuthContext';
import BetStatusBadge from '../components/bet/BetStatusBadge';
import '../assets/css/bet/MyBetsPage.css';

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

const RESULT_CLS = { WON: 'result-pill--won', LOST: 'result-pill--lost', PENDING: 'result-pill--pending', PENDING_FINISHED: 'result-pill--pending' };

function BetItemsDetail({ items = [] }) {
  if (!items.length) return <p className="bet-items-empty">No details available.</p>;
  return (
    <div className="bet-items-wrap">
      <table className="bet-items-table">
        <thead>
          <tr><th>Horse</th><th className="ta-r">Stake</th><th className="ta-r">Odds</th><th className="ta-r">Payout</th><th>Result</th></tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="bet-items-table__row">
              <td className="bet-items-table__horse">{it.horseName ?? '—'}</td>
              <td className="ta-r">{fmt(it.betAmount)}</td>
              <td className="ta-r bet-items-table__odds">{it.odds != null ? `×${parseFloat(it.odds).toFixed(2)}` : '—'}</td>
              <td className="ta-r">{it.payout != null ? <strong>{fmt(it.payout)}</strong> : '—'}</td>
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
          <span className="bet-row__date"><Calendar size={11} />{fmtDate(bet.createdAt)}</span>
        </div>
        <div className="bet-row__col bet-row__col--horses">
          <Target size={13} />
          <span>{bet.betItems?.length ?? 0} horse{(bet.betItems?.length ?? 0) !== 1 ? 's' : ''}</span>
        </div>
        <div className="bet-row__col bet-row__col--amount">
          <span className="bet-row__amount">{fmt(bet.totalAmount)}</span>
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
  { key: 'ALL',              label: 'All' },
  { key: 'PENDING',          label: 'Pending' },
  { key: 'PENDING_FINISHED', label: 'Pending Result' },
  { key: 'WON',              label: 'Won' },
  { key: 'LOST',             label: 'Lost' },
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
    <div className="my-bets-page">
      <section className="my-bets-page__hero">
        <div className="my-bets-page__hero-inner">
          <span className="eyebrow my-bets-page__eyebrow">My Account</span>
          <h1 className="my-bets-page__hero-title">Betting History</h1>
          <p className="my-bets-page__hero-sub">Track every wager, review results and monitor your win rate.</p>
        </div>
      </section>

      <div className="my-bets-page__body">
        <div className="my-bets-page__stats">
          <div className="bstat-card"><div className="bstat-card__icon bstat-card__icon--blue"><Ticket size={20} /></div><div className="bstat-card__body"><span className="bstat-card__val">{bets.length}</span><span className="bstat-card__lbl">Total bets</span></div></div>
          <div className="bstat-card"><div className="bstat-card__icon bstat-card__icon--dark"><DollarSign size={20} /></div><div className="bstat-card__body"><span className="bstat-card__val bstat-card__val--sm">{fmt(totalWagered)}</span><span className="bstat-card__lbl">Total wagered</span></div></div>
          <div className="bstat-card"><div className="bstat-card__icon bstat-card__icon--green"><CheckCircle size={20} /></div><div className="bstat-card__body"><span className="bstat-card__val">{wonBets.length}</span><span className="bstat-card__lbl">Wins</span></div></div>
          <div className="bstat-card"><div className="bstat-card__icon bstat-card__icon--gold"><TrendingUp size={20} /></div><div className="bstat-card__body"><span className="bstat-card__val bstat-card__val--sm">{fmt(totalPayout)}</span><span className="bstat-card__lbl">Total winnings</span></div></div>
        </div>

        {!loading && bets.length > 0 && (
          <div className="my-bets-page__winrate">
            <Trophy size={18} />
            <span>Your win rate: <strong>{winRate}%</strong>{winRate >= 50 ? ' — Great form! 🔥' : ' — Keep going! 💪'}</span>
          </div>
        )}

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
          <button type="button" className="ui-btn ui-btn--outline ui-btn--sm" onClick={fetchBets} disabled={loading}>
            <RefreshCw size={13} style={loading ? { animation: 'spin .7s linear infinite' } : {}} />
            Refresh
          </button>
        </div>

        {error && <div className="my-bets-page__error"><span>{error}</span><button type="button" onClick={fetchBets}>Retry</button></div>}
        {loading && !error && <div className="my-bets-page__skeletons">{[1,2,3].map((i) => <div key={i} className="bet-skeleton" />)}</div>}
        {!loading && !error && (
          filtered.length === 0 ? (
            <div className="my-bets-page__empty">
              <Ticket size={42} className="my-bets-page__empty-icon" />
              <h3>{activeTab === 'ALL' ? "You haven't placed any bets yet" : 'No bets in this category'}</h3>
              <p>{activeTab === 'ALL' ? 'Head to a live race and try your luck!' : 'Try a different filter.'}</p>
              {activeTab === 'ALL' && <Link to="/races" className="ui-btn ui-btn--primary ui-btn--md" style={{ marginTop: '1rem' }}>Browse races</Link>}
            </div>
          ) : (
            <div className="my-bets-page__list">{filtered.map((bet) => <BetRow key={bet.id} bet={bet} />)}</div>
          )
        )}
      </div>
    </div>
  );
}
