import { useCreatePersonnel } from '@/api/personnel';
import { Button } from '@/components/ui/button';
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
import { PersonnelType } from '@/types/dashboard';
import { useState } from 'react';

interface CreatePersonnelFormProps {
  onSuccess: (message: string) => void;
}

export function CreatePersonnelForm({ onSuccess }: CreatePersonnelFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<PersonnelType>(
    PersonnelType.ASSISTANT
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const createPersonnelMutation = useCreatePersonnel();
  const { handleError } = useErrorHandler();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Preview image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append('type', selectedType);

    try {
      await createPersonnelMutation.mutateAsync(formData);
      onSuccess('نیروی انسانی با موفقیت ایجاد شد!');
      (e.target as HTMLFormElement).reset();
      setSelectedType(PersonnelType.ASSISTANT);
      setPreviewImage(null);
    } catch (error) {
      handleError(error, 'ایجاد نیروی انسانی با مشکل مواجه شد');
    } finally {
      setIsSubmitting(false);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">نام و نام خانوادگی</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            className="w-full"
            placeholder="نام و نام خانوادگی را وارد کنید"
          />
        </div>

        <div>
          <Label htmlFor="position">سمت</Label>
          <Input
            id="position"
            name="position"
            type="text"
            required
            className="w-full"
            placeholder="سمت را وارد کنید"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="education">تحصیلات</Label>
          <Input
            id="education"
            name="education"
            type="text"
            required
            className="w-full"
            placeholder="تحصیلات را وارد کنید"
          />
        </div>

        <div>
          <Label htmlFor="workplace">محل کار</Label>
          <Input
            id="workplace"
            name="workplace"
            type="text"
            required
            className="w-full"
            placeholder="محل کار را وارد کنید"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">شماره تلفن</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            className="w-full"
            placeholder="شماره تلفن را وارد کنید"
          />
        </div>

        <div>
          <Label htmlFor="email">ایمیل</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="w-full"
            placeholder="ایمیل را وارد کنید"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="experience">تجربه کاری</Label>
        <Textarea
          id="experience"
          name="experience"
          required
          className="w-full min-h-[80px]"
          placeholder="تجربه کاری را وارد کنید"
        />
      </div>

      <div>
        <Label htmlFor="resume">رزومه</Label>
        <Textarea
          id="resume"
          name="resume"
          required
          className="w-full min-h-[120px]"
          placeholder="رزومه را وارد کنید"
        />
      </div>

      <div>
        <Label htmlFor="additionalInfo">اطلاعات اضافی (اختیاری)</Label>
        <Textarea
          id="additionalInfo"
          name="additionalInfo"
          className="w-full min-h-[80px]"
          placeholder="اطلاعات اضافی را وارد کنید"
        />
      </div>

      <div>
        <Label htmlFor="type">نوع پرسنل</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as PersonnelType)}
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
        <Label htmlFor="image">تصویر (اختیاری)</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          className="w-full"
          onChange={handleImageUpload}
        />
        <p className="text-xs text-neutral-500 mt-1">
          حداکثر اندازه فایل: 5MB - فرمت‌های مجاز: JPG, PNG, GIF
        </p>
        {previewImage && (
          <div className="mt-2">
            <img
              src={previewImage}
              alt="پیش‌نمایش تصویر"
              className="max-h-40 rounded-md border"
            />
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'در حال ایجاد...' : 'ایجاد نیروی انسانی'}
      </Button>
    </form>
  );
}
