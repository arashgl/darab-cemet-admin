import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">پنل مدیریت سیمان داراب</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-neutral-500" />
          <span>{user?.email || "کاربر"}</span>
        </div>

        <Button variant="ghost" size="sm" onClick={logout} className="gap-1">
          <LogOut className="h-4 w-4" />
          خروج
        </Button>
      </div>
    </header>
  );
}
