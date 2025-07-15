import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/api/categories';
import { DeleteCategoryDialog } from '@/components/dashboard/DeleteCategoryDialog';
import { CategoriesTable } from '@/components/organisms/CategoriesTable';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showToast } from '@/lib/toast';
import { Category } from '@/types/dashboard';
import { useState } from 'react';

export function CategoriesPage() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
  });

  // React Query hooks
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Event handlers
  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', parentId: '' });
    setEditingCategory(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate slug client-side
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.slug)) {
      showToast.error(
        'اسلاگ باید فقط شامل حروف انگلیسی، اعداد، خط تیره و زیرخط باشد'
      );
      return;
    }

    try {
      const payload = {
        ...formData,
        parentId:
          formData.parentId && formData.parentId !== 'none'
            ? Number(formData.parentId)
            : undefined,
      };

      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          ...payload,
        });
        showToast.success('دسته‌بندی با موفقیت بروزرسانی شد');
      } else {
        await createCategoryMutation.mutateAsync(payload);
        showToast.success('دسته‌بندی با موفقیت ایجاد شد');
      }

      resetForm();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'خطا در ذخیره دسته‌بندی';

      if (errorMessage.includes('409')) {
        showToast.error('این دسته‌بندی قبلا ایجاد شده است');
      } else {
        showToast.error(errorMessage);
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId?.toString() || '',
    });
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
      showToast.success('دسته‌بندی با موفقیت حذف شد');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch {
      showToast.error('حذف دسته‌بندی با مشکل مواجه شد');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">مدیریت دسته‌بندی‌ها</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
          </CardTitle>
          <CardDescription>
            {editingCategory
              ? 'اطلاعات دسته‌بندی را ویرایش کنید'
              : 'اطلاعات دسته‌بندی جدید را وارد کنید'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">نام دسته‌بندی</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="slug">اسلاگ (انگلیسی، یکتا)</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  pattern="^[a-zA-Z0-9_-]+$"
                  title="فقط حروف انگلیسی، اعداد، خط تیره و زیرخط مجاز است"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="description">توضیحات</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="parentId">دسته‌بندی والد (اختیاری)</Label>
                <Select
                  value={formData.parentId === '' ? 'none' : formData.parentId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      parentId: value === 'none' ? '' : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="بدون والد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون والد</SelectItem>
                    {categories
                      .filter(
                        (cat) =>
                          !editingCategory || cat.id !== editingCategory.id
                      )
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 rtl:space-x-reverse">
              {editingCategory && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={resetForm}
                  className="ml-2"
                >
                  انصراف
                </Button>
              )}
              <Button type="submit">
                {editingCategory ? 'بروزرسانی' : 'ذخیره'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>لیست دسته‌بندی‌ها</CardTitle>
          <CardDescription>مدیریت دسته‌بندی‌های موجود</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoriesTable
            categories={categories}
            isLoading={categoriesLoading}
            error={categoriesError}
            onEdit={handleEdit}
            onDelete={openDeleteDialog}
            onRetry={refetchCategories}
          />
        </CardContent>
      </Card>

      {categoryToDelete && (
        <DeleteCategoryDialog
          isOpen={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          categoryName={categoryToDelete.name}
        />
      )}
    </div>
  );
}
