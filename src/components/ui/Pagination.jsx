import { ChevronLeft, ChevronRight } from 'lucide-react';
import { classNames } from '../../utils/helpers';
import './Pagination.css';

const buildRange = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const range = [];
  const add = (val) => range.push(val);
  add(1);
  if (current > 4) add('…');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) add(i);
  if (current < total - 3) add('…');
  add(total);
  return range;
};

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  onPageSizeChange,
  totalItems,
  showPageSize = true,
}) => {
  const range = buildRange(currentPage, totalPages);

  const handleClick = (page) => {
    if (!onPageChange) return;
    if (page === '…' || page < 1 || page > totalPages) return;
    if (page === currentPage) return;
    onPageChange(page);
  };

  if (totalPages <= 1 && !showPageSize) {
    return null;
  }

  return (
    <div className="pagination">
      <div className="pagination__info">
        {typeof totalItems === 'number' && (
          <span>
            Showing <strong>{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</strong> -{' '}
            <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong>{totalItems}</strong>
          </span>
        )}
      </div>
      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__nav"
          onClick={() => handleClick(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="pagination__pages">
          {range.map((page, index) => (
            <button
              key={`${page}-${index}`}
              type="button"
              className={classNames('pagination__page', {
                'pagination__page--active': page === currentPage,
                'pagination__page--ellipsis': page === '…',
              })}
              onClick={() => handleClick(page)}
              disabled={page === '…'}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="pagination__nav"
          onClick={() => handleClick(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      {showPageSize && onPageSizeChange && (
        <div className="pagination__page-size">
          <label>
            Rows per page
            <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
};

export default Pagination;