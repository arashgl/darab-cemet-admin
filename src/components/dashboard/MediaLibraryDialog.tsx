import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";
import { MediaLibrary } from "./MediaLibrary";
import { Media } from "@/types/dashboard";

interface MediaLibraryDialogProps {
  onSelect: (media: Media) => void;
  apiUrl: string;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export function MediaLibraryDialog({
  onSelect,
  apiUrl,
  onError,
  onSuccess,
}: MediaLibraryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMediaSelect = (media: Media) => {
    // Prevent any default behavior
    try {
      // Call onSelect with the media
      onSelect(media);
      // Close the dialog
      setIsOpen(false);
    } catch (error) {
      // Handle any errors that might occur during selection
      onError("خطا در انتخاب رسانه");
      console.error("Media selection error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Image className="mr-2 h-4 w-4" />
          کتابخانه رسانه
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>کتابخانه رسانه</DialogTitle>
          <DialogDescription>
            یک تصویر یا ویدیو را از کتابخانه انتخاب کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <MediaLibrary
            onSelect={handleMediaSelect}
            apiUrl={apiUrl}
            onError={onError}
            onSuccess={onSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
