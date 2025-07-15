import { useCategories } from '@/api/categories';
import { useDeletePost, usePosts } from '@/api/posts';
import { CreatePostForm } from '@/components/dashboard/CreatePostForm';
import { DeletePostDialog } from '@/components/dashboard/DeletePostDialog';
import { EditPostDialog } from '@/components/dashboard/EditPostDialog';
import { FilterBar } from '@/components/molecules/FilterBar';
import { PostsList } from '@/components/organisms/PostsList';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { showToast } from '@/lib/toast';
import { Post } from '@/types/dashboard';
import { useState } from 'react';

export function PostsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3100';

  // React Query hooks
  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = usePosts({
    page: currentPage,
    limit: 10,
    title: searchTerm || undefined,
    categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
  });

  const { data: categories = [] } = useCategories();

  const deletePostMutation = useDeletePost();

  // Event handlers
  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      await deletePostMutation.mutateAsync(postToDelete.id);
      showToast.success('پست با موفقیت حذف شد!');
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch {
      showToast.error('حذف پست با مشکل مواجه شد');
    }
  };

  const openDeleteDialog = (id: string) => {
    const post = postsData?.data.find((p) => p.id === id);
    if (post) {
      setPostToDelete(post);
      setIsDeleteDialogOpen(true);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  const handleCreateSuccess = () => {
    showToast.success('پست با موفقیت ایجاد شد');
    setShowCreateForm(false);
    refetchPosts();
  };

  const handleEditSuccess = () => {
    showToast.success('پست با موفقیت بروزرسانی شد');
    setIsEditDialogOpen(false);
    refetchPosts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
        <h1 className="text-xl md:text-2xl font-bold">مدیریت پست‌ها</h1>
        <Button
          className="w-full sm:w-auto"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'مشاهده پست‌ها' : 'افزودن پست جدید'}
        </Button>
      </div>

      {showCreateForm ? (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              افزودن پست جدید
            </CardTitle>
            <CardDescription>اطلاعات پست را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePostForm
              onSuccess={handleCreateSuccess}
              onError={(message: string) => showToast.error(message)}
              apiUrl={apiUrl}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <FilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categories}
                onReset={handleResetFilters}
                searchPlaceholder="جستجو در عنوان مطالب..."
              />
            </CardContent>
          </Card>

          <PostsList
            posts={postsData?.data || []}
            isLoading={postsLoading}
            error={postsError}
            onEdit={handleEdit}
            onDelete={openDeleteDialog}
            apiUrl={apiUrl}
            pagination={{
              currentPage: postsData?.meta.currentPage || 1,
              totalPages: postsData?.meta.totalPages || 1,
            }}
            onPageChange={handlePageChange}
            onRetry={refetchPosts}
          />
        </>
      )}

      <EditPostDialog
        post={selectedPost}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
        onError={(message: string) => showToast.error(message)}
        apiUrl={apiUrl}
      />

      {postToDelete && (
        <DeletePostDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
          postTitle={postToDelete.title}
        />
      )}
    </div>
  );
}
