import { EmptyState, ErrorMessage, LoadingSpinner } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Category } from '@/types/dashboard';
import { FolderTree, Pencil, Trash2 } from 'lucide-react';

interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  error?: Error | null;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onRetry?: () => void;
}

export function CategoriesTable({
  categories,
  isLoading,
  error,
  onEdit,
  onDelete,
  onRetry,
}: CategoriesTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.message || 'خطا در دریافت دسته‌بندی‌ها'}
        retry={onRetry}
      />
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        title="دسته‌بندی‌ای یافت نشد"
        description="هیچ دسته‌بندی موجود نیست. اولین دسته‌بندی خود را ایجاد کنید!"
        icon={<FolderTree className="h-12 w-12" />}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-start">نام</TableHead>
          <TableHead className="text-start">اسلاگ</TableHead>
          <TableHead className="text-start">توضیحات</TableHead>
          <TableHead className="text-start">والد</TableHead>
          <TableHead className="text-start">عملیات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => {
          const parent = categories.find((cat) => cat.id === category.parentId);
          return (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.slug}</TableCell>
              <TableCell>{category.description || '-'}</TableCell>
              <TableCell>{parent ? parent.name : '-'}</TableCell>
              <TableCell className="flex space-x-2 rtl:space-x-reverse">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(category)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
