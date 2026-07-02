import type { ReactNode } from 'react';

interface PageHeaderProps {
 eyebrow?: string;
 title: string;
 subtitle?: string;
 children?: ReactNode;
}

export default function PageHeader({ eyebrow, title, subtitle, children }: PageHeaderProps) {
 return (
 <div className="border-b border-rim bg-surface-raised py-12">
 <div className="mx-auto max-w-7xl px-6 lg:px-8">
 {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">{eyebrow}</p>}
 <h1 className="text-3xl font-bold tracking-tight text-ink lg:text-4xl">{title}</h1>
 {subtitle && <p className="mt-2 text-base text-ink-3">{subtitle}</p>}
 {children && <div className="mt-6">{children}</div>}
 </div>
 </div>
 );
}
