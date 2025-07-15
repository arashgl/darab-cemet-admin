import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LexicalEditor } from './LexicalEditor';
import { uploadApi } from '@/lib/api';
import axios, { AxiosError } from 'axios';
import { ApiError } from '@/types/dashboard';
import { X } from 'lucide-react';
import { sections, PostSection } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface CreatePostFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  apiUrl: string;
}

export function CreatePostForm({
  onSuccess,
  onError,
  apiUrl,
}: CreatePostFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [leadPictureFile, setLeadPictureFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    content: '',
    section: PostSection.NEWS,
    categoryId: null as number | null,
  });

  useEffect(() => {
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        onError('دریافت دسته‌بندی‌ها با مشکل مواجه شد.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [apiUrl, onError]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLeadPictureFile(file);

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'categoryId') {
      setNewPost((prev) => ({
        ...prev,
        [name]: value ? parseInt(value, 10) : null,
      }));
    } else {
      setNewPost((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (html: string) => {
    setNewPost((prev) => ({
      ...prev,
      content: html,
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newPost.title ||
      !newPost.content ||
      !newPost.description ||
      !leadPictureFile
    ) {
      onError('لطفا تمام فیلدها را پر کنید و یک تصویر انتخاب کنید');
      return;
    }

    setIsCreating(true);

    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('description', newPost.description);
      formData.append('content', newPost.content);
      formData.append('section', newPost.section);

      // Add categoryId if selected
      if (newPost.categoryId !== null) {
        formData.append('categoryId', newPost.categoryId.toString());
      }

      // Add tags to the form data
      if (tags.length > 0) {
        // Add each tag as a separate entry with the same key name
        tags.forEach((tag) => {
          formData.append('tags[]', tag);
        });
      } else {
        // Send an empty array for tags
        formData.append('tags[]', '');
      }

      if (leadPictureFile) {
        formData.append('leadPicture', leadPictureFile, leadPictureFile.name);
      }

      const response = await uploadApi.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Server response:', response.data);

      onSuccess('پست با موفقیت ایجاد شد!');
      setNewPost({
        title: '',
        description: '',
        content: '',
        section: PostSection.NEWS,
        categoryId: null,
      });
      setTags([]);
      setTagInput('');
      setLeadPictureFile(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Error creating post:', error);
      let errorMessage = 'ایجاد پست با مشکل مواجه شد. لطفا دوباره تلاش کنید.';

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;
        console.error('API error:', axiosError.response?.data);
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      onError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="border-neutral-300 dark:border-neutral-700 shadow-lg">
      <CardHeader>
        <CardTitle>ایجاد پست جدید</CardTitle>
        <CardDescription>یک پست جدید به وب‌سایت خود اضافه کنید</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={createPost} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                عنوان
              </label>
              <Input
                id="title"
                name="title"
                placeholder="عنوان پست"
                value={newPost.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="section" className="text-sm font-medium">
                بخش
              </label>
              <select
                id="section"
                name="section"
                value={newPost.section}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
              >
                {sections.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="categoryId" className="text-sm font-medium">
              دسته‌بندی
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={
                newPost.categoryId === null ? '' : newPost.categoryId.toString()
              }
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
            >
              <option value="">انتخاب دسته‌بندی</option>
              {isLoading ? (
                <option disabled>در حال بارگذاری...</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              توضیحات کوتاه
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="توضیح مختصر درباره پست"
              value={newPost.description}
              onChange={handleChange}
              required
              rows={2}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              برچسب‌ها
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md"
                >
                  <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
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
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="leadPicture" className="text-sm font-medium">
              تصویر اصلی
            </label>
            <Input
              id="leadPicture"
              name="leadPicture"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              required={!leadPictureFile}
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
              onChange={handleContentChange}
              apiUrl={apiUrl}
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
              'ایجاد پست'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
