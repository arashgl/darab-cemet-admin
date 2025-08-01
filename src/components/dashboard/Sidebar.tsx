import { Button } from '@/components/ui/button';
import {
  FileText,
  FolderTree,
  Image,
  MessageSquare,
  Package,
  Users,
} from 'lucide-react';

type PageType =
  | 'posts'
  | 'products'
  | 'categories'
  | 'personnel'
  | 'media'
  | 'tickets';

interface SidebarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
}

export function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const menuItems = [
    {
      id: 'posts',
      label: 'پست‌ها',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: 'products',
      label: 'محصولات',
      icon: <Package className="h-5 w-5" />,
    },
    {
      id: 'categories',
      label: 'دسته‌بندی‌ها',
      icon: <FolderTree className="h-5 w-5" />,
    },
    {
      id: 'personnel',
      label: 'منابع انسانی',
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: 'media',
      label: 'رسانه‌ها',
      icon: <Image className="h-5 w-5" />,
    },
    {
      id: 'tickets',
      label: 'تیکت‌ها',
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-neutral-800 border-b md:border-b-0 md:border-e border-neutral-200 dark:border-neutral-700 overflow-y-auto md:h-[calc(100vh-64px)]">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 px-2">داشبورد</h2>
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={
                currentPage === (item.id as PageType) ? 'default' : 'ghost'
              }
              className="w-full justify-start gap-2 mb-1 text-sm md:text-base"
              onClick={() => setCurrentPage(item.id as PageType)}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
