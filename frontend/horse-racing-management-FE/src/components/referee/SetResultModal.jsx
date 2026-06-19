import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getHorsesByRace, setRaceResult } from '../../api/refereeApi';
import { assignLanes } from '../../utils/laneUtils';

export default function SetResultModal({ race, onClose, onSuccess }) {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [ranks, setRanks] = useState({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getHorsesByRace(race.id);
        setHorses(assignLanes(data ?? []));
        const init = {};
        (data ?? []).forEach((rh) => {
          init[rh.id] = { rank: '', completionTime: '' };
        });
        setRanks(init);
      } catch {
        setError('Unable to load horse list.');
      } finally {
        setLoading(false);
      }
    })();
  }, [race.id]);

  const setField = (raceHorseId, field, value) => {
    setRanks((prev) => ({
      ...prev,
      [raceHorseId]: { ...prev[raceHorseId], [field]: value },
    }));
  };

  const validate = () => {
    const rankValues = horses.map((rh) => Number(ranks[rh.id]?.rank));
    if (rankValues.some((r) => !r || r < 1)) return 'Please enter a rank for every horse.';
    const unique = new Set(rankValues);
    if (unique.size !== rankValues.length) return 'Ranks must be unique.';
    if (rankValues.some((r) => r > horses.length)) return `Rank must be between 1 and ${horses.length}.`;
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSubmitting(true);
    setError(null);
    try {
      const results = horses.map((rh) => ({
        raceHorseId: rh.id,
        rank: Number(ranks[rh.id].rank),
        completionTime: ranks[rh.id].completionTime || null,
      }));
      await setRaceResult({ raceId: race.id, results });
      onSuccess();
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Failed to save results. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(3px)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background:'var(--white,#fff)',borderRadius:'12px',width:'100%',maxWidth:'680px',maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,0.25)',overflow:'hidden' }}>

        <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'20px 24px 16px',borderBottom:'1px solid var(--border)' }}>
          <div>
            <p style={{ fontSize:'11px',fontWeight:700,letterSpacing:'.08em',color:'var(--primary)',textTransform:'uppercase',marginBottom:'4px' }}>SET RESULT</p>
            <h2 style={{ fontSize:'1.2rem',fontWeight:700,color:'var(--text)',margin:0 }}>{race.raceName}</h2>
          </div>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',padding:'4px',borderRadius:'6px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ flex:1,overflowY:'auto',padding:'20px 24px' }}>
          {loading ? (
            <div style={{ textAlign:'center',padding:'32px',color:'var(--text-muted)' }}>Loading horses...</div>
          ) : horses.length === 0 ? (
            <div style={{ textAlign:'center',padding:'32px',color:'var(--text-muted)' }}>No horses registered for this race.</div>
          ) : (
            <>
              <p style={{ fontSize:'13px',color:'var(--text-muted)',marginBottom:'16px' }}>
                Enter rank (1 = 1st place) and completion time for each horse.
              </p>
              <div style={{ overflowX:'auto',border:'1px solid var(--border)',borderRadius:'8px' }}>
                <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'13px' }}>
                  <thead>
                    <tr style={{ background:'var(--black-5)',borderBottom:'1px solid var(--border)' }}>
                      {['Lane', 'Horse', 'Jockey', 'Rank *', 'Time'].map((h) => (
                        <th key={h} style={{ textAlign:'left',padding:'8px 12px',fontSize:'11px',fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {horses.map((rh) => (
                      <tr key={rh.id} style={{ borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'10px 12px',fontWeight:600,color:'var(--text-muted)',textAlign:'center' }}>{rh.laneNumber}</td>
                        <td style={{ padding:'10px 12px' }}>
                          <div style={{ fontWeight:600,color:'var(--text)' }}>{rh.horseName ?? '—'}</div>
                        </td>
                        <td style={{ padding:'10px 12px' }}>{rh.jockeyName ?? '—'}</td>
                        <td style={{ padding:'10px 12px' }}>
                          <input
                            type="number" min={1} max={horses.length} placeholder="1"
                            value={ranks[rh.id]?.rank ?? ''}
                            onChange={(e) => setField(rh.id, 'rank', e.target.value)}
                            style={{ width:'70px',padding:'6px 10px',textAlign:'center',border:'1px solid var(--border)',borderRadius:'6px',fontSize:'13px',outline:'none' }}
                          />
                        </td>
                        <td style={{ padding:'10px 12px' }}>
                          <input
                            type="text" placeholder="1:32.45"
                            value={ranks[rh.id]?.completionTime ?? ''}
                            onChange={(e) => setField(rh.id, 'completionTime', e.target.value)}
                            style={{ width:'110px',padding:'6px 10px',border:'1px solid var(--border)',borderRadius:'6px',fontSize:'13px',outline:'none' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {error && (
            <div style={{ marginTop:'14px',padding:'10px 14px',background:'#fee2e2',color:'#b91c1c',borderRadius:'6px',fontSize:'13px' }}>{error}</div>
          )}
        </div>

        {!loading && horses.length > 0 && (
          <div style={{ display:'flex',justifyContent:'flex-end',gap:'10px',padding:'16px 24px',borderTop:'1px solid var(--border)' }}>
            <button onClick={onClose} disabled={submitting} style={{ padding:'8px 20px',borderRadius:'8px',fontSize:'14px',fontWeight:500,cursor:'pointer',border:'1px solid var(--border)',background:'transparent',color:'var(--text-muted)' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting} style={{ padding:'8px 20px',borderRadius:'8px',fontSize:'14px',fontWeight:500,cursor:'pointer',border:'none',background:'var(--primary)',color:'#fff',opacity:submitting?0.6:1 }}>
              {submitting ? 'Saving...' : 'Save Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}