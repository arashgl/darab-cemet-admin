import { useState, useEffect } from "react";
import { Media, MediaType, PaginationMeta, ApiError } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, X, Upload, Image, Film } from "lucide-react";
import api from "@/lib/api";
import axios from "axios";

interface MediaLibraryProps {
  onSelect?: (media: Media) => void;
  apiUrl: string;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export function MediaLibrary({
  onSelect,
  apiUrl,
  onError,
  onSuccess,
}: MediaLibraryProps) {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mediaType, setMediaType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
  });

  const mediaTypeOptions: SelectOption[] = [
    { value: "", label: "همه" },
    { value: MediaType.IMAGE, label: "تصویر" },
    { value: MediaType.VIDEO, label: "ویدیو" },
  ];

  useEffect(() => {
    fetchMedia();
  }, [currentPage, mediaType]);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      let url = `/media?page=${currentPage}&limit=20`;
      if (mediaType) {
        url += `&type=${mediaType}`;
      }

      const response = await api.get(url);
      console.log(response.data.data, "MMMM");
      setMediaItems(response.data.data || []);
      setPagination(
        response.data.meta || {
          currentPage,
          itemsPerPage: 20,
          totalItems: 0,
          totalPages: 1,
        }
      );
    } catch (error) {
      handleApiError(error, "دریافت رسانه‌ها با مشکل مواجه شد");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onError("لطفا یک فایل انتخاب کنید");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploadLoading(true);
    try {
      await api.post("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onSuccess("فایل با موفقیت آپلود شد");
      setSelectedFile(null);
      fetchMedia();
    } catch (error) {
      handleApiError(error, "آپلود فایل با مشکل مواجه شد");
    } finally {
      setUploadLoading(false);
    }
  };

  const openDeleteDialog = (media: Media) => {
    setSelectedMedia(media);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMedia) return;

    try {
      await api.delete(`/media/${selectedMedia.id}`);
      onSuccess("فایل با موفقیت حذف شد");
      fetchMedia();
    } catch (error) {
      handleApiError(error, "حذف فایل با مشکل مواجه شد");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMedia(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleMediaTypeChange = (value: string) => {
    setMediaType(value);
    setCurrentPage(1);
  };

  const handleMediaClick = (media: Media) => {
    if (onSelect) {
      onSelect(media);
    }
  };

  const handleApiError = (error: unknown, defaultMessage: string) => {
    let errorMessage = defaultMessage;

    if (axios.isAxiosError(error)) {
      const axiosError = error as import("axios").AxiosError<ApiError>;
      if (axiosError.response?.data?.message) {
        errorMessage =
          typeof axiosError.response.data.message === "string"
            ? axiosError.response.data.message
            : axiosError.response.data.message[0];
      }
    }

    onError(errorMessage);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(1) + " GB";
  };

  const getIconForType = (type: MediaType) => {
    return type === MediaType.IMAGE ? (
      <Image className="w-5 h-5" />
    ) : (
      <Film className="w-5 h-5" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-50 mb-4">
          آپلود فایل جدید
        </h3>
        <div className="flex items-end gap-4">
          <div className="w-full">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
              onChange={handleFileChange}
              className="w-full"
            />
            <p className="text-xs text-neutral-500 mt-1">
              فرمت‌های مجاز: JPEG, PNG, GIF, WebP, MP4, WebM
            </p>
          </div>
          <Button
            onClick={handleUpload}
            disabled={uploadLoading || !selectedFile}
          >
            {uploadLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                در حال آپلود...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                آپلود
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-50">
            کتابخانه رسانه
          </h3>
          <div className="mt-4">
            <div className="w-64">
              <Select
                value={mediaType}
                onValueChange={handleMediaTypeChange}
                options={mediaTypeOptions}
                placeholder="نوع فایل"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="grid" className="p-6">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">نمایش گرید</TabsTrigger>
            <TabsTrigger value="list">نمایش لیست</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : mediaItems.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                رسانه‌ای یافت نشد
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mediaItems.map((media) => (
                  <Card
                    key={media.id}
                    className={`relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary ${
                      onSelect ? "hover:opacity-90" : ""
                    }`}
                    onClick={() => handleMediaClick(media)}
                  >
                    <CardContent className="p-0">
                      {media.type === MediaType.IMAGE ? (
                        <div
                          className="aspect-square w-full bg-neutral-100 dark:bg-neutral-800 relative"
                          style={{
                            backgroundImage: `url(${
                              import.meta.env.VITE_API_URL + media.url
                            })`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      ) : (
                        <div className="aspect-square w-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                          <Film className="h-12 w-12 text-neutral-400" />
                        </div>
                      )}
                      <div className="p-2 text-xs truncate">
                        {media.originalname}
                      </div>
                      <button
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(media);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list">
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : mediaItems.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                رسانه‌ای یافت نشد
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b dark:border-neutral-700">
                      <th className="py-3 px-4 text-right text-sm font-medium text-neutral-500 dark:text-neutral-400 w-12">
                        نوع
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        نام فایل
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-neutral-500 dark:text-neutral-400 w-24">
                        حجم
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-neutral-500 dark:text-neutral-400 w-40">
                        تاریخ آپلود
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400 w-24">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mediaItems.map((media) => (
                      <tr
                        key={media.id}
                        className={`border-b dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                          onSelect ? "cursor-pointer" : ""
                        }`}
                        onClick={() => handleMediaClick(media)}
                      >
                        <td className="py-3 px-4 text-center">
                          {getIconForType(media.type as MediaType)}
                        </td>
                        <td className="py-3 px-4 truncate">
                          {media.originalname}
                        </td>
                        <td className="py-3 px-4">
                          {formatFileSize(media.size)}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(media.createdAt).toLocaleDateString(
                            "fa-IR"
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(media);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {pagination.totalPages > 1 && (
          <div className="p-6 border-t border-neutral-200 dark:border-neutral-700">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              آیا از حذف این فایل اطمینان دارید؟
            </AlertDialogTitle>
            <AlertDialogDescription>
              این عملیات غیرقابل بازگشت است. این فایل از کتابخانه رسانه حذف
              خواهد شد. 
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
