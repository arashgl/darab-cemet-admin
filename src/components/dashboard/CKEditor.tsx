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
  const editorRef = useRef<any>(null); // CKEditor instance

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
          editorRef.current.model.change((writer: any) => {
            const imageElement = writer.createElement('image', {
              src: fullImageUrl,
            });
            editorRef.current.model.insertContent(
              imageElement,
              editorRef.current.model.document.selection
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
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-md">
        <div className="p-4 min-h-[200px] bg-white dark:bg-neutral-950">
          <CKEditor
            editor={ClassicEditor}
            data={initialContent}
            config={{
              licenseKey:
                'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NTQwOTI3OTksImp0aSI6ImE3MGE1NjA5LTJlOWItNGRhZC05ZjkzLTQzMDc3MGMwYzk4NyIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6ImNhNzZkOWRmIn0.PdIUzdkviFOUsY74xE_ack-Mi_u8WwAIjBwfwwlMiEI4dbs7Ltui-AkBouZed-MMxoUmR1VRkAi_-7a6rXV6Vg',
              toolbar: [
                'heading',
                '|',
                'bold',
                'italic',
                'bulletedList',
                'numberedList',
                'link',
                'undo',
                'redo',
              ],
              image: {
                toolbar: [
                  'imageTextAlternative',
                  'imageStyle:full',
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
