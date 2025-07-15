import { useCreatePersonnel } from '@/api/personnel';
import { LexicalEditor } from '@/components/dashboard/LexicalEditor';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useState } from 'react';

interface CreatePersonnelFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function CreatePersonnelForm({
  onSuccess,
  onError,
}: CreatePersonnelFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [personnelImageFile, setPersonnelImageFile] = useState<File | null>(
    null
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [newPersonnel, setNewPersonnel] = useState<{
    title: string;
    content: string;
    description: string;
  }>({
    content: '',
    description: '',
    title: '',
  });

  const createPersonnelMutation = useCreatePersonnel();
  const { handleError } = useErrorHandler();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPersonnelImageFile(file);

      // Preview image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const createPersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonnel.title || !personnelImageFile) {
      onError('لطفا تمام فیلدها را پر کنید و یک تصویر انتخاب کنید');
      return;
    }

    setIsCreating(true);

    try {
      const formData = new FormData();
      formData.append('title', newPersonnel.title);
      formData.append('content', newPersonnel.content);

      if (personnelImageFile) {
        formData.append(
          'personnelImage',
          personnelImageFile,
          personnelImageFile.name
        );
      }

      await createPersonnelMutation.mutateAsync(formData);

      onSuccess('نیروی انسانی با موفقیت ایجاد شد!');
      setPersonnelImageFile(null);
      setPreviewImage(null);

      setNewPersonnel({
        title: '',
        description: '',
        content: '',
      });
    } catch (error) {
      handleError(
        error,
        'ایجاد نیروی انسانی با مشکل مواجه شد. لطفا دوباره تلاش کنید.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'categoryId') {
      setNewPersonnel((prev) => ({
        ...prev,
        [name]: value ? parseInt(value, 10) : null,
      }));
    } else {
      setNewPersonnel((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Card className="border-neutral-300 dark:border-neutral-700 shadow-lg">
      <CardHeader>
        <CardTitle>ایجاد نیروی انسانی جدید</CardTitle>
        <CardDescription>اطلاعات نیروی انسانی را وارد کنید</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={createPersonnel} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              عنوان
            </label>
            <Input
              id="title"
              name="title"
              placeholder="عنوان نیروی انسانی"
              value={newPersonnel.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="personnelInfo" className="text-sm font-medium">
              اطلاعات نیرو
            </label>
            <textarea
              id="personnelInfo"
              name="personnelInfo"
              placeholder="اطلاعات تخصصی و شغلی نیرو"
              value={newPersonnel.personnelInfo}
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="personnelImage" className="text-sm font-medium">
              تصویر پرسنلی
            </label>
            <Input
              id="personnelImage"
              name="personnelImage"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              required={!personnelImageFile}
            />
            {previewImage && (
              <div className="mt-2">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-h-40 rounded-md"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              محتوا
            </label>
            <LexicalEditor
              initialContent=""
              onChange={(html) => {
                console.log('Lexical content:', html);
                setNewPersonnel((prev) => ({ ...prev, content: html }));
              }}
              apiUrl={''}
              onError={onError}
              onSuccess={onSuccess}
            />
          </div>

          <Button type="submit" className="w-full mt-8" disabled={isCreating}>
            {isCreating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                در حال ایجاد...
              </>
            ) : (
              'ایجاد نیروی انسانی'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
