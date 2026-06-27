import '../../assets/css/shared/StatCard.css';

/**
 * KPI stat card — Oswald label + big Oswald number + optional sub/trend.
 * tileVariant: 'default' | 'brass' | 'ok' | 'danger'
 */
export default function StatCard({ icon: Icon, label, value, sub, trend, tileVariant = 'default' }) {
  return (
    <div className="stat-card">
      {Icon && (
        <div className={`stat-card__icon-tile${tileVariant !== 'default' ? ` stat-card__icon-tile--${tileVariant}` : ''}`}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
      )}
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <span className={`stat-card__value${typeof value === 'string' && value.length > 6 ? ' stat-card__value--sm' : ''}`}>
          {value}
        </span>
        {sub && <span className="stat-card__sub">{sub}</span>}
        {trend && (
          <span className={`stat-card__trend stat-card__trend--${trend.dir}`}>
            {trend.dir === 'up' ? '↑' : '↓'} {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
