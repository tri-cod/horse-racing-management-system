/** Jockey racing-silk swatch. variant 1–6; size in px (default 28). */
export default function Silk({ variant = 1, size = 28, className = '' }) {
  return (
    <span
      className={`silk silk--${variant} ${className}`.trim()}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.25) }}
      aria-hidden="true"
    />
  );
}
