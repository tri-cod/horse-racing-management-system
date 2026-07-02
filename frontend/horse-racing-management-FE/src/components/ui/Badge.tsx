import type { HTMLAttributes, ReactNode } from 'react';

type Variant = 'ocean' | 'ocean-solid' | 'neutral' | 'dark' | 'danger' | 'warning';
type Size = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
 variant?: Variant;
 size?: Size;
 children: ReactNode;
}

export default function Badge({ variant: _variant = 'neutral', size: _size = 'md', children, ...rest }: BadgeProps) {
 return (
 <span
 className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
 {...rest}
 >
 {children}
 </span>
 );
}
