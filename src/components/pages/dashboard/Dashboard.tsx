import { PersonnelPage } from '@/components/dashboard/PersonnelPage';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { currentPageState, sidebarOpenState } from '@/state/atoms';
import { useRecoilState } from 'recoil';
import { CategoriesPage } from './CategoriesPage';
import { MediaPage } from './MediaPage';
import { PostsPage } from './PostsPage';
import { ProductsPage } from './ProductsPage';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useRecoilState(currentPageState);
  const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarOpenState);

  const renderPage = () => {
    switch (currentPage) {
      case 'posts':
        return <PostsPage />;
      case 'products':
        return <ProductsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'personnel':
        return <PersonnelPage />;
      case 'media':
        return <MediaPage />;
      default:
        return <PostsPage />;
    }
  };

  const handlePageChange = (
    page: 'posts' | 'products' | 'categories' | 'personnel' | 'media'
  ) => {
    setCurrentPage(page);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
      <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-col md:flex-row">
        <div className={`md:block ${sidebarOpen ? 'block' : 'hidden'}`}>
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
          />
        </div>
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 overflow-x-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
