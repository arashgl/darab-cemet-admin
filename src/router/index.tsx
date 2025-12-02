import { authService } from '@/api/auth';
import { PersonnelPage } from '@/components/dashboard/PersonnelPage';
import { LoginForm } from '@/components/pages/auth/LoginForm';
import { CategoriesPage } from '@/components/pages/dashboard/CategoriesPage';
import { EditPostPage } from '@/components/pages/dashboard/EditPostPage';
import { LandingSettingsPage } from '@/components/pages/dashboard/LandingSettingsPage';
import { MediaPage } from '@/components/pages/dashboard/MediaPage';
import { PostsPage } from '@/components/pages/dashboard/PostsPage';
import { ProductsPage } from '@/components/pages/dashboard/ProductsPage';
import { TicketsPage } from '@/components/pages/dashboard/TicketsPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        setIsValid(false);
        return;
      }

      try {
        await authService.verifyToken();
        setIsValid(true);
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-600 dark:text-neutral-400" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            در حال بررسی احراز هویت...
          </p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/posts" replace />,
      },
      {
        path: 'posts',
        element: <PostsPage />,
      },
      {
        path: 'posts/:id/edit',
        element: <EditPostPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'personnel',
        element: <PersonnelPage />,
      },
      {
        path: 'media',
        element: <MediaPage />,
      },
      {
        path: 'tickets',
        element: <TicketsPage />,
      },
      {
        path: 'landing-settings',
        element: <LandingSettingsPage />,
      },
    ],
  },
]);
