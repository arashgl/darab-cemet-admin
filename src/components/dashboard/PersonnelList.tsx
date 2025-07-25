import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { PaginationMeta, Personnel } from '@/types/dashboard';

interface PersonnelListProps {
  personnel: Personnel[];
  isLoading: boolean;
  onEdit: (personnel: Personnel) => void;
  onDelete: (id: string) => void;
  apiUrl: string;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function PersonnelList({
  personnel,
  isLoading,
  onEdit,
  onDelete,
  apiUrl,
  pagination,
  onPageChange,
}: PersonnelListProps) {
  const { currentPage, totalPages } = pagination;

  // Generate page numbers array for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of the middle pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - 3);
      }

      // Add ellipsis if needed at the beginning
      if (start > 2) {
        pageNumbers.push('ellipsis-start');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed at the end
      if (end < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }

      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-50">
        نیروهای انسانی موجود
      </h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-neutral-50"></div>
        </div>
      ) : personnel.length > 0 ? (
        <div className="space-y-6 animate-fade-up">
          <div className="grid gap-4">
            {personnel.map((person) => (
              <Card
                key={person.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-lg border-neutral-300 dark:border-neutral-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-4">
                  {person.personnelImage && (
                    <div className="col-span-1">
                      <img
                        src={`${apiUrl}/${person.personnelImage}`}
                        alt={person.title}
                        className="w-full h-full object-cover aspect-square"
                      />
                    </div>
                  )}
                  <CardContent
                    className={`p-6 ${
                      person.personnelImage ? 'col-span-3' : 'col-span-4'
                    }`}
                  >
                    <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50">
                      {person.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-3">
                      {person.personnelInfo}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {new Date(person.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(person)}
                        >
                          ویرایش
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(person.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination dir="rtl" className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && onPageChange(currentPage - 1)
                    }
                    size="sm"
                    className={
                      currentPage === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) =>
                  typeof page === 'number' ? (
                    <PaginationItem key={index}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => onPageChange(page)}
                        size="sm"
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={index}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages && onPageChange(currentPage + 1)
                    }
                    size="sm"
                    className={
                      currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      ) : (
        <Card className="border-dashed border-2 flex items-center justify-center h-64 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700">
          <CardContent className="text-center p-6">
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              هیچ نیروی انسانی یافت نشد. اولین نیروی انسانی خود را ایجاد کنید!
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
