import type { ReactNode, ComponentType } from 'react';

interface EmptyStateProps {
 icon?: ComponentType<{ size?: number; strokeWidth?: number }>;
 title: string;
 subtitle?: string;
 action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
 return (
 <div className="flex flex-col items-center justify-center py-16 text-center">
 {Icon && (
 <div className="mb-4 rounded-full bg-surface-overlay p-4 text-ink-4">
 <Icon size={48} strokeWidth={1.5} />
 </div>
 )}
 <h3 className="mb-1 text-base font-semibold text-ink">{title}</h3>
 {subtitle && <p className="mb-4 text-sm text-ink-3">{subtitle}</p>}
 {action && <div className="mt-2">{action}</div>}
 </div>
 );
}
