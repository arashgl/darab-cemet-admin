import { uploadClient } from '@/api/client';
import { usePost } from '@/api/posts';
import { CkEditor } from '@/components/dashboard/CKEditor';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AttachmentFile, FileUploader } from '@/components/ui/file-uploader';
import { Input } from '@/components/ui/input';
import { POST_SECTIONS, PostSection } from '@/constants/posts';
import { showToast } from '@/lib/toast';
import { getErrorMessage } from '@/utils/error';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch post data
  const {
    data: post,
    isLoading: isLoadingPost,
    error: postError,
  } = usePost(id!);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [leadPictureFile, setLeadPictureFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    section: PostSection.NEWS,
    categoryId: null as number | null,
  });

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await uploadClient.get(`${apiUrl}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        showToast.error('دریافت دسته‌بندی‌ها با مشکل مواجه شد.');
      }
    };

    fetchCategories();
  }, [apiUrl]);

  // Load post data into form
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        description: post.description || '',
        content: post.content || '',
        section: (post.section as PostSection) || PostSection.NEWS,
        categoryId: post.categoryId || null,
      });

      // Set tags
      if (post.tags && Array.isArray(post.tags)) {
        setTags(post.tags);
      }

      // Set existing gallery
      if (post.gallery) {
        const galleryArray = Array.isArray(post.gallery)
          ? post.gallery
          : [post.gallery];
        setExistingGallery(galleryArray);
      }

      // Set existing attachments
      if (post.attachments && Array.isArray(post.attachments)) {
        setExistingAttachments(post.attachments);
      }

      // Set preview image
      if (post.leadPicture) {
        setPreviewImage(`${apiUrl}/${post.leadPicture}`);
      }
    }
  }, [post, apiUrl]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      section: e.target.value as PostSection,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: e.target.value ? parseInt(e.target.value) : null,
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleLeadPictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLeadPictureFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (index: number) => {
    setExistingGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      showToast.error('شناسه پست یافت نشد');
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('content', formData.content);
    data.append('section', formData.section);

    if (formData.categoryId) {
      data.append('categoryId', formData.categoryId.toString());
    }

    // Add tags - each tag as separate field
    tags.forEach((tag) => {
      data.append('tags[]', tag);
    });

    // Add lead picture if changed
    if (leadPictureFile) {
      data.append('leadPicture', leadPictureFile);
    }

    // Add new gallery files
    galleryFiles.forEach((file) => {
      data.append('gallery', file, file.name);
    });

    // Keep existing gallery (send as JSON)
    if (existingGallery.length > 0) {
      data.append('existingGallery', JSON.stringify(existingGallery));
    }

    // Add attachments
    attachments.forEach((attachment) => {
      data.append('attachments', attachment.file, attachment.file.name);
    });

    // Keep existing attachments (send as JSON)
    if (existingAttachments.length > 0) {
      data.append('existingAttachments', JSON.stringify(existingAttachments));
    }

    try {
      await uploadClient.patch(`/posts/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast.success('پست با موفقیت ویرایش شد');
      navigate('/posts');
    } catch (error) {
      console.error('Error updating post:', error);
      showToast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPost) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">خطا در بارگذاری پست</p>
        <Button onClick={() => navigate('/posts')}>بازگشت به لیست</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/posts')}
          className="mb-4"
        >
          <ArrowLeft className="ml-2 h-4 w-4" />
          بازگشت به لیست
        </Button>
        <h1 className="text-3xl font-bold">ویرایش پست</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات پایه</CardTitle>
            <CardDescription>اطلاعات اصلی پست را ویرایش کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">عنوان *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="عنوان پست"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                توضیحات کوتاه *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full min-h-[100px] p-3 border rounded-md"
                placeholder="توضیحات کوتاه پست"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">بخش *</label>
                <select
                  value={formData.section}
                  onChange={handleSectionChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {POST_SECTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  دسته‌بندی
                </label>
                <select
                  value={formData.categoryId || ''}
                  onChange={handleCategoryChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">بدون دسته‌بندی</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">برچسب‌ها</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addTag())
                  }
                  placeholder="برچسب جدید"
                />
                <Button type="button" onClick={addTag}>
                  افزودن
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Picture */}
        <Card>
          <CardHeader>
            <CardTitle>تصویر شاخص</CardTitle>
          </CardHeader>
          <CardContent>
            {previewImage && (
              <div className="mb-4">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w-xs rounded-lg"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handleLeadPictureChange}
            />
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>محتوای اصلی</CardTitle>
          </CardHeader>
          <CardContent>
            <CkEditor
              initialContent={formData.content}
              onChange={handleContentChange}
              apiUrl={apiUrl}
              onError={(msg) => showToast.error(msg)}
              onSuccess={(msg) => showToast.success(msg)}
            />
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>گالری تصاویر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Gallery */}
            {existingGallery.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">تصاویر موجود:</p>
                <div className="grid grid-cols-4 gap-4">
                  {existingGallery.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={`${apiUrl}/${img}`}
                        alt={`Gallery ${idx}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingGalleryImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Gallery Files */}
            {galleryFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">تصاویر جدید:</p>
                <div className="grid grid-cols-4 gap-4">
                  {galleryFiles.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryFile(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
            />
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>پیوست‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Attachments */}
            {existingAttachments.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">پیوست‌های موجود:</p>
                <div className="space-y-2">
                  {existingAttachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm">
                        {att.originalname || att.filename}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FileUploader
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              maxFiles={10}
              maxFileSize={10}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              'ذخیره تغییرات'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/posts')}
          >
            انصراف
          </Button>
        </div>
      </form>
    </div>
  );
}
