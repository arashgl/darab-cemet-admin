import { Button } from "@/components/ui/button";
import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";

interface NotificationToastProps {
  variant: "success" | "error" | "warning" | "default";
  title: string;
  description: string;
  onClose: () => void;
}

export function NotificationToast({
  variant,
  title,
  description,
  onClose,
}: NotificationToastProps) {
  const variantColorMap = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    default: "text-blue-500",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-10">
      <Toast variant={variant} className="w-96">
        <ToastTitle>{title}</ToastTitle>
        <ToastDescription>{description}</ToastDescription>
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 rounded-full h-6 w-6 p-0 ${variantColorMap[variant]}`}
          onClick={onClose}
        >
          ×
        </Button>
      </Toast>
    </div>
  );
}
