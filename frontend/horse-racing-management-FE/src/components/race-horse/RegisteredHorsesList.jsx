import { useState } from 'react';
import { Check, X, Users } from 'lucide-react';
import { useHorsesByRace } from '../../hooks/useHorsesByRace';
import { approveRaceHorse, rejectRaceHorse } from '../../api/raceHorseApi';
import ConfirmDialog from '../ui/ConfirmDialog';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';
import { assignLanes } from '../../utils/laneUtils';
import '../../assets/css/race-horse/RegisteredHorsesList.css';

export default function RegisteredHorsesList({ raceId, isAdmin, onToast }) {
  const { entries: allEntries, loading, error, refetch } = useHorsesByRace(raceId);
  const entries = assignLanes(allEntries.filter((e) => e.status?.toLowerCase() === 'approved'));
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.action === 'approve') {
        await approveRaceHorse(confirm.id);
        onToast?.('Horse approved successfully.');
      } else {
        await rejectRaceHorse(confirm.id);
        onToast?.('Horse rejected.');
      }
      refetch();
    } catch (e) {
      onToast?.(e.response?.data?.message || 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="reg-horses__error">{error}</p>;
  if (!entries.length) return (
    <EmptyState icon={Users} title="No horses registered" subtitle="No horses have registered for this race yet." />
  );

  return (
    <div className="reg-horses">
      <div className="reg-horses__table-wrap">
        <table className="reg-horses__table">
          <thead>
            <tr>
              <th>Lane</th>
              <th>Horse</th>
              <th>Jockey</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="reg-horses__row">
                <td className="reg-horses__lane">{e.laneNumber ?? '—'}</td>
                <td className="reg-horses__horse">{e.horseName}</td>
                <td className="reg-horses__jockey">{e.jockeyName || '—'}</td>
                {isAdmin && (
                  <td>
                    {e.status === 'PENDING' && (
                      <div className="reg-horses__actions">
                        <button
                          type="button"
                          className="reg-horses__btn reg-horses__btn--approve"
                          onClick={() => setConfirm({ id: e.id, action: 'approve', name: e.horseName })}
                          title="Approve"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          type="button"
                          className="reg-horses__btn reg-horses__btn--reject"
                          onClick={() => setConfirm({ id: e.id, action: 'reject', name: e.horseName })}
                          title="Reject"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        loading={actionLoading}
        title={confirm?.action === 'approve' ? 'Approve Horse?' : 'Reject Horse?'}
        message={`Are you sure you want to ${confirm?.action} "${confirm?.name}"?`}
        confirmLabel={confirm?.action === 'approve' ? 'Approve' : 'Reject'}
        variant={confirm?.action === 'approve' ? 'warning' : 'danger'}
      />
    </div>
  );
}