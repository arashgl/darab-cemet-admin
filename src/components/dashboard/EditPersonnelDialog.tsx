import { useUpdatePersonnel } from '@/api/personnel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Personnel, PersonnelType } from '@/types/dashboard';
import { useEffect, useState } from 'react';

interface EditPersonnelDialogProps {
  personnel: Personnel | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditPersonnelDialog({
  personnel,
  isOpen,
  onOpenChange,
  onSuccess,
}: EditPersonnelDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Personnel>>({});

  const updatePersonnelMutation = useUpdatePersonnel();
  const { handleError } = useErrorHandler();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3100';

  // Update local state when personnel changes
  useEffect(() => {
    if (personnel) {
      setFormData(personnel);
      setPreviewImage(null);
      setImageFile(null);
    }
  }, [personnel]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Preview image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setPreviewImage(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personnel) return;

    setIsEditing(true);

    try {
      const submitFormData = new FormData();

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          key !== 'id' &&
          key !== 'createdAt' &&
          key !== 'updatedAt'
        ) {
          submitFormData.append(key, value.toString());
        }
      });

      // Add image if selected
      if (imageFile) {
        submitFormData.append('image', imageFile);
      }

      await updatePersonnelMutation.mutateAsync({
        id: personnel.id,
        formData: submitFormData,
      });

      onSuccess();
      onOpenChange(false);
      setImageFile(null);
      setPreviewImage(null);
    } catch (error) {
      handleError(
        error,
        'ویرایش نیروی انسانی با مشکل مواجه شد. لطفا دوباره تلاش کنید.'
      );
    } finally {
      setIsEditing(false);
    }
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

  if (!personnel || !formData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش نیروی انسانی</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">نام و نام خانوادگی</Label>
              <Input
                id="edit-name"
                name="name"
                type="text"
                required
                value={formData.name || ''}
                onChange={handleInputChange}
                placeholder="نام و نام خانوادگی را وارد کنید"
              />
            </div>

            <div>
              <Label htmlFor="edit-position">سمت</Label>
              <Input
                id="edit-position"
                name="position"
                type="text"
                required
                value={formData.position || ''}
                onChange={handleInputChange}
                placeholder="سمت را وارد کنید"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-education">تحصیلات</Label>
              <Input
                id="edit-education"
                name="education"
                type="text"
                required
                value={formData.education || ''}
                onChange={handleInputChange}
                placeholder="تحصیلات را وارد کنید"
              />
            </div>

            <div>
              <Label htmlFor="edit-workplace">محل کار</Label>
              <Input
                id="edit-workplace"
                name="workplace"
                type="text"
                required
                value={formData.workplace || ''}
                onChange={handleInputChange}
                placeholder="محل کار را وارد کنید"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-phone">شماره تلفن</Label>
              <Input
                id="edit-phone"
                name="phone"
                type="tel"
                required
                value={formData.phone || ''}
                onChange={handleInputChange}
                placeholder="شماره تلفن را وارد کنید"
              />
            </div>

            <div>
              <Label htmlFor="edit-email">ایمیل</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                required
                value={formData.email || ''}
                onChange={handleInputChange}
                placeholder="ایمیل را وارد کنید"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-experience">تجربه کاری</Label>
            <Textarea
              id="edit-experience"
              name="experience"
              required
              value={formData.experience || ''}
              onChange={handleInputChange}
              className="min-h-[80px]"
              placeholder="تجربه کاری را وارد کنید"
            />
          </div>

          <div>
            <Label htmlFor="edit-resume">رزومه</Label>
            <Textarea
              id="edit-resume"
              name="resume"
              required
              value={formData.resume || ''}
              onChange={handleInputChange}
              className="min-h-[120px]"
              placeholder="رزومه را وارد کنید"
            />
          </div>

          <div>
            <Label htmlFor="edit-additionalInfo">اطلاعات اضافی (اختیاری)</Label>
            <Textarea
              id="edit-additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo || ''}
              onChange={handleInputChange}
              className="min-h-[80px]"
              placeholder="اطلاعات اضافی را وارد کنید"
            />
          </div>

          <div>
            <Label htmlFor="edit-type">نوع پرسنل</Label>
            <Select
              value={formData.type || PersonnelType.ASSISTANT}
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="نوع پرسنل را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PersonnelType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {getPersonnelTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-image">تصویر (اختیاری)</Label>
            <Input
              id="edit-image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <p className="text-xs text-neutral-500 mt-1">
              حداکثر اندازه فایل: 5MB - فرمت‌های مجاز: JPG, PNG, GIF
            </p>

            {/* Show preview of new image */}
            {previewImage && (
              <div className="mt-2">
                <p className="text-sm text-neutral-600 mb-2">تصویر جدید:</p>
                <img
                  src={previewImage}
                  alt="پیش‌نمایش تصویر جدید"
                  className="max-h-40 rounded-md border"
                />
              </div>
            )}

            {/* Show current image if no new image selected */}
            {!previewImage && personnel.image && (
              <div className="mt-2">
                <p className="text-sm text-neutral-600 mb-2">تصویر فعلی:</p>
                <img
                  src={
                    personnel.image.startsWith('http')
                      ? personnel.image
                      : `${apiUrl}${personnel.image}`
                  }
                  alt="تصویر فعلی"
                  className="max-h-40 rounded-md border"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isEditing}
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
