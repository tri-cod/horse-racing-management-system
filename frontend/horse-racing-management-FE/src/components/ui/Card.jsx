import '../../assets/css/ui/Card.css';

export default function Card({ children, className = '', hoverable = true, ...rest }) {
  const classes = [
    'ui-card',
    hoverable ? 'ui-card--hoverable' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
