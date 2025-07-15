import { EmptyState, ErrorMessage, LoadingSpinner } from '@/components/atoms';
import { PaginationControls } from '@/components/molecules';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Product } from '@/types/product';
import { Package } from 'lucide-react';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  error?: Error | null;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  apiUrl: string;
  pagination: {
    currentPage: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onRetry?: () => void;
}

export function ProductsTable({
  products,
  isLoading,
  error,
  onEdit,
  onDelete,
  apiUrl,
  pagination,
  onPageChange,
  onRetry,
}: ProductsTableProps) {
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
        message={error.message || 'خطا در دریافت محصولات'}
        retry={onRetry}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="محصولی یافت نشد"
        description="هیچ محصولی موجود نیست. اولین محصول خود را اضافه کنید!"
        icon={<Package className="h-12 w-12" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-start">تصویر</TableHead>
            <TableHead className="text-start">عنوان</TableHead>
            <TableHead className="text-start">نوع</TableHead>
            <TableHead className="text-start">تاریخ ایجاد</TableHead>
            <TableHead className="text-start">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.image ? (
                  <img
                    src={`${apiUrl}/${product.image}`}
                    alt={product.name}
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs">بدون تصویر</span>
                  </div>
                )}
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                {product.type === 'cement'
                  ? 'سیمان'
                  : product.type === 'concrete'
                  ? 'بتن'
                  : 'سایر'}
              </TableCell>
              <TableCell>
                {product.createdAt
                  ? new Date(product.createdAt).toLocaleDateString('fa-IR')
                  : '-'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                  >
                    ویرایش
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                  >
                    حذف
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
        className="mt-6"
      />
    </div>
  );
}
