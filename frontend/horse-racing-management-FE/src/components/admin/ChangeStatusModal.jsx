import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { updateUserStatus } from '../../api/adminApi';
import '../../assets/css/admin/ChangeStatusModal.css';

const STATUSES = ['ACTIVE', 'INACTIVE', 'BANNED'];

export default function ChangeStatusModal({ user, onClose, onSuccess }) {
  const [selected, setSelected] = useState(user?.status ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    if (!selected || selected === user.status) { onClose(); return; }
    setLoading(true);
    setError(null);
    try {
      await updateUserStatus(user.id, selected);
      onSuccess('Status updated successfully.');
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!user} onClose={onClose} title="Change User Status" size="sm">
      <div className="change-status-modal">
        <p className="change-status-modal__user">{user?.fullName}</p>
        <div className="change-status-modal__list">
          {STATUSES.map((s) => (
            <label key={s} className="change-status-modal__option">
              <input
                type="radio"
                name="status"
                value={s}
                checked={selected === s}
                onChange={() => setSelected(s)}
              />
              <span>{s}</span>
            </label>
          ))}
        </div>
        {selected === 'BANNED' && (
          <p className="change-status-modal__warning">
            Banning this user will prevent them from accessing the platform. This action can be reversed.
          </p>
        )}
        {error && <p className="change-status-modal__error">{error}</p>}
        <div className="change-status-modal__footer">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Saving…' : 'Save Status'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
