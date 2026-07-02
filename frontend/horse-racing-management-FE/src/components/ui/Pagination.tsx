import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
 currentPage: number;
 totalPages: number;
 onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
 if (totalPages <= 1) return null;

 const pages: number[] = [];
 const delta = 2;
 for (let i = 0; i < totalPages; i++) {
 if (i === 0 || i === totalPages - 1 || (i >= currentPage - delta && i <= currentPage + delta)) {
 pages.push(i);
 }
 }

 const rendered: (number | string)[] = [];
 let prev = -1;
 for (const p of pages) {
 if (p - prev > 1) rendered.push(`ellipsis-${p}`);
 rendered.push(p);
 prev = p;
 }

 const btnBase = 'flex h-8 w-8 items-center justify-center border text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40';

 return (
 <nav className="flex items-center gap-1" aria-label="Pagination">
 <button
 className={`${btnBase} border-rim bg-surface-raised text-ink-3 hover:border-rim-hi hover:text-ink`}
 onClick={() => onPageChange(currentPage - 1)}
 disabled={currentPage === 0}
 aria-label="Previous page"
 >
 <ChevronLeft size={16} />
 </button>

 {rendered.map((item) =>
 typeof item === 'string' ? (
 <span key={item} className="flex h-8 w-8 items-center justify-center text-sm text-ink-4">…</span>
 ) : (
 <button
 key={item}
 className={`${btnBase} ${item === currentPage ? 'border-gold bg-gold text-on-gold font-semibold' : 'border-rim bg-surface-raised text-ink-3 hover:border-rim-hi hover:text-ink'}`}
 onClick={() => onPageChange(item)}
 aria-current={item === currentPage ? 'page' : undefined}
 >
 {item + 1}
 </button>
 )
 )}

 <button
 className={`${btnBase} border-rim bg-surface-raised text-ink-3 hover:border-rim-hi hover:text-ink`}
 onClick={() => onPageChange(currentPage + 1)}
 disabled={currentPage === totalPages - 1}
 aria-label="Next page"
 >
 <ChevronRight size={16} />
 </button>
 </nav>
 );
}
