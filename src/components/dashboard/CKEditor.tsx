import { uploadApi } from '@/lib/api';
import { ApiError } from '@/types/dashboard';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import axios, { AxiosError } from 'axios';
import { useRef } from 'react';
interface CkEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
  apiUrl: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function CkEditor({
  initialContent,
  onChange,
  apiUrl,
  onError,
  onSuccess,
}: CkEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<unknown>(null);

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
        formData.append('images', file);

        const response = await uploadApi.post(
          '/posts/upload-content-images',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        const imageUrl = response.data.urls[0];

        if (imageUrl && editorRef.current) {
          const fullImageUrl = `${apiUrl}/${imageUrl}`;
          const editor = editorRef.current as {
            model: {
              change: (callback: (writer: {
                createElement: (name: string, attrs: Record<string, string>) => unknown;
              }) => void) => void;
              insertContent: (element: unknown, selection: unknown) => void;
              document: { selection: unknown };
            };
          };
          editor.model.change((writer) => {
            const imageElement = writer.createElement('image', {
              src: fullImageUrl,
            });
            editor.model.insertContent(
              imageElement,
              editor.model.document.selection
            );
          });

          onSuccess('تصویر با موفقیت اضافه شد');
        }
      } catch (error) {
        console.error('Error uploading image:', error);

        let errorMessage = 'خطا در آپلود تصویر';
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ApiError>;
          if (axiosError.response?.data?.message) {
            if (typeof axiosError.response.data.message === 'string') {
              errorMessage = axiosError.response.data.message;
            } else if (Array.isArray(axiosError.response.data.message)) {
              errorMessage = axiosError.response.data.message[0];
            }
          }
        }

        onError(errorMessage);
      }

      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={handleImageButtonClick}
          className="px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700
                     bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800
                     text-sm"
        >
          انتخاب و آپلود تصویر
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-md">
        <div className="p-4 min-h-[200px] bg-white dark:bg-neutral-950">
          <CKEditor
            editor={ClassicEditor}
            data={initialContent}
            config={{
              licenseKey: import.meta.env.VITE_CKEDITOR_API_KEY,
              removePlugins: ['ImageUpload', 'EasyImage'],
              toolbar: [
                'heading',
                '|',
                'bold',
                'italic',
                'bulletedList',
                'numberedList',
                'link',
                '|',
                'imageInsert',
                'undo',
                'redo',
              ],
              image: {
                toolbar: [
                  'imageTextAlternative',
                  '|',
                  'imageStyle:inline',
                  'imageStyle:alignLeft',
                  'imageStyle:alignCenter',
                  'imageStyle:alignRight',
                  'imageStyle:block',
                  'imageStyle:side',
                ],
              },
            }}
            onReady={(editor) => {
              editorRef.current = editor;
            }}
            onChange={(_, editor) => {
              const data = editor.getData();
              onChange(data);
            }}
            onError={(err) => {
              console.error('CKEditor Error', err);
              onError('خطا در ویرایشگر');
            }}
          />
        </div>
      </div>
    </div>
  );
}
