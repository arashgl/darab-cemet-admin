import { FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageType = "posts" | "products";

interface SidebarProps {
  currentPage: PageType;
  setCurrentPage: React.Dispatch<React.SetStateAction<PageType>>;
}

export function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const menuItems = [
    {
      id: "posts",
      label: "پست‌ها",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: "products",
      label: "محصولات",
      icon: <Package className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="w-64 h-[calc(100vh-64px)] bg-white dark:bg-neutral-800 border-e border-neutral-200 dark:border-neutral-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">داشبورد</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={
                currentPage === (item.id as PageType) ? "default" : "ghost"
              }
              className="w-full justify-start gap-2 mb-1"
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
