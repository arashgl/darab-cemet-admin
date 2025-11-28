import { MediaLibrary } from '@/components/dashboard/MediaLibrary';
import { PersonnelPage } from '@/components/dashboard/PersonnelPage';
import { LoginForm } from '@/components/pages/auth/LoginForm';
import { CategoriesPage } from '@/components/pages/dashboard/CategoriesPage';
import { LandingSettingsPage } from '@/components/pages/dashboard/LandingSettingsPage';
import { PostsPage } from '@/components/pages/dashboard/PostsPage';
import { ProductsPage } from '@/components/pages/dashboard/ProductsPage';
import { TicketsPage } from '@/components/pages/dashboard/TicketsPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Navigate, createBrowserRouter } from 'react-router-dom';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');

  if (!token) {
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
        element: <MediaLibrary />,
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
