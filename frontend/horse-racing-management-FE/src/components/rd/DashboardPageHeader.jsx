import '../../assets/css/rd/DashboardPageHeader.css';

/**
 * Standard dashboard page header — Playfair title + Inter subtitle + optional action slot.
 */
export default function DashboardPageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="dash-page-header">
      <div className="dash-page-header__text">
        {eyebrow && <p className="eyebrow dash-page-header__eyebrow">{eyebrow}</p>}
        <h1 className="dash-page-header__title">{title}</h1>
        {subtitle && <p className="dash-page-header__sub">{subtitle}</p>}
      </div>
      {action && <div className="dash-page-header__action">{action}</div>}
    </div>
  );
}
