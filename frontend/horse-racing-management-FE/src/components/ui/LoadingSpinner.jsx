import '../../assets/css/ui/LoadingSpinner.css';

/**
 * size: 'sm' | 'md' | 'lg'
 * label: text shown below the spinner (lg only)
 * fullPage: centres in the entire viewport
 */
export default function LoadingSpinner({ size = 'md', label = 'Loading…', fullPage = false }) {
  return (
    <div
      className={[
        'spinner',
        `spinner--${size}`,
        fullPage ? 'spinner--fullpage' : '',
      ].filter(Boolean).join(' ')}
      role="status"
      aria-label={label}
    >
      <div className="spinner__track">
        <div className="spinner__ring spinner__ring--outer" />
        <div className="spinner__ring spinner__ring--inner" />
        <div className="spinner__dot" />
      </div>

      {(size === 'lg' || fullPage) && (
        <p className="spinner__label">{label}</p>
      )}
    </div>
  );
}
