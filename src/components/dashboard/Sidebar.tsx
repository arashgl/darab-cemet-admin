import {
  FileText,
  FolderTree,
  Image,
  MessageSquare,
  Package,
  Settings,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function Sidebar() {
  const menuItems = [
    { path: '/posts', label: 'پست‌ها', icon: FileText },
    { path: '/products', label: 'محصولات', icon: Package },
    { path: '/categories', label: 'دسته‌بندی‌ها', icon: FolderTree },
    { path: '/personnel', label: 'منابع انسانی', icon: Users },
    { path: '/media', label: 'رسانه‌ها', icon: Image },
    { path: '/tickets', label: 'تیکت‌ها', icon: MessageSquare },
    { path: '/landing-settings', label: 'تنظیمات لندینگ', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-neutral-800 border-b md:border-b-0 md:border-e border-neutral-200 dark:border-neutral-700 overflow-y-auto md:h-[calc(100vh-64px)]">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 px-2">داشبورد</h2>
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm md:text-base">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
