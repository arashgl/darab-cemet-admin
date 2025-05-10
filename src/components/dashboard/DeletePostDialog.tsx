import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeletePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  postTitle: string;
}

export function DeletePostDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  postTitle,
}: DeletePostDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>حذف پست</DialogTitle>
          <DialogDescription>
            آیا از حذف پست "{postTitle}" اطمینان دارید؟
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
