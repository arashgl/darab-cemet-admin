import { useRef, useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  EditorState,
} from "lexical";
import { Button } from "@/components/ui/button";
import { uploadApi } from "@/lib/api";
import axios, { AxiosError } from "axios";
import { $getSelection, $isRangeSelection } from "lexical";
import { $insertNodes } from "lexical";
import { ApiError, Media } from "@/types/dashboard";
import { ListItemNode, ListNode } from "@lexical/list";
import { INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { HeadingNode, $createHeadingNode } from "@lexical/rich-text";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MediaLibraryDialog } from "./MediaLibraryDialog";
import { ImageIcon } from "lucide-react";

// Simple error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Custom plugin to insert images
function ImagePlugin({
  apiUrl,
  onError,
  onSuccess,
}: {
  apiUrl: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageButtonClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
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
          const fullImageUrl = `${apiUrl}/${imageUrl}`;

          // Insert image as HTML
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const paragraph = $createParagraphNode();
              const imgTag = `<img src="${fullImageUrl}" alt="Uploaded image" />`;
              paragraph.append($createTextNode(imgTag));
              $insertNodes([paragraph]);
            }
          });

          onSuccess("تصویر با موفقیت اضافه شد");
        }
      } catch (error) {
        console.error("Error uploading image:", error);

        let errorMessage = "خطا در آپلود تصویر";
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ApiError>;
          if (axiosError.response?.data?.message) {
            if (typeof axiosError.response.data.message === "string") {
              errorMessage = axiosError.response.data.message;
            } else if (Array.isArray(axiosError.response.data.message)) {
              errorMessage = axiosError.response.data.message[0];
            }
          }
        }

        onError(errorMessage);
      }

      // Reset the input value so the same file can be selected again
      e.target.value = "";
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleImageButtonClick}
      >
        <ImageIcon className="h-4 w-4 mr-1" />
        آپلود تصویر
      </Button>
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </>
  );
}

// Media library plugin to insert media from the library
function MediaLibraryPlugin({
  apiUrl,
  onError,
  onSuccess,
}: {
  apiUrl: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  const handleMediaSelect = (media: Media) => {
    // Insert media into editor
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const paragraph = $createParagraphNode();

        if (media.type === "image") {
          const imgTag = `<img src="${apiUrl}${media.url}" alt="${media.originalname}" />`;
          paragraph.append($createTextNode(imgTag));
        } else if (media.type === "video") {
          const videoTag = `<video controls src="${apiUrl}${media.url}" title="${media.originalname}"></video>`;
          paragraph.append($createTextNode(videoTag));
        }

        $insertNodes([paragraph]);
      }
    });

    onSuccess("رسانه با موفقیت اضافه شد");
  };

  return (
    <MediaLibraryDialog
      onSelect={handleMediaSelect}
      apiUrl={apiUrl}
      onError={onError}
      onSuccess={onSuccess}
    />
  );
}

// Custom plugin to handle initialization
function InitialStatePlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialContent) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(initialContent));
        root.append(paragraph);
      });
    }
  }, [editor, initialContent]);

  return null;
}

// Toolbar plugin for formatting
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat("bold"));
          setIsItalic(selection.hasFormat("italic"));
        }
      });
    });
  }, [editor]);

  const toggleBold = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.toggleFormat("bold");
      }
    });
  };

  const toggleItalic = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.toggleFormat("italic");
      }
    });
  };

  const toggleBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const toggleHeading = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Create a heading node and replace the current selection
        const headingNode = $createHeadingNode("h2");
        selection.insertNodes([headingNode]);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-neutral-800 p-2 border-b border-neutral-200 dark:border-neutral-700 flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleBold}
        className={isBold ? "bg-neutral-200 dark:bg-neutral-600" : ""}
      >
        B
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleItalic}
        className={isItalic ? "bg-neutral-200 dark:bg-neutral-600" : ""}
      >
        I
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={toggleHeading}>
        H2
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleBulletList}
      >
        •
      </Button>
    </div>
  );
}

interface LexicalEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
  apiUrl: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function LexicalEditor({
  initialContent,
  onChange,
  apiUrl,
  onError,
  onSuccess,
}: LexicalEditorProps) {
  const editorConfig = {
    namespace: "MyEditor",
    theme: {
      paragraph: "mb-1",
      rtl: "text-right",
      ltr: "text-left",
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
      },
      list: {
        ul: "list-disc list-inside",
        ol: "list-decimal list-inside",
        listitem: "mb-1",
      },
      heading: {
        h1: "text-2xl font-bold",
        h2: "text-xl font-bold",
        h3: "text-lg font-semibold",
      },
    },
    nodes: [ListItemNode, ListNode, HeadingNode],
    onError: (error: Error) => {
      console.error("Lexical Editor Error:", error);
    },
  };

  const handleEditorChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const html = root.getTextContent();
      onChange(html);
    });
  };

  return (
    <div className="space-y-2">
      <LexicalComposer initialConfig={editorConfig}>
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-md">
          <ToolbarPlugin />
          <div className="p-4 min-h-[200px] bg-white dark:bg-neutral-950">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="outline-none h-full min-h-[200px] prose dark:prose-invert max-w-none" />
              }
              placeholder={<div className="text-gray-400">ویرایش محتوا...</div>}
              ErrorBoundary={ErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <OnChangePlugin onChange={handleEditorChange} />
            <InitialStatePlugin initialContent={initialContent} />
          </div>
          <div className="bg-white dark:bg-neutral-800 p-2 border-t border-neutral-200 dark:border-neutral-700 flex gap-2">
            <ImagePlugin
              apiUrl={apiUrl}
              onError={onError}
              onSuccess={onSuccess}
            />
            <MediaLibraryPlugin
              apiUrl={apiUrl}
              onError={onError}
              onSuccess={onSuccess}
            />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
