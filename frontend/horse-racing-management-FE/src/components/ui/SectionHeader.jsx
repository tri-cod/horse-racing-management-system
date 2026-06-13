import '../../assets/css/ui/SectionHeader.css';

export default function SectionHeader({ eyebrow, title, subtitle, align = 'center', className = '' }) {
  return (
    <div className={`ui-section-header ui-section-header--${align} ${className}`.trim()}>
      {eyebrow && <p className="eyebrow ui-section-header__eyebrow">{eyebrow}</p>}
      {title && <h2 className="ui-section-header__title">{title}</h2>}
      {subtitle && <p className="ui-section-header__subtitle">{subtitle}</p>}
    </div>
  );
}
