import '../../assets/css/ui/LoadingSpinner.css';

export default function LoadingSpinner({ size = 'md', label = 'Loading…' }) {
  return (
    <div className={`spinner spinner--${size}`} role="status" aria-label={label}>
      <div className="spinner__circle" />
    </div>
  );
}