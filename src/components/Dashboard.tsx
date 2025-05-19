import { useState, useEffect } from "react";
import { EditPostDialog } from "./dashboard/EditPostDialog";
import { showToast } from "@/lib/toast";
import { Post } from "@/types/dashboard";
import { Sidebar } from "./dashboard/Sidebar";
import { Topbar } from "./dashboard/Topbar";
import { ProductsPage } from "./dashboard/ProductsPage";
import axios from "axios";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { CreatePostForm } from "./dashboard/CreatePostForm";
import { PostsList } from "./dashboard/PostsList";
import api from "@/lib/api";
import { CategoryPage } from "./dashboard/CategoryPage";
import { DeletePostDialog } from "./dashboard/DeletePostDialog";

type PageType = "posts" | "products" | "categories";

// Enhanced PostsPage that includes post creation and listing
const PostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3100";

  const fetchPosts = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/posts?page=${page}&limit=10`);
      setPosts(response.data.data || []);
      setPagination(
        response.data.meta || {
          currentPage: page,
          itemsPerPage: 10,
          totalItems: 0,
          totalPages: 1,
        }
      );
    } catch (error) {
      console.error("Error fetching posts:", error);
      showToast.error("دریافت پست‌ها با مشکل مواجه شد");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const openDeleteDialog = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (post) {
      setPostToDelete(post);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      await api.delete(`${apiUrl}/posts/${postToDelete.id}`);
      showToast.success("پست با موفقیت حذف شد!");
      fetchPosts(pagination.currentPage);
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast.error("حذف پست با مشکل مواجه شد");
    }
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setIsEditDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
        <h1 className="text-xl md:text-2xl font-bold">مدیریت پست‌ها</h1>
        <Button
          className="w-full sm:w-auto"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "مشاهده پست‌ها" : "افزودن پست جدید"}
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
              onSuccess={(message: string) => {
                showToast.success(message);
                setShowCreateForm(false);
                fetchPosts();
              }}
              onError={(message: string) => showToast.error(message)}
              apiUrl={apiUrl}
            />
          </CardContent>
        </Card>
      ) : (
        <PostsList
          posts={posts}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={openDeleteDialog}
          apiUrl={apiUrl}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}

      <EditPostDialog
        post={selectedPost}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          fetchPosts(pagination.currentPage);
        }}
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
};

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>("posts");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "posts":
        return <PostsPage />;
      case "products":
        return <ProductsPage />;
      case "categories":
        return <CategoryPage />;
      default:
        return <PostsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
      <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-col md:flex-row">
        <div className={`md:block ${sidebarOpen ? "block" : "hidden"}`}>
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={(page) => {
              setCurrentPage(page);
              if (window.innerWidth < 768) {
                setSidebarOpen(false);
              }
            }}
          />
        </div>
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 overflow-x-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
