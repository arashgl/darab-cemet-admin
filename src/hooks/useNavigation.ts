import { currentPageState, sidebarOpenState } from '@/state/atoms';
import { useRecoilState } from 'recoil';

type PageType = 'posts' | 'products' | 'categories' | 'personnel' | 'media';

export function useNavigation() {
  const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarOpenState);
  const [currentPage, setCurrentPage] = useRecoilState(currentPageState);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return {
    sidebarOpen,
    currentPage,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    navigateTo,
  };
}
