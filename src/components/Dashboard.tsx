import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import api, {
  setupApiInterceptors,
  setupUploadApiInterceptors,
} from "@/lib/api";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { CreatePostForm } from "./dashboard/CreatePostForm";
import { PostsList } from "./dashboard/PostsList";
import { EditPostDialog } from "./dashboard/EditPostDialog";
import { NotificationToast } from "./dashboard/NotificationToast";
import { Post, ApiError, PaginationMeta } from "@/types/dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectOption } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { MediaLibrary } from "./dashboard/MediaLibrary";

export enum PostSection {
  OCCASIONS = "مناسبت ها",
  ANNOUNCEMENTS = "اطلاعیه ها",
  NEWS = "اخبار ها",
  ACHIEVEMENTS = "افتخارات",
}

export function Dashboard() {
  const { user, token, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Section options based on the backend PostSection enum
  const sections = [
    { value: PostSection.OCCASIONS, label: "مناسبت ها" },
    { value: PostSection.ANNOUNCEMENTS, label: "اطلاعیه ها" },
    { value: PostSection.NEWS, label: "اخبار ها" },
    { value: PostSection.ACHIEVEMENTS, label: "افتخارات" },
  ];

  // Convert to select options format with empty option for "all sections"
  const sectionOptions: SelectOption[] = [
    { value: "", label: "همه بخش‌ها" },
    ...sections,
  ];

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3100";

  // Setup API interceptors when token changes
  useEffect(() => {
    if (token) {
      setupApiInterceptors(token);
      setupUploadApiInterceptors(token);
    }
  }, [token]);

  // Initial API setup with token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setupApiInterceptors(storedToken);
      setupUploadApiInterceptors(storedToken);
    }
  }, []);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = async (page = 1) => {
    setIsLoading(true);
    try {
      let url = `/posts?page=${page}&limit=10`;

      // Add filters to query params if they exist
      if (selectedSection) {
        url += `&section=${encodeURIComponent(selectedSection)}`;
      }

      if (searchTitle.trim()) {
        url += `&title=${searchTitle.trim()}`;
      }

      if (selectedTags.length > 0) {
        url += `&tags=${selectedTags.join(",")}`;
      }

      const response = await api.get(url);
      setPosts(response.data.data || []);
      setPagination(
        response.data.meta || {
          currentPage: page,
          itemsPerPage: 10,
          totalItems: response.data.length || 0,
          totalPages: 1,
        }
      );
    } catch (error) {
      let errorMessage =
        "دریافت پست‌ها با مشکل مواجه شد. لطفا دوباره تلاش کنید.";

      if (axios.isAxiosError(error)) {
        const axiosError = error as import("axios").AxiosError<ApiError>;
        if (axiosError.response?.data?.message) {
          errorMessage =
            typeof axiosError.response.data.message === "string"
              ? axiosError.response.data.message
              : axiosError.response.data.message[0];
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page
    fetchPosts(1);
  };

  const handleSectionChange = (value: string) => {
    setSelectedSection(value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleClearFilters = () => {
    setSearchTitle("");
    setSelectedSection("");
    setSelectedTags([]);
    setCurrentPage(1);
    fetchPosts(1);
  };

  const deletePost = async (id: string) => {
    if (!window.confirm("آیا از حذف این پست اطمینان دارید؟")) {
      return;
    }

    try {
      await api.delete(`/posts/${id}`);
      setSuccess("پست با موفقیت حذف شد!");
      fetchPosts(currentPage);
    } catch (error) {
      let errorMessage = "حذف پست با مشکل مواجه شد. لطفا دوباره تلاش کنید.";

      if (axios.isAxiosError(error)) {
        const axiosError = error as import("axios").AxiosError<ApiError>;
        if (axiosError.response?.data?.message) {
          errorMessage =
            typeof axiosError.response.data.message === "string"
              ? axiosError.response.data.message
              : axiosError.response.data.message[0];
        }
      }

      setError(errorMessage);
    }
  };

  const openEditDialog = (post: Post) => {
    setSelectedPost(post);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <DashboardHeader user={user} onLogout={logout} />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="create">ایجاد پست</TabsTrigger>
            <TabsTrigger value="view">مشاهده پست‌ها</TabsTrigger>
            <TabsTrigger value="media">کتابخانه رسانه</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <CreatePostForm
              onSuccess={(message: string) => {
                setSuccess(message);
                fetchPosts(currentPage);
              }}
              onError={setError}
              apiUrl={apiUrl}
            />
          </TabsContent>

          <TabsContent value="view">
            <div className="mb-6 space-y-4 bg-white dark:bg-neutral-800 rounded-lg shadow p-4">
              <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-50 mb-2">
                فیلترها
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Section Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    بخش
                  </label>
                  <Select
                    value={selectedSection}
                    onValueChange={handleSectionChange}
                    options={sectionOptions}
                    placeholder="انتخاب بخش"
                  />
                </div>

                {/* Title Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    جستجو بر اساس عنوان
                  </label>
                  <Input
                    placeholder="عنوان پست را وارد کنید"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                  />
                </div>

                {/* Tags Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    برچسب‌ها
                  </label>
                  <div className="flex">
                    <Input
                      placeholder="برچسب را وارد کنید"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="rounded-e-none"
                    />
                    <Button onClick={handleAddTag} className="rounded-s-none">
                      افزودن
                    </Button>
                  </div>
                </div>
              </div>

              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <span
                      onClick={() => handleRemoveTag(tag)}
                      className="cursor-pointer text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full w-4 h-4 inline-flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleClearFilters}>
                  پاک کردن فیلترها
                </Button>
                <Button onClick={handleSearch}>جستجو</Button>
              </div>
            </div>

            <PostsList
              posts={posts}
              isLoading={isLoading}
              onEdit={openEditDialog}
              onDelete={deletePost}
              apiUrl={apiUrl}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </TabsContent>

          <TabsContent value="media">
            <MediaLibrary
              apiUrl={apiUrl}
              onError={setError}
              onSuccess={setSuccess}
            />
          </TabsContent>
        </Tabs>
      </main>

      <EditPostDialog
        post={selectedPost}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={(message: string) => {
          setSuccess(message);
          fetchPosts(currentPage);
        }}
        onError={setError}
        apiUrl={apiUrl}
      />

      {error && (
        <NotificationToast
          variant="error"
          title="خطا"
          description={error}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <NotificationToast
          variant="success"
          title="موفقیت"
          description={success}
          onClose={() => setSuccess(null)}
        />
      )}
    </div>
  );
}
