import '../../assets/css/ui/PageHero.css';

export default function PageHero({ eyebrow, title, subtitle, actions, dark = false }) {
  return (
    <section className={`page-hero${dark ? ' page-hero--dark' : ''}`}>
      <div className="page-hero__inner">
        {eyebrow && <span className="eyebrow page-hero__eyebrow">{eyebrow}</span>}
        <h1 className="page-hero__title">{title}</h1>
        {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}
        {actions && <div className="page-hero__actions">{actions}</div>}
      </div>
    </section>
  );
}
