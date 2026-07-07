interface SkeletonProps {
 className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
 return <div className={`animate-pulse bg-gray-200 ${className}`} />;
}

export function SkeletonCard() {
 return (
 <div className="">
 <Skeleton className="h-40 w-full" />
 <div className="">
 <Skeleton className="h-5 w-3/4" />
 <Skeleton className="mt-2 h-4 w-1/2" />
 <Skeleton className="mt-2 h-4 w-2/3" />
 <Skeleton className="mt-4 h-8 w-full" />
 </div>
 </div>
 );
}

export function SkeletonRow() {
 return (
 <div className="">
 <Skeleton className="h-10 w-10 rounded-full" />
 <div className="">
 <Skeleton className="h-4 w-40" />
 <Skeleton className="mt-1.5 h-3 w-24" />
 </div>
 <Skeleton className="ml-auto h-6 w-20 rounded-full" />
 </div>
 );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
 return (
 <div className="">
 {Array.from({ length: rows }).map((_, i) => (
 <SkeletonRow key={i} />
 ))}
 </div>
 );
}

export function SkeletonGrid({ cols = 3, rows = 2 }: { cols?: number; rows?: number }) {
 return (
 <div className="">
 {Array.from({ length: cols * rows }).map((_, i) => (
 <SkeletonCard key={i} />
 ))}
 </div>
 );
}
