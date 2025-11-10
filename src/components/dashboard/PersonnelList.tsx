import { Badge } from '@/components/ui/badge';
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
import { PaginationMeta, Personnel, PersonnelType } from '@/types/dashboard';

interface PersonnelListProps {
  personnel: Personnel[];
  isLoading: boolean;
  onEdit: (personnel: Personnel) => void;
  onDelete: (id: string) => void;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function PersonnelList({
  personnel,
  isLoading,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: PersonnelListProps) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3100';

  // Generate page numbers array for pagination
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
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

  const getPersonnelTypeLabel = (type: PersonnelType) => {
    switch (type) {
      case PersonnelType.MANAGER:
        return 'مدیرعامل';
      case PersonnelType.ASSISTANT:
        return 'معاونت';
      case PersonnelType.MANAGERS:
        return 'مدیریت';
      default:
        return type;
    }
  };

  const getPersonnelTypeBadgeVariant = (type: PersonnelType) => {
    switch (type) {
      case PersonnelType.MANAGER:
        return 'default';
      case PersonnelType.ASSISTANT:
        return 'secondary';
      case PersonnelType.MANAGERS:
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-50">
        نیروهای انسانی موجود ({pagination.totalItems} نفر)
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {person.image && (
                    <div className="col-span-1">
                      <img
                        src={
                          person.image.startsWith('http')
                            ? person.image
                            : `${apiUrl}${person.image}`
                        }
                        alt={person.name}
                        className="w-full h-full object-cover aspect-square rounded-lg"
                      />
                    </div>
                  )}
                  <CardContent
                    className={`p-6 ${
                      person.image ? 'col-span-3' : 'col-span-4'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                        {person.name}
                      </h3>
                      <Badge
                        variant={getPersonnelTypeBadgeVariant(person.type)}
                      >
                        {getPersonnelTypeLabel(person.type)}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        <span className="font-medium">سمت:</span>{' '}
                        {person.position}
                      </p>
                      {person.workplace && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                          <span className="font-medium">محل کار:</span>{' '}
                          {person.workplace}
                        </p>
                      )}
                      {person.education && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                          <span className="font-medium">تحصیلات:</span>{' '}
                          {person.education}
                        </p>
                      )}
                      {person.experience && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                          <span className="font-medium">تجربه:</span>{' '}
                          {person.experience}
                        </p>
                      )}
                      {person.phone && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                          <span className="font-medium">تلفن:</span>{' '}
                          {person.phone}
                        </p>
                      )}
                      {person.email && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                          <span className="font-medium">ایمیل:</span>{' '}
                          {person.email}
                        </p>
                      )}
                      {person.additionalInfo && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                          <span className="font-medium">اطلاعات اضافی:</span>{' '}
                          {person.additionalInfo}
                        </p>
                      )}
                    </div>

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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination dir="rtl" className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      pagination.currentPage > 1 &&
                      onPageChange(pagination.currentPage - 1)
                    }
                    size="sm"
                    className={
                      pagination.currentPage === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) =>
                  typeof page === 'number' ? (
                    <PaginationItem key={index}>
                      <PaginationLink
                        isActive={page === pagination.currentPage}
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
                      pagination.currentPage < pagination.totalPages &&
                      onPageChange(pagination.currentPage + 1)
                    }
                    size="sm"
                    className={
                      pagination.currentPage === pagination.totalPages
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
