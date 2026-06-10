import '../../assets/css/ui/Badge.css';

const VARIANT_CLASS = {
  ocean:        'ui-badge--ocean',
  'ocean-solid':'ui-badge--ocean-solid',
  neutral:      'ui-badge--neutral',
  dark:         'ui-badge--dark',
  danger:       'ui-badge--danger',
};

const SIZE_CLASS = {
  sm: 'ui-badge--sm',
  md: '',
  lg: 'ui-badge--lg',
};

export default function Badge({ variant = 'neutral', size = 'md', className = '', children, ...rest }) {
  const cls = [
    'ui-badge',
    VARIANT_CLASS[variant] || VARIANT_CLASS.neutral,
    SIZE_CLASS[size] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
