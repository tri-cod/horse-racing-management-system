import '../../assets/css/rd/StatusChip.css';

/**
 * Unified status/role badge.
 * variant: 'ok' | 'info' | 'brass' | 'warn' | 'danger' | 'neutral' | 'navy'
 * pulse: true for a live/ongoing dot
 */
export default function StatusChip({ label, variant = 'neutral', pulse = false }) {
  return (
    <span className={`status-chip status-chip--${variant}`}>
      {pulse && <span className="status-chip__dot status-chip__dot--pulse" />}
      {label}
    </span>
  );
}
