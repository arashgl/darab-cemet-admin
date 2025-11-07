import {
  useCreateLandingSetting,
  useDeleteLandingSetting,
  useGetLandingSettings,
  useUpdateLandingSetting,
} from '@/api/landing-settings';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { showToast } from '@/lib/toast';
import { LandingSetting } from '@/types/dashboard';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CkEditor } from '@/components/dashboard/CKEditor';

const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export function LandingSettingsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<LandingSetting | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3100';

  const { data: settings = [], isLoading } = useGetLandingSettings();
  const createMutation = useCreateLandingSetting();
  const updateMutation = useUpdateLandingSetting();
  const deleteMutation = useDeleteLandingSetting();

  const handleCreate = async (formData: FormData) => {
    try {
      await createMutation.mutateAsync(formData);
      showToast.success('تنظیمات با موفقیت ایجاد شد');
      setIsCreateDialogOpen(false);
    } catch {
      showToast.error('خطا در ایجاد تنظیمات');
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!selectedSetting) return;
    try {
      await updateMutation.mutateAsync({ id: selectedSetting.id, formData });
      showToast.success('تنظیمات با موفقیت بروزرسانی شد');
      setIsEditDialogOpen(false);
      setSelectedSetting(null);
    } catch {
      showToast.error('خطا در بروزرسانی تنظیمات');
    }
  };

  const handleDelete = async () => {
    if (!selectedSetting) return;
    try {
      await deleteMutation.mutateAsync(selectedSetting.id);
      showToast.success('تنظیمات با موفقیت حذف شد');
      setIsDeleteDialogOpen(false);
      setSelectedSetting(null);
    } catch {
      showToast.error('خطا در حذف تنظیمات');
    }
  };

  const openEditDialog = (setting: LandingSetting) => {
    setSelectedSetting(setting);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (setting: LandingSetting) => {
    setSelectedSetting(setting);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-neutral-50"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">تنظیمات لندینگ</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            مدیریت تنظیمات صفحه اصلی
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          افزودن تنظیمات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settings.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-700 font-mono">
                  {setting.key}
                </span>
              </div>
              <CardTitle className="text-lg">{setting.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {stripHtml(setting.description)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {setting.image && (
                <img
                  src={`${apiUrl}/${setting.image}`}
                  alt={setting.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditDialog(setting)}
                >
                  <Edit className="h-4 w-4 ml-2" />
                  ویرایش
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => openDeleteDialog(setting)}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {settings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              هیچ تنظیماتی یافت نشد
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              افزودن اولین تنظیمات
            </Button>
          </CardContent>
        </Card>
      )}

      <LandingSettingFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreate}
        title="افزودن تنظیمات جدید"
        apiUrl={apiUrl}
      />

      <LandingSettingFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedSetting(null);
        }}
        onSubmit={handleUpdate}
        title="ویرایش تنظیمات"
        initialData={selectedSetting || undefined}
        apiUrl={apiUrl}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف تنظیمات</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این تنظیمات اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface LandingSettingFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  title: string;
  initialData?: LandingSetting;
  apiUrl: string;
}

function LandingSettingFormDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  apiUrl,
}: LandingSettingFormDialogProps) {
  const [key, setKey] = useState(initialData?.key || '');
  const [titleValue, setTitleValue] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData?.image ? `${apiUrl}/${initialData.image}` : ''
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('key', key);
    formData.append('title', titleValue);
    formData.append('description', description);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    onSubmit(formData);
    setKey('');
    setTitleValue('');
    setDescription('');
    setImageFile(null);
    setImagePreview('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            فیلدهای مورد نیاز را پر کنید
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">کلید (Key)</label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="مثال: hero_section, about_us"
              required
              pattern="[a-zA-Z0-9_-]+"
              title="فقط حروف انگلیسی، اعداد، خط تیره و زیرخط مجاز است"
            />
            <p className="text-xs text-neutral-500">
              از این کلید برای جستجو استفاده می‌شود (فقط انگلیسی، اعداد و _-)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">عنوان</label>
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              placeholder="عنوان تنظیمات"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">توضیحات</label>
            <CkEditor
              initialContent={description}
              onChange={setDescription}
              apiUrl={apiUrl}
              onError={(msg) => showToast.error(msg)}
              onSuccess={(msg) => showToast.success(msg)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">تصویر</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!initialData}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md mt-2"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Error';
                }}
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              لغو
            </Button>
            <Button type="submit">
              {initialData ? 'بروزرسانی' : 'ایجاد'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
