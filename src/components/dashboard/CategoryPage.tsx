import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { showToast } from '@/lib/toast';
import api from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { Category } from '@/types/dashboard';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select';

export function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3100';

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/categories`);
      setCategories(response.data || []);
    } catch {
      showToast.error('دریافت دسته‌بندی‌ها با مشکل مواجه شد');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
        await api.patch(`${apiUrl}/categories/${editingCategory.id}`, payload);
        showToast.success('دسته‌بندی با موفقیت بروزرسانی شد');
      } else {
        await api.post(`${apiUrl}/categories`, payload);
        showToast.success('دسته‌بندی با موفقیت ایجاد شد');
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      if (
        error instanceof AxiosError &&
        error.response?.data.statusCode === 409
      ) {
        showToast.error('این دسته‌بندی قبلا ایجاد شده است');
      } else {
        showToast.error('ذخیره دسته‌بندی با مشکل مواجه شد');
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug || '',
      description: category.description || '',
      parentId: category.parentId ? String(category.parentId) : '',
    });
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await api.delete(`${apiUrl}/categories/${categoryToDelete.id}`);
      showToast.success('دسته‌بندی با موفقیت حذف شد');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
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
          {isLoading ? (
            <div className="text-center py-4">در حال بارگذاری...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4">هیچ دسته‌بندی وجود ندارد</div>
          ) : (
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
                  const parent = categories.find(
                    (cat) => cat.id === category.parentId
                  );
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
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
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
