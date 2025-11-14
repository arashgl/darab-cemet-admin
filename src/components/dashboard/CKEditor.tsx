import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type { Editor } from '@ckeditor/ckeditor5-core';
import { CKEditor } from '@ckeditor/ckeditor5-react';
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
  const editorRef = useRef<Editor | null>(null);

  return (
    <div className="space-y-2">
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
                'undo',
                'redo',
              ],
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
