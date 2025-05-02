import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];

    // Always show first page
    pages.push(1);

    // Add current page and pages around it
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (pages.indexOf(i) === -1) {
        pages.push(i);
      }
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    // Add ellipses if needed
    const result = [];
    let prev = 0;

    for (const page of pages) {
      if (page - prev > 1) {
        result.push(-1); // -1 represents an ellipsis
      }
      result.push(page);
      prev = page;
    }

    return result;
  };

  return (
    <div className="flex items-center justify-center space-x-2 space-x-reverse">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">صفحه قبلی</span>
      </Button>

      {getPageNumbers().map((page, index) =>
        page === -1 ? (
          <span key={`ellipsis-${index}`} className="px-3 py-1">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={currentPage === page ? "pointer-events-none" : ""}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">صفحه بعدی</span>
      </Button>
    </div>
  );
}
