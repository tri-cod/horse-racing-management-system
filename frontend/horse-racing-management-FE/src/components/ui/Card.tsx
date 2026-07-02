import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
 children: ReactNode;
 hoverable?: boolean;
}

export default function Card({ children, hoverable = true, className = '', ...rest }: CardProps) {
 return (
 <div
 className={`overflow-hidden border border-rim bg-surface-raised ${hoverable ? 'transition hover:border-rim-hi hover:shadow-xl hover:shadow-black/50' : ''} ${className}`}
 {...rest}
 >
 {children}
 </div>
 );
}
