import { CreateMediaData, useCreateExternalMedia } from '@/api/media';
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
import { MediaItem } from '@/types/dashboard';
import { X } from 'lucide-react';
import { useState } from 'react';

interface CreateMediaFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function CreateMediaForm({ onSuccess, onError }: CreateMediaFormProps) {
  const [formData, setFormData] = useState<
    Omit<CreateMediaData, 'galleryFiles'>
  >({
    title: '',
    description: '',
    type: 'gallery',
    url: '',
    coverImage: '', // String URL for iframe/url types
    tags: [],
  });
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState('');

  const createExternalMediaMutation = useCreateExternalMedia();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: MediaItem['type']) => {
    setFormData((prev) => ({ ...prev, type: value, url: '', coverImage: '' }));
    // Clear files when changing type
    setGalleryFiles([]);
  };

  const handleGalleryFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles(files);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...(prev.tags || []), tagInput.trim()],
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'gallery',
      url: '',
      coverImage: '',
      tags: [],
    });
    setGalleryFiles([]);
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      onError('لطفا عنوان رسانه را وارد کنید');
      return;
    }

    // Validation based on media type requirements per DTO
    if (formData.type === 'gallery') {
      // Gallery requires: title + galleryFiles
      if (galleryFiles.length === 0) {
        onError('لطفا فایل‌های گالری را انتخاب کنید');
        return;
      }
    } else if (formData.type === 'iframe' || formData.type === 'url') {
      // iframe and url require: title + url + coverImage (URL string)
      if (!formData.url) {
        onError('لطفا آدرس رسانه را وارد کنید');
        return;
      }

      if (!formData.coverImage) {
        onError('لطفا آدرس تصویر پیش‌نمایش را وارد کنید');
        return;
      }

      // URL validation for both url and coverImage
      try {
        new URL(formData.url);
      } catch {
        onError('لطفا آدرس معتبری وارد کنید');
        return;
      }

      try {
        new URL(formData.coverImage as string);
      } catch {
        onError('لطفا آدرس معتبری برای تصویر پیش‌نمایش وارد کنید');
        return;
      }
    }

    try {
      const mediaData: CreateMediaData = {
        ...formData,
        galleryFiles: formData.type === 'gallery' ? galleryFiles : undefined,
      };

      await createExternalMediaMutation.mutateAsync(mediaData);

      onSuccess('رسانه با موفقیت ایجاد شد!');
      resetForm();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'ایجاد رسانه با مشکل مواجه شد';
      onError(errorMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      data-testid="create-media-form"
    >
      <div className="space-y-2">
        <Label htmlFor="title">
          عنوان رسانه <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="عنوان رسانه را وارد کنید"
          required
          data-testid="media-title-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">توضیحات</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="توضیحات اختیاری درباره رسانه"
          rows={3}
          data-testid="media-description-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">
          نوع رسانه <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.type}
          onValueChange={handleTypeChange}
          data-testid="media-type-select"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gallery">گالری</SelectItem>
            <SelectItem value="iframe">فریم</SelectItem>
            <SelectItem value="url">لینک</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* URL field - Only shown and required for iframe and url types */}
      {(formData.type === 'iframe' || formData.type === 'url') && (
        <div className="space-y-2">
          <Label htmlFor="url">
            آدرس رسانه <span className="text-red-500">*</span>
          </Label>
          <Input
            id="url"
            name="url"
            type="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="https://example.com/..."
            required
            data-testid="media-url-input"
          />
        </div>
      )}

      {/* Cover Image URL field - Only shown and required for iframe and url types */}
      {(formData.type === 'iframe' || formData.type === 'url') && (
        <div className="space-y-2">
          <Label htmlFor="coverImage">
            آدرس تصویر پیش‌نمایش <span className="text-red-500">*</span>
          </Label>
          <Input
            id="coverImage"
            name="coverImage"
            type="url"
            value={formData.coverImage}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
            required
            data-testid="media-cover-image-input"
          />
          {formData.coverImage && (
            <div className="mt-2">
              <img
                src={formData.coverImage}
                alt="پیش‌نمایش"
                className="max-h-40 rounded-md border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Gallery Files field - Only shown and required for gallery type */}
      {formData.type === 'gallery' && (
        <div className="space-y-2">
          <Label htmlFor="galleryFiles">
            فایل‌های گالری <span className="text-red-500">*</span>
          </Label>
          <Input
            id="galleryFiles"
            name="galleryFiles"
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryFilesUpload}
            required
            data-testid="media-gallery-files-input"
          />
          {galleryFiles.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">
                {galleryFiles.length} فایل انتخاب شده
              </p>
              <div className="grid grid-cols-3 gap-2">
                {galleryFiles.slice(0, 6).map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`گالری ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    {galleryFiles.length > 6 && index === 5 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center text-white text-sm">
                        +{galleryFiles.length - 6}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="tags">برچسب‌ها</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags?.map((tag, index) => (
            <div
              key={index}
              className="flex items-center bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md"
              data-testid={`media-tag-${index}`}
            >
              <span className="text-sm">{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                data-testid={`remove-tag-${index}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="برچسب را وارد کرده و Enter را بزنید"
          data-testid="media-tags-input"
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={createExternalMediaMutation.isPending}
          className="flex-1"
          data-testid="submit-create-media"
        >
          {createExternalMediaMutation.isPending
            ? 'در حال ایجاد...'
            : 'ایجاد رسانه'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          disabled={createExternalMediaMutation.isPending}
          data-testid="reset-media-form"
        >
          پاک کردن فرم
        </Button>
      </div>
    </form>
  );
}
