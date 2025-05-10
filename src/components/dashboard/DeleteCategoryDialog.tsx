import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  categoryName: string;
}

export function DeleteCategoryDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  categoryName,
}: DeleteCategoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>حذف دسته‌بندی</DialogTitle>
          <DialogDescription>
            آیا از حذف دسته‌بندی "{categoryName}" اطمینان دارید؟
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end space-x-2 rtl:space-x-reverse">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
