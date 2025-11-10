import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeletePersonnelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  personnelName: string;
}

export function DeletePersonnelDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  personnelName,
}: DeletePersonnelDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>حذف نیروی انسانی</DialogTitle>
          <DialogDescription>
            آیا از حذف نیروی انسانی "{personnelName}" اطمینان دارید؟
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
