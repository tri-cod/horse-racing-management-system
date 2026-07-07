type Size = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
 size?: Size;
 label?: string;
 fullPage?: boolean;
}

export default function LoadingSpinner({ size = 'md', label = 'Loading…', fullPage = false }: LoadingSpinnerProps) {
 const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
 return (
 <div
 className={`flex flex-col items-center justify-center gap-3 ${fullPage ? 'min-h-screen' : 'py-12'}`}
 role="status"
 aria-label={label}
 >
 <div className={`relative ${sizeMap[size]}`}>
 <div className="absolute inset-0 rounded-full border-2 border-rim" />
 <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold" />
 </div>
 {(size === 'lg' || fullPage) && (
 <p className="text-sm text-ink-3">{label}</p>
 )}
 </div>
 );
}
