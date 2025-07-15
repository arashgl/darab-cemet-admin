import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { File, FileText, Film, Image, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

export interface AttachmentFile {
  file: File;
  id: string;
  description?: string;
}

interface FileUploaderProps {
  attachments: AttachmentFile[];
  onAttachmentsChange: (attachments: AttachmentFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  showDescriptions?: boolean;
}

export function FileUploader({
  attachments,
  onAttachmentsChange,
  maxFiles = 10,
  maxFileSize = 10,
  acceptedFileTypes = [
    '.pdf',
    '.doc',
    '.docx',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.mp4',
    '.webm',
    '.txt',
    '.zip',
    '.rar',
  ],
  showDescriptions = false,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-4 h-4" />;
    }
    if (['mp4', 'webm', 'avi', 'mov'].includes(extension || '')) {
      return <Film className="w-4 h-4" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `فایل ${file.name} بیش از ${maxFileSize} مگابایت است`;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(extension)) {
      return `نوع فایل ${extension} پشتیبانی نمی‌شود`;
    }

    return null;
  };

  const handleFiles = (files: FileList) => {
    const newAttachments: AttachmentFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check if we've reached max files
      if (attachments.length + newAttachments.length >= maxFiles) {
        errors.push(`حداکثر ${maxFiles} فایل قابل آپلود است`);
        break;
      }

      // Check if file already exists
      const fileExists = attachments.some(
        (att) => att.file.name === file.name && att.file.size === file.size
      );
      if (fileExists) {
        errors.push(`فایل ${file.name} قبلاً اضافه شده است`);
        continue;
      }

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      newAttachments.push({
        file,
        id: generateId(),
        description: '',
      });
    }

    if (errors.length > 0) {
      // You could show these errors via toast or props callback
      // For now, we'll just log them
      errors.forEach((error) => console.warn(error));
    }

    if (newAttachments.length > 0) {
      onAttachmentsChange([...attachments, ...newAttachments]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter((att) => att.id !== id));
  };

  const updateDescription = (id: string, description: string) => {
    onAttachmentsChange(
      attachments.map((att) => (att.id === id ? { ...att, description } : att))
    );
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${
            dragActive
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          فایل‌ها را اینجا بکشید یا
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          disabled={attachments.length >= maxFiles}
        >
          انتخاب فایل‌ها
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          حداکثر {maxFiles} فایل، هر فایل حداکثر {maxFileSize} مگابایت
        </p>
        <p className="text-xs text-gray-500">
          فرمت‌های مجاز: {acceptedFileTypes.join(', ')}
        </p>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileInput}
      />

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">فایل‌های انتخاب شده:</h4>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              {getFileIcon(attachment.file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {attachment.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.file.size)}
                </p>
                {showDescriptions && (
                  <Input
                    placeholder="توضیح اختیاری..."
                    value={attachment.description || ''}
                    onChange={(e) =>
                      updateDescription(attachment.id, e.target.value)
                    }
                    className="mt-2 text-xs"
                  />
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(attachment.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
