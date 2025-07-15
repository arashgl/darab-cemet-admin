import { useUpdatePersonnel } from '@/api/personnel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Personnel } from '@/types/dashboard';
import { useEffect, useState } from 'react';

interface EditPersonnelDialogProps {
  personnel: Personnel | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  apiUrl: string;
}

export function EditPersonnelDialog({
  personnel,
  isOpen,
  onOpenChange,
  onSuccess,
  apiUrl,
}: EditPersonnelDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [personnelImageFile, setPersonnelImageFile] = useState<File | null>(
    null
  );
  const [currentPersonnel, setCurrentPersonnel] = useState<Personnel | null>(
    null
  );

  const updatePersonnelMutation = useUpdatePersonnel();
  const { handleError } = useErrorHandler();

  // Update local state when personnel changes
  useEffect(() => {
    if (personnel) {
      setCurrentPersonnel(personnel);
    }
  }, [personnel]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPersonnelImageFile(e.target.files[0]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!currentPersonnel) return;

    const { name, value } = e.target;
    setCurrentPersonnel((prev) => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
  };

  const handleUpdatePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPersonnel) return;

    setIsEditing(true);

    try {
      const formData = new FormData();
      formData.append('title', currentPersonnel.title);
      formData.append('personnelInfo', currentPersonnel.personnelInfo);

      if (personnelImageFile) {
        formData.append('personnelImage', personnelImageFile);
      }

      await updatePersonnelMutation.mutateAsync({
        id: currentPersonnel.id,
        formData,
      });

      onSuccess('نیروی انسانی با موفقیت ویرایش شد!');
      onOpenChange(false);
      setPersonnelImageFile(null);
    } catch (error) {
      handleError(
        error,
        'ویرایش نیروی انسانی با مشکل مواجه شد. لطفا دوباره تلاش کنید.'
      );
    } finally {
      setIsEditing(false);
    }
  };

  if (!currentPersonnel) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش نیروی انسانی</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdatePersonnel} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="edit-title" className="text-sm font-medium">
              عنوان
            </label>
            <Input
              id="edit-title"
              name="title"
              placeholder="عنوان نیروی انسانی"
              value={currentPersonnel.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-personnelInfo" className="text-sm font-medium">
              اطلاعات نیرو
            </label>
            <textarea
              id="edit-personnelInfo"
              name="personnelInfo"
              placeholder="اطلاعات تخصصی و شغلی نیرو"
              value={currentPersonnel.personnelInfo}
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="edit-personnelImage"
              className="text-sm font-medium"
            >
              تصویر پرسنلی (اختیاری)
            </label>
            <Input
              id="edit-personnelImage"
              name="personnelImage"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {currentPersonnel.personnelImage && !personnelImageFile && (
              <div className="mt-2">
                <img
                  src={`${apiUrl}/${currentPersonnel.personnelImage}`}
                  alt="Personnel Image"
                  className="max-h-40 rounded-md"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              لغو
            </Button>
            <Button type="submit" disabled={isEditing}>
              {isEditing ? 'در حال ویرایش...' : 'ذخیره تغییرات'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
