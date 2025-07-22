import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { showToast } from '@/lib/toast';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateMediaForm } from './CreateMediaForm';

export function CreateMediaDialog() {
  const [open, setOpen] = useState(false);

  const handleSuccess = (message: string) => {
    showToast.success(message);
    setOpen(false);
  };

  const handleError = (message: string) => {
    showToast.error(message);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="create-media-button">
          <Plus className="mr-2 h-4 w-4" />
          افزودن رسانه جدید
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>افزودن رسانه جدید</DialogTitle>
          <DialogDescription>
            رسانه جدیدی را به مجموعه رسانه‌های خود اضافه کنید
          </DialogDescription>
        </DialogHeader>
        <CreateMediaForm onSuccess={handleSuccess} onError={handleError} />
      </DialogContent>
    </Dialog>
  );
}
