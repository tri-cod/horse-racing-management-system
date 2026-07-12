import type { HTMLAttributes, ReactNode } from 'react';

type Variant = 'ocean' | 'warning' | 'danger' | 'neutral' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<Variant, string> = {
  ocean:   'bg-ok-subtle       text-ok     border-ok/30',
  warning: 'bg-warn-subtle     text-warn   border-warn/30',
  danger:  'bg-fail-subtle     text-fail   border-fail/30',
  neutral: 'bg-surface-overlay text-ink-3  border-rim',
  dark:    'bg-surface-overlay text-ink-4  border-rim',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-2   py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3   py-1   text-sm',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

// Pass `variant` for a preset color, or `className` for a fully custom color —
// the two are mutually exclusive; `className` wins when both are given.
export default function Badge({ variant, size = 'md', className, children, ...rest }: BadgeProps) {
  const colorClasses = className ?? VARIANT_CLASSES[variant ?? 'neutral'];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${SIZE_CLASSES[size]} ${colorClasses}`}
      {...rest}
    >
      {children}
    </span>
  );
}
