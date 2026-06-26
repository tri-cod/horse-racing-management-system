import '../../assets/css/rd/PageHeader.css';

/**
 * Public page hero header — navy band, brass eyebrow, Playfair title.
 */
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="page-hero-rd">
      <div className="page-hero-rd__inner">
        {eyebrow && <p className="eyebrow page-hero-rd__eyebrow">{eyebrow}</p>}
        <h1 className="page-hero-rd__title">{title}</h1>
        {subtitle && <p className="page-hero-rd__sub">{subtitle}</p>}
        {children && <div className="page-hero-rd__actions">{children}</div>}
      </div>
    </div>
  );
}
