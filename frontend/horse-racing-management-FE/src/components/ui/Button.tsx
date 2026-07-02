import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps<T extends ElementType = 'button'> = {
 variant?: Variant;
 size?: Size;
 as?: T;
 className?: string;
 children: ReactNode;
} & ComponentPropsWithoutRef<T>;

const VARIANT: Record<Variant, string> = {
 primary: 'bg-navy text-on-blue hover:bg-navy-hi active:opacity-90',
 outline: 'border border-navy text-navy hover:bg-navy/10',
 ghost: 'border border-rim-hi text-ink-2 hover:bg-surface-overlay',
 dark: 'bg-navy text-on-blue hover:bg-navy-hi',
};

const SIZE: Record<Size, string> = {
 sm: 'px-3 py-1.5 text-sm',
 md: 'px-4 py-2 text-sm',
 lg: 'px-6 py-3 text-base',
};

export default function Button<T extends ElementType = 'button'>({
 variant = 'primary',
 size = 'md',
 as,
 className = '',
 children,
 ...rest
}: ButtonProps<T>) {
 const Component = as ?? 'button';
 return (
 <Component
 className={`inline-flex items-center justify-center gap-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${className}`}
 {...rest}
 >
 {children}
 </Component>
 );
}
