import { uploadClient } from '@/api/client';
import { ApiError } from '@/types/dashboard';
import axios, { AxiosError, CancelTokenSource } from 'axios';

type UploaderConfig = {
  apiUrl: string;
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
};

interface CKEditorLoader {
  file: Promise<File>;
}

export class CustomUploadAdapter {
  private loader: CKEditorLoader;
  private cancelSource: CancelTokenSource;
  private apiUrl: string;
  private onSuccess?: (msg: string) => void;
  private onError?: (msg: string) => void;

  constructor(
    loader: CKEditorLoader,
    { apiUrl, onSuccess, onError }: UploaderConfig
  ) {
    this.loader = loader;
    this.cancelSource = axios.CancelToken.source();
    this.apiUrl = apiUrl;
    this.onSuccess = onSuccess;
    this.onError = onError;
  }

  async upload(): Promise<{ default: string }> {
    const file: File = await this.loader.file;

    const formData = new FormData();
    formData.append('images', file);

    try {
      const res = await uploadClient.post(
        '/posts/upload-content-images',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          cancelToken: this.cancelSource.token,
        }
      );

      const url = res?.data?.urls?.[0];
      if (!url) throw new Error('Invalid upload response: missing urls[0]');

      const fullUrl = `${this.apiUrl}/${url}`;
      this.onSuccess?.('تصویر با موفقیت اضافه شد');

      return { default: fullUrl };
    } catch (err) {
      let msg = 'خطا در آپلود تصویر';
      if (axios.isAxiosError(err)) {
        const e = err as AxiosError<ApiError>;
        const m = e.response?.data?.message;
        if (typeof m === 'string') msg = m;
        else if (Array.isArray(m) && m[0]) msg = m[0];
      }
      this.onError?.(msg);
      throw err;
    }
  }

  abort(): void {
    this.cancelSource.cancel('Upload aborted by the user.');
  }
}

interface CKEditorInstance {
  config: {
    get: (key: string) => UploaderConfig;
  };
  plugins: {
    get: (name: string) => {
      createUploadAdapter: (loader: CKEditorLoader) => CustomUploadAdapter;
    };
  };
}

export function CustomUploadAdapterPlugin(editor: CKEditorInstance) {
  const uploaderConfig: UploaderConfig = editor.config.get('uploader');
  if (!uploaderConfig || !uploaderConfig.apiUrl) {
    console.warn('[CKEditor] Missing `config.uploader.apiUrl`');
  }

  editor.plugins.get('FileRepository').createUploadAdapter = (
    loader: CKEditorLoader
  ) => new CustomUploadAdapter(loader, uploaderConfig);
}
