import { useDeleteProduct, useProducts } from '@/api/products';
import { ProductForm } from '@/components/dashboard/ProductForm';
import { ProductsTable } from '@/components/organisms/ProductsTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { showToast } from '@/lib/toast';
import { Product } from '@/types/product';
import { useState } from 'react';

export function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // React Query hooks
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts({
    page: currentPage,
    limit: 10,
  });

  const deleteProductMutation = useDeleteProduct();

  // Event handlers
  const handleAddNew = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProductMutation.mutateAsync(productToDelete);
      showToast.success('محصول با موفقیت حذف شد.');
      setProductToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch {
      showToast.error('خطا در حذف محصول.');
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    refetchProducts();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">مدیریت محصولات</h1>
        <Button onClick={handleAddNew}>افزودن محصول جدید</Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedProduct ? 'ویرایش محصول' : 'افزودن محصول'}
            </CardTitle>
            <CardDescription>اطلاعات محصول را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm
              product={selectedProduct}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ProductsTable
              products={productsData?.items || []}
              isLoading={productsLoading}
              error={productsError}
              onEdit={handleEdit}
              onDelete={handleDelete}
              apiUrl={import.meta.env.VITE_API_URL || 'http://localhost:3100'}
              pagination={{
                currentPage: productsData?.pagination.page || 1,
                totalPages: productsData?.pagination.pages || 1,
              }}
              onPageChange={handlePageChange}
              onRetry={refetchProducts}
            />
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تایید حذف محصول</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این محصول اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>
              انصراف
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
