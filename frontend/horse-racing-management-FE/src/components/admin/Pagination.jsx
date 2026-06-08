import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZES } from '../../constants/userRoles';

/**
 * Phân trang.
 *
 * Đặc tính:
 *  - Hiển thị "Hiển thị X – Y / Z" để Admin biết phạm vi.
 *  - Render tối đa 7 nút trang (sliding window) + ellipsis hai đầu nếu nhiều.
 *  - Dropdown đổi page size, sẽ tự reset về trang 0 (xử lý ở hook).
 *  - Vô hiệu hoá khi đang loading để tránh spam request.
 *
 * Lưu ý: backend dùng page 0-indexed, UI hiện 1-indexed.
 */
export default function Pagination({ pageInfo, onPageChange, onSizeChange, disabled }) {
  const { page, size, totalElements, totalPages, first, last } = pageInfo;

  if (totalElements === 0) return null;

  const start = page * size + 1;
  const end   = Math.min((page + 1) * size, totalElements);

  // Sinh ra mảng các trang để hiển thị, có chèn 'ellipsis'
  const pages = buildPageList(page, totalPages);

  return (
    <div className="au-pagination">
      <span className="au-pagination__info">
        Hiển thị <strong>{start}</strong>–<strong>{end}</strong> trên{' '}
        <strong>{totalElements}</strong> người dùng
      </span>

      <div className="au-pagination__controls">
        <label className="au-pagination__size">
          Số dòng:
          <select
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            disabled={disabled}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <nav className="au-pagination__nav" aria-label="Phân trang">
          <button
            type="button"
            className="au-pagination__btn"
            onClick={() => onPageChange(page - 1)}
            disabled={first || disabled}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {pages.map((p, idx) => (
            p === 'ellipsis' ? (
              // eslint-disable-next-line react/no-array-index-key
              <span key={`e-${idx}`} className="au-pagination__ellipsis">…</span>
            ) : (
              <button
                key={p}
                type="button"
                className={`au-pagination__btn au-pagination__btn--num${p === page ? ' is-active' : ''}`}
                onClick={() => onPageChange(p)}
                disabled={disabled}
                aria-current={p === page ? 'page' : undefined}
              >
                {p + 1}
              </button>
            )
          ))}

          <button
            type="button"
            className="au-pagination__btn"
            onClick={() => onPageChange(page + 1)}
            disabled={last || disabled}
            aria-label="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      </div>
    </div>
  );
}

/**
 * Sinh ra danh sách số trang để hiển thị, kèm ellipsis.
 * Quy tắc: luôn show trang đầu, trang cuối, current ±1, còn lại là …
 *
 *   total <= 7:   tất cả các trang
 *   total >  7:   [0] ... [c-1] [c] [c+1] ... [last]
 */
function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const pages = new Set([0, total - 1, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('ellipsis');
    result.push(sorted[i]);
  }
  return result;
}
