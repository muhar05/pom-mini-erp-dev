import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <ul className="pagination flex flex-wrap items-center gap-2 justify-center mt-6">
      <li className="page-item">
        <button
          className="page-link bg-blue-50 dark:bg-primary/25 text-neutral-900 dark:text-white font-medium rounded-lg border-0 px-5 py-2.5 flex items-center justify-center h-12"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="w-6" />
        </button>
      </li>
      <li className="page-item">
        <button
          className="page-link bg-blue-50 dark:bg-primary/25 text-neutral-900 dark:text-white font-medium rounded-lg border-0 flex items-center justify-center h-12 w-12"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-6" />
        </button>
      </li>
      {pages.map((page) => (
        <li className="page-item" key={page}>
          <button
            className={`page-link font-medium rounded-lg border-0 flex items-center justify-center h-12 w-12 ${
              page === currentPage
                ? "bg-primary dark:bg-primary text-white"
                : "bg-blue-50 dark:bg-primary/25 text-neutral-900 dark:text-white"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        </li>
      ))}
      <li className="page-item">
        <button
          className="page-link bg-blue-50 dark:bg-primary/25 text-neutral-900 dark:text-white font-medium rounded-lg border-0 flex items-center justify-center h-12 w-12"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-6" />
        </button>
      </li>
      <li className="page-item">
        <button
          className="page-link bg-blue-50 dark:bg-primary/25 text-neutral-900 dark:text-white font-medium rounded-lg border-0 px-5 py-2.5 flex items-center justify-center h-12"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="w-6" />
        </button>
      </li>
    </ul>
  );
}
