import '../../assets/css/ui/Container.css';

export default function Container({ children, narrow = false, className = '', ...rest }) {
  const classes = [
    'ui-container',
    narrow ? 'ui-container--narrow' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
