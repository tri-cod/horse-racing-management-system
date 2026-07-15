import type { ReactNode } from 'react';

type Align = 'left' | 'center' | 'right';

interface SectionHeaderProps {
 eyebrow?: string;
 title?: ReactNode;
 subtitle?: string;
 align?: Align;
 invert?: boolean; /* true = nền tối (navy), dùng màu trắng */
 className?: string;
}

const ALIGN: Record<Align, string> = {
 left: 'text-left',
 center: 'text-center mx-auto',
 right: 'text-right ml-auto',
};

export default function SectionHeader({ eyebrow, title, subtitle, align = 'center', invert = false, className = '' }: SectionHeaderProps) {
 const alignCls = ALIGN[align];
 return (
 <div className={`mb-12 max-w-2xl ${alignCls} ${className}`}>
 {eyebrow && (
 <p className="eyebrow mb-3">{eyebrow}</p>
 )}
 {title && (
 <h2 className={`font-serif text-3xl font-bold sm:text-4xl ${invert ? 'text-on-blue' : 'text-ink'}`}>{title}</h2>
 )}
 {subtitle && (
 <p className={`mt-4 text-base leading-relaxed ${invert ? 'text-on-blue/65' : 'text-ink-2'}`}>{subtitle}</p>
 )}
 </div>
 );
}
