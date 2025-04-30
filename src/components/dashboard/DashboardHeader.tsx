import { Button } from "@/components/ui/button";
import { User } from "@/types/dashboard";

interface DashboardHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          پنل مدیریت
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            خوش آمدید، {user?.name || "مدیر"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            خروج
          </Button>
        </div>
      </div>
    </header>
  );
}
