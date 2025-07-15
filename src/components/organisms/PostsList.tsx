import { EmptyState, ErrorMessage, LoadingSpinner } from '@/components/atoms';
import { PaginationControls } from '@/components/molecules';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Post } from '@/types/dashboard';
import { FileText } from 'lucide-react';

interface PostsListProps {
  posts: Post[];
  isLoading: boolean;
  error?: Error | null;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  apiUrl: string;
  pagination: {
    currentPage: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onRetry?: () => void;
}

export function PostsList({
  posts,
  isLoading,
  error,
  onEdit,
  onDelete,
  apiUrl,
  pagination,
  onPageChange,
  onRetry,
}: PostsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.message || 'خطا در دریافت پست‌ها'}
        retry={onRetry}
      />
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="پستی یافت نشد"
        description="هیچ پستی موجود نیست. اولین پست خود را ایجاد کنید!"
        icon={<FileText className="h-12 w-12" />}
      />
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-50">
        پست‌های موجود
      </h2>

      <div className="space-y-6 animate-fade-up">
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden transition-all duration-300 hover:shadow-lg border-neutral-300 dark:border-neutral-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-4">
                {post.leadPicture && (
                  <div className="col-span-1">
                    <img
                      src={`${apiUrl}/${post.leadPicture}`}
                      alt={post.title}
                      className="w-full h-full object-cover aspect-square"
                    />
                  </div>
                )}
                <CardContent
                  className={`p-6 ${
                    post.leadPicture ? 'col-span-3' : 'col-span-4'
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50">
                    {post.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(post.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(post)}
                      >
                        ویرایش
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(post.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          className="mt-6"
        />
      </div>
    </>
  );
}
