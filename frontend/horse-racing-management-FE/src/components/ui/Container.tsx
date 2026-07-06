import type { HTMLAttributes, ReactNode } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
 children: ReactNode;
 narrow?: boolean;
}

export default function Container({ children, narrow = false, className = '', ...rest }: ContainerProps) {
 return (
 <div
 className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${narrow ? 'max-w-3xl' : 'max-w-7xl'} ${className}`}
 {...rest}
 >
 {children}
 </div>
 );
}
