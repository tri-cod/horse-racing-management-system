import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { updateUserRole } from '../../api/adminApi';
import '../../assets/css/admin/ChangeRoleModal.css';

const ROLES = [
  'ADMIN', 'MANAGER', 'STAFF', 'REFEREE',
  'HORSE_OWNER', 'TRAINER', 'JOCKEY',
  'SPECTATOR', 'USER',
];

export default function ChangeRoleModal({ user, onClose, onSuccess }) {
  const [selected, setSelected] = useState(user?.role ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    if (!selected || selected === user.role) { onClose(); return; }
    setLoading(true);
    setError(null);
    try {
      await updateUserRole(user.id, selected);
      onSuccess('Role updated successfully.');
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!user} onClose={onClose} title="Change User Role" size="sm">
      <div className="change-role-modal">
        <p className="change-role-modal__user">{user?.fullName}</p>
        <div className="change-role-modal__list">
          {ROLES.map((r) => (
            <label key={r} className="change-role-modal__option">
              <input
                type="radio"
                name="role"
                value={r}
                checked={selected === r}
                onChange={() => setSelected(r)}
              />
              <span>{r}</span>
            </label>
          ))}
        </div>
        {error && <p className="change-role-modal__error">{error}</p>}
        <div className="change-role-modal__footer">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Saving…' : 'Save Role'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}