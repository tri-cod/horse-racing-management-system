import '../../assets/css/ui/Button.css';

const VARIANT_CLASS = {
  primary: 'ui-btn--primary',
  outline: 'ui-btn--outline',
  ghost:   'ui-btn--ghost',
  dark:    'ui-btn--dark',
};

const SIZE_CLASS = {
  sm: 'ui-btn--sm',
  md: 'ui-btn--md',
  lg: 'ui-btn--lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  as: Component = 'button',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'ui-btn',
    VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
    SIZE_CLASS[size] || SIZE_CLASS.md,
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
