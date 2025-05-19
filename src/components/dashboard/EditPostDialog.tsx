import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LexicalEditor } from "./LexicalEditor";
import { uploadApi } from "@/lib/api";
import axios, { AxiosError } from "axios";
import { ApiError, Post } from "@/types/dashboard";
import { X } from "lucide-react";
import { sections } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface EditPostDialogProps {
  post: Post | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  apiUrl: string;
}

export function EditPostDialog({
  post,
  isOpen,
  onOpenChange,
  onSuccess,
  onError,
  apiUrl,
}: EditPostDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [leadPictureFile, setLeadPictureFile] = useState<File | null>(null);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when post changes
  useEffect(() => {
    if (post) {
      setCurrentPost(post);
    }
  }, [post]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        onError("دریافت دسته‌بندی‌ها با مشکل مواجه شد.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [apiUrl, onError, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLeadPictureFile(e.target.files[0]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!currentPost) return;

    const { name, value } = e.target;

    if (name === "categoryId") {
      setCurrentPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          categoryId: value ? parseInt(value, 10) : null,
        };
      });
    } else {
      setCurrentPost((prev) => {
        if (!prev) return null;
        return { ...prev, [name]: value };
      });
    }
  };

  const handleContentChange = (html: string) => {
    if (!currentPost) return;

    setCurrentPost((prev) => {
      if (!prev) return null;
      return { ...prev, content: html };
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "" && currentPost) {
      e.preventDefault();
      const newTags = [...(currentPost.tags || []), tagInput.trim()];
      setCurrentPost((prev) => {
        if (!prev) return null;
        return { ...prev, tags: newTags };
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!currentPost) return;
    const newTags = (currentPost.tags || []).filter(
      (tag: string) => tag !== tagToRemove
    );
    setCurrentPost((prev) => {
      if (!prev) return null;
      return { ...prev, tags: newTags };
    });
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost) return;

    setIsEditing(true);

    try {
      const formData = new FormData();
      formData.append("title", currentPost.title);
      formData.append("description", currentPost.description);
      formData.append("content", currentPost.content);
      formData.append("section", currentPost.section);

      // Add categoryId if selected
      if (
        currentPost.categoryId !== null &&
        currentPost.categoryId !== undefined
      ) {
        formData.append("categoryId", currentPost.categoryId.toString());
      }

      // Add tags to the form data
      if (currentPost.tags && currentPost.tags.length > 0) {
        // Add each tag as a separate entry with the same key name
        currentPost.tags.forEach((tag) => {
          formData.append("tags[]", tag);
        });
      }

      if (leadPictureFile) {
        formData.append("leadPicture", leadPictureFile);
      }

      await uploadApi.patch(`/posts/${currentPost.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onSuccess("پست با موفقیت ویرایش شد!");
      onOpenChange(false);
      setLeadPictureFile(null);
    } catch (error) {
      let errorMessage = "ویرایش پست با مشکل مواجه شد. لطفا دوباره تلاش کنید.";

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      onError(errorMessage);
    } finally {
      setIsEditing(false);
    }
  };

  if (!currentPost) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش پست</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdatePost} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                عنوان
              </label>
              <Input
                id="edit-title"
                name="title"
                placeholder="عنوان پست"
                value={currentPost.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-section" className="text-sm font-medium">
                بخش
              </label>
              <select
                id="edit-section"
                name="section"
                value={currentPost.section}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
              >
                {sections.map((section) => (
                  <option key={section.value} value={section.value}>
                    {section.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-categoryId" className="text-sm font-medium">
              دسته‌بندی
            </label>
            <select
              id="edit-categoryId"
              name="categoryId"
              value={
                currentPost.categoryId === null ||
                currentPost.categoryId === undefined
                  ? ""
                  : currentPost.categoryId.toString()
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
            <label htmlFor="edit-tags" className="text-sm font-medium">
              برچسب‌ها
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(currentPost.tags || []).map((tag: string, index: number) => (
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
              id="edit-tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="برچسب را وارد کرده و Enter را بزنید"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-description" className="text-sm font-medium">
              توضیحات کوتاه
            </label>
            <textarea
              id="edit-description"
              name="description"
              placeholder="توضیح مختصر درباره پست"
              value={currentPost.description}
              onChange={handleChange}
              required
              rows={2}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-leadPicture" className="text-sm font-medium">
              تصویر اصلی (اختیاری)
            </label>
            <Input
              id="edit-leadPicture"
              name="leadPicture"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {currentPost.leadPicture && !leadPictureFile && (
              <div className="mt-2">
                <img
                  src={`${apiUrl}/${currentPost.leadPicture}`}
                  alt="Lead Picture"
                  className="max-h-40 rounded-md"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-content" className="text-sm font-medium">
              محتوا
            </label>
            <LexicalEditor
              initialContent={currentPost.content}
              onChange={handleContentChange}
              apiUrl={apiUrl}
              onError={onError}
              onSuccess={onSuccess}
            />
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
              {isEditing ? "در حال ویرایش..." : "ذخیره تغییرات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
