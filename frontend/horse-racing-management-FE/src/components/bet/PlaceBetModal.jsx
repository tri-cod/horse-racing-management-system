import { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, Trophy, TrendingUp } from 'lucide-react';
import { placeBet } from '../../api/betApi';
import { getBalance } from '../../api/walletApi';
import '../../assets/css/bet/PlaceBetModal.css';

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000];

export default function PlaceBetModal({ open, onClose, race, raceHorses = [], onSuccess }) {
  const [items, setItems]       = useState([{ raceHorseId: '', betAmount: '' }]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [balance, setBalance]   = useState(null);
  const [balanceErr, setBalanceErr] = useState(false);

  useEffect(() => {
    if (open) {
      setItems([{ raceHorseId: '', betAmount: '' }]);
      setError('');
      setBalanceErr(false);
      getBalance()
        .then((b) => { setBalance(b); setBalanceErr(false); })
        .catch(() => { setBalance(null); setBalanceErr(true); });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const total          = items.reduce((s, it) => s + (parseInt(it.betAmount, 10) || 0), 0);
  const isOverBalance  = balance != null && total > balance;
  const noHorses       = raceHorses.length === 0;
  const cannotSubmit   = loading || total < 1000 || isOverBalance || balanceErr || noHorses;

  const addItem    = () => setItems((p) => [...p, { raceHorseId: '', betAmount: '' }]);
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i));
  const update     = (i, field, val) => setItems((p) => p.map((it, idx) => idx === i ? { ...it, [field]: val } : it));
  const quickSet   = (i, amt) => setItems((p) => p.map((it, idx) => idx === i ? { ...it, betAmount: String(amt) } : it));

  const validate = () => {
    for (const it of items) {
      if (!it.raceHorseId) return 'Please select a horse for every entry.';
      const amt = parseInt(it.betAmount, 10);
      if (isNaN(amt) || amt < 1000) return 'Minimum bet amount is 1,000 ₫.';
    }
    const ids = items.map((it) => it.raceHorseId);
    if (new Set(ids).size !== ids.length) return 'Each horse can only be selected once.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    try {
      setLoading(true); setError('');
      const result = await placeBet({
        raceId: race.id,
        betItems: items.map((it) => ({
          raceHorseId: parseInt(it.raceHorseId, 10),
          betAmount:   parseInt(it.betAmount, 10),
        })),
      });
      onSuccess?.(result);
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to place bet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal-dialog modal-dialog--md bet-place-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true"
      >
        {/* ── Header ── */}
        <div className="modal-header bet-place-modal__header">
          <div>
            <span className="eyebrow" style={{ color: 'var(--accent)' }}>Place a Bet</span>
            <h3 className="modal-title">{race?.raceName ?? race?.name ?? 'Race'}</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="bet-place-form">

            {/* Race summary */}
            <div className="bet-place-modal__race-info">
              <div className="bet-place-modal__race-info-item">
                <Trophy size={14} />
                <span>{race?.location ?? 'Racetrack'}</span>
              </div>
              <div className="bet-place-modal__running-total">
                <TrendingUp size={14} />
                <span>Total Bets: <strong>{fmt(total)}</strong></span>
              </div>
            </div>

            {/* No horses warning */}
            {noHorses && (
              <div className="bet-place-form__error">
                <AlertCircle size={15} /> No horses registered for this race yet.
              </div>
            )}

            {/* Bet items */}
            {!noHorses && (
              <div className="bet-place-form__items">
                {items.map((item, idx) => {
                  const usedIds = items.map((it, i) => i !== idx ? it.raceHorseId : null).filter(Boolean);
                  return (
                    <div key={idx} className="bet-place-form__item">
                      <div className="bet-place-form__item-header">
                        <span className="bet-place-form__item-num">#{idx + 1}</span>
                        {items.length > 1 && (
                          <button type="button" className="bet-place-form__remove" onClick={() => removeItem(idx)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Horse select */}
                      <div className="bet-place-form__field">
                        <label htmlFor={`bet-horse-${idx}`} className="bet-place-form__label">Horse</label>
                        <select
                          id={`bet-horse-${idx}`}
                          className="bet-place-form__select"
                          value={item.raceHorseId}
                          onChange={(e) => update(idx, 'raceHorseId', e.target.value)}
                          required
                        >
                          <option value="">— Select a horse —</option>
                          {raceHorses
                            .filter((rh) => !usedIds.includes(String(rh.raceHorseId ?? rh.id)))
                            .map((rh) => (
                              <option key={rh.raceHorseId ?? rh.id} value={rh.raceHorseId ?? rh.id}>
                                #{rh.laneNumber} · {rh.horseName}
                                {rh.jockeyName ? ` — ${rh.jockeyName}` : ''}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Amount */}
                      <div className="bet-place-form__field">
                        <label htmlFor={`bet-amt-${idx}`} className="bet-place-form__label">Bet Amount (VND)</label>
                        <div className="bet-place-form__input-wrap">
                          <input
                            id={`bet-amt-${idx}`}
                            type="number"
                            className="bet-place-form__input"
                            placeholder="100,000"
                            min="1000"
                            step="1000"
                            value={item.betAmount}
                            onChange={(e) => update(idx, 'betAmount', e.target.value)}
                            required
                          />
                          <span className="bet-place-form__suffix">₫</span>
                        </div>
                        {/* Quick picks */}
                        <div className="bet-place-form__quick">
                          {QUICK_AMOUNTS.map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              className={`bet-place-form__quick-btn${parseInt(item.betAmount, 10) === amt ? ' active' : ''}`}
                              onClick={() => quickSet(idx, amt)}
                            >
                              {fmt(amt).replace('₫', '').trim()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add horse */}
            {!noHorses && raceHorses.length > items.length && (
              <button type="button" className="bet-place-form__add-btn" onClick={addItem}>
                <Plus size={14} /> Add another horse
              </button>
            )}

            {/* Error */}
            {error && (
              <div className="bet-place-form__error">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Balance error */}
            {balanceErr && (
              <div className="bet-place-form__error">
                <AlertCircle size={15} /> Unable to load wallet balance. Please try again.
              </div>
            )}

            {/* Insufficient balance warning */}
            {isOverBalance && (
              <div className="bet-place-form__error">
                <AlertCircle size={15} /> Insufficient balance. Please deposit funds first.
              </div>
            )}

            {/* Summary */}
            <div className="bet-place-form__summary">
              <div className="bet-place-form__summary-row">
                <span>Horses selected</span>
                <span>{items.length}</span>
              </div>
              <div className="bet-place-form__summary-row">
                <span>Available Balance</span>
                <span style={{ color: isOverBalance ? '#dc2626' : 'inherit', fontWeight: 600 }}>
                  {balanceErr ? '—' : fmt(balance)}
                </span>
              </div>
              <div className="bet-place-form__summary-row bet-place-form__summary-row--total">
                <span>Total Bet Amount</span>
                <span className="bet-place-form__total-value">{fmt(total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="bet-place-form__actions">
              <button type="button" className="ui-btn ui-btn--outline ui-btn--md" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button
                type="submit"
                className="ui-btn ui-btn--primary ui-btn--md"
                disabled={cannotSubmit}
              >
                {loading ? 'Processing…' : 'Confirm Bet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}