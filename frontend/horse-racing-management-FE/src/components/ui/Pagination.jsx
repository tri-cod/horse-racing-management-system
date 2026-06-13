import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../assets/css/ui/Pagination.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  for (let i = 0; i < totalPages; i++) {
    if (
      i === 0 ||
      i === totalPages - 1 ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    }
  }

  const rendered = [];
  let prev = -1;
  for (const p of pages) {
    if (p - prev > 1) rendered.push('ellipsis-' + p);
    rendered.push(p);
    prev = p;
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pagination__btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {rendered.map((item) =>
        typeof item === 'string' ? (
          <span key={item} className="pagination__ellipsis">…</span>
        ) : (
          <button
            key={item}
            className={`pagination__btn${item === currentPage ? ' pagination__btn--active' : ''}`}
            onClick={() => onPageChange(item)}
            aria-current={item === currentPage ? 'page' : undefined}
          >
            {item + 1}
          </button>
        )
      )}

      <button
        className="pagination__btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}