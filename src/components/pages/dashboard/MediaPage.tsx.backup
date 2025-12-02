import { useDeleteMedia, useMediaList } from '@/api/media';
import { CreateMediaDialog } from '@/components/dashboard/CreateMediaDialog';
import { PaginationControls } from '@/components/molecules/PaginationControls';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MediaItem } from '@/types/dashboard';
import { FileText, Image, Link, LoaderCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3100';

export function MediaPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<
    'all' | 'gallery' | 'iframe' | 'url'
  >('all');

  const deleteMediaMutation = useDeleteMedia();

  const {
    data: mediaResponse,
    isLoading,
    error,
    refetch,
  } = useMediaList({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
  });

  const media = mediaResponse?.data || [];
  const meta = mediaResponse?.meta || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value as 'all' | 'gallery' | 'iframe' | 'url');
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setCurrentPage(1);
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await deleteMediaMutation.mutateAsync(id);
      // Toast notification would be handled by the mutation's onSuccess
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const getTypeIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'gallery':
        return <Image className="h-4 w-4" />;
      case 'iframe':
        return <FileText className="h-4 w-4" />;
      case 'url':
        return <Link className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: MediaItem['type']) => {
    switch (type) {
      case 'gallery':
        return 'default';
      case 'iframe':
        return 'secondary';
      case 'url':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTypeLabel = (type: MediaItem['type']) => {
    switch (type) {
      case 'gallery':
        return 'گالری';
      case 'iframe':
        return 'فریم';
      case 'url':
        return 'لینک';
      default:
        return type;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fa-IR');
    } catch {
      return '-';
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">مدیریت رسانه‌ها</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>خطا در دریافت رسانه‌ها: {error.message}</p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="mt-4"
              >
                تلاش مجدد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">مدیریت رسانه‌ها</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="جستجو در عنوان رسانه‌ها..."
                value={searchTerm}
                onChange={handleSearch}
                data-testid="media-search-input"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger data-testid="media-type-filter">
                  <SelectValue placeholder="نوع رسانه" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه انواع</SelectItem>
                  <SelectItem value="gallery">گالری</SelectItem>
                  <SelectItem value="iframe">فریم</SelectItem>
                  <SelectItem value="url">لینک</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={!searchTerm && selectedType === 'all'}
              data-testid="media-reset-filters"
            >
              پاک کردن فیلتر
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>لیست رسانه‌ها</CardTitle>
              <CardDescription>
                مجموع {meta.totalItems} مورد رسانه
              </CardDescription>
            </div>
            <CreateMediaDialog />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
          ) : media.length > 0 ? (
            <>
              <Table data-testid="media-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-start">پیش‌نمایش</TableHead>
                    <TableHead className="text-start">عنوان</TableHead>
                    <TableHead className="text-start">نوع</TableHead>
                    <TableHead className="text-start">تاریخ ایجاد</TableHead>
                    <TableHead className="text-start">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {media.map((item) => (
                    <TableRow
                      key={item.id}
                      data-testid={`media-row-${item.id}`}
                    >
                      <TableCell>
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                          {item.coverImage ? (
                            <img
                              onError={() => {
                                item.coverImage = `${apiUrl}/default-image.png`;
                              }}
                              src={
                                item.coverImage.startsWith('http')
                                  ? item.coverImage
                                  : `${apiUrl}${item.coverImage}`
                              }
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getTypeIcon(item.type)
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                              {item.description}
                            </p>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {item.tags.slice(0, 2).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getTypeBadgeVariant(item.type)}
                          className="gap-1"
                        >
                          {getTypeIcon(item.type)}
                          {getTypeLabel(item.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                data-testid={`media-delete-${item.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">حذف</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف رسانه</AlertDialogTitle>
                                <AlertDialogDescription>
                                  آیا مطمئن هستید که می‌خواهید رسانه "
                                  {item.title}" را حذف کنید؟ این عمل قابل بازگشت
                                  نیست.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>انصراف</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteMedia(item.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteMediaMutation.isPending}
                                >
                                  {deleteMediaMutation.isPending
                                    ? 'در حال حذف...'
                                    : 'حذف'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta.totalPages > 1 && (
                <PaginationControls
                  currentPage={meta.currentPage}
                  totalPages={meta.totalPages}
                  onPageChange={handlePageChange}
                  className="mt-6"
                  data-testid="media-pagination"
                />
              )}
            </>
          ) : (
            <div className="text-center py-12" data-testid="media-empty-state">
              <Image className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                هیچ رسانه‌ای یافت نشد
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400">
                {searchTerm || selectedType !== 'all'
                  ? 'نتیجه‌ای برای جستجوی شما یافت نشد.'
                  : 'هنوز هیچ رسانه‌ای اضافه نشده است.'}
              </p>
              {(searchTerm || selectedType !== 'all') && (
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="mt-4"
                >
                  پاک کردن فیلتر
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
