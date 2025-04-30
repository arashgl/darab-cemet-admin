import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { uploadApi } from "@/lib/api";
import axios, { AxiosError } from "axios";
import { ApiError } from "@/types/dashboard";

interface TipTapEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
  apiUrl: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function TipTapEditor({
  initialContent,
  onChange,
  apiUrl,
  onError,
  onSuccess,
}: TipTapEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageButtonClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleImageInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0] && editor) {
      const file = e.target.files[0];

      try {
        const formData = new FormData();
        formData.append("images", file);

        const response = await uploadApi.post(
          "/posts/upload-content-images",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const imageUrl = response.data.urls[0];

        if (imageUrl) {
          // Make sure the editor is focused
          editor.commands.focus();

          // Add the absolute URL to the image
          const fullImageUrl = `${apiUrl}/${imageUrl}`;

          // Insert the image at the current position
          editor.commands.setImage({
            src: fullImageUrl,
            alt: "Uploaded image",
          });

          onSuccess("تصویر با موفقیت اضافه شد");
        }
      } catch (error) {
        console.error("Error uploading image:", error);

        let errorMessage = "خطا در آپلود تصویر";
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ApiError>;
          if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message;
          }
        }

        onError(errorMessage);
      }

      // Reset the input value so the same file can be selected again
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageInputChange}
        accept="image/*"
        className="hidden"
      />
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-md">
        <div className="bg-white dark:bg-neutral-800 p-2 border-b border-neutral-200 dark:border-neutral-700 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={
              editor?.isActive("bold")
                ? "bg-neutral-200 dark:bg-neutral-600"
                : ""
            }
          >
            B
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={
              editor?.isActive("italic")
                ? "bg-neutral-200 dark:bg-neutral-600"
                : ""
            }
          >
            I
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={
              editor?.isActive("heading", { level: 2 })
                ? "bg-neutral-200 dark:bg-neutral-600"
                : ""
            }
          >
            H2
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={
              editor?.isActive("bulletList")
                ? "bg-neutral-200 dark:bg-neutral-600"
                : ""
            }
          >
            •
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImageButtonClick}
          >
            تصویر
          </Button>
        </div>
        <div className="p-4 min-h-[200px] bg-white dark:bg-neutral-950">
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none"
          />
        </div>
      </div>
    </div>
  );
}
