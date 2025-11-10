import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { Category, Post } from '@/types/dashboard';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { CategoryPage } from './dashboard/CategoryPage';
import { CreatePostForm } from './dashboard/CreatePostForm';
import { DeletePostDialog } from './dashboard/DeletePostDialog';
import { EditPostDialog } from './dashboard/EditPostDialog';
import { MediaLibrary } from './dashboard/MediaLibrary';
import { PersonnelPage } from './dashboard/PersonnelPage';
import { PostsList } from './dashboard/PostsList';
import { ProductsPage } from './dashboard/ProductsPage';
import { Sidebar } from './dashboard/Sidebar';
import { Topbar } from './dashboard/Topbar';
import { LandingSettingsPage } from './pages/dashboard/LandingSettingsPage';
import { TicketsPage } from './pages/dashboard/TicketsPage';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type PageType =
  | 'posts'
  | 'products'
  | 'categories'
  | 'personnel'
  | 'media'
  | 'tickets'
  | 'landing-settings';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3100';

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/categories`);
      setCategories(response.data || []);
    } catch {
      showToast.error('دریافت دسته‌بندی‌ها با مشکل مواجه شد');
    }
  }, [apiUrl]);

  const fetchPosts = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        let url = `${apiUrl}/posts?page=${page}&limit=10`;

        if (searchTerm) {
          url += `&title=${encodeURIComponent(searchTerm)}`;
        }

        if (selectedCategory && selectedCategory !== 'all') {
          url += `&categoryId=${selectedCategory}`;
        }

        const response = await axios.get(url);
        setPosts(response.data.data || []);
        setPagination(
          response.data.meta || {
            currentPage: page,
            itemsPerPage: 10,
            totalItems: 0,
            totalPages: 1,
          }
        );
      } catch {
        showToast.error('دریافت پست‌ها با مشکل مواجه شد');
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, searchTerm, selectedCategory]
  );

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    setSelectedCategory('all');
  }, [fetchPosts, fetchCategories]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

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
      showToast.success('پست با موفقیت حذف شد!');
      fetchPosts(pagination.currentPage);
    } catch {
      showToast.error('حذف پست با مشکل مواجه شد');
    }
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setIsEditDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
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
        <>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="جستجو در عنوان مطالب..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="w-full md:w-64">
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب دسته‌بندی" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  disabled={!searchTerm && !selectedCategory}
                >
                  پاک کردن فیلترها
                </Button>
              </div>
            </CardContent>
          </Card>
          <PostsList
            posts={posts}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={openDeleteDialog}
            apiUrl={apiUrl}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
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
  const [currentPage, setCurrentPage] = useState<PageType>('posts');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'posts':
        return <PostsPage />;
      case 'products':
        return <ProductsPage />;
      case 'categories':
        return <CategoryPage />;
      case 'personnel':
        return <PersonnelPage />;
      case 'media':
        return <MediaLibrary />;
      case 'tickets':
        return <TicketsPage />;
      case 'landing-settings':
        return <LandingSettingsPage />;
      default:
        return <PostsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
      <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-col md:flex-row">
        <div className={`md:block ${sidebarOpen ? 'block' : 'hidden'}`}>
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
