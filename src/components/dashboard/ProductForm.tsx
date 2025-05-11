import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { API_URL } from "@/lib/constants";
import { uploadApi } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Product } from "@/types/product";
import { Category } from "@/types/dashboard";
import axios from "axios";

interface FormData {
  name: string;
  type: string;
  description: string;
  features: string;
  advantages: string;
  applications: string;
  technicalSpecs: string;
  categoryId: string;
  isActive: boolean;
}

interface ProductFormProps {
  product: Product | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<FormData>({
    defaultValues: {
      name: product?.name || "",
      type: product?.type || "cement",
      description: product?.description || "",
      features: product?.features ? product.features.join("\n") : "",
      advantages: product?.advantages ? product.advantages.join("\n") : "",
      applications: product?.applications
        ? product.applications.join("\n")
        : "",
      technicalSpecs: product?.technicalSpecs
        ? product.technicalSpecs.join("\n")
        : "",
      categoryId: product?.category?.id
        ? String(product.category.id)
        : product?.categoryId
        ? String(product.categoryId)
        : "0",
      isActive: product?.isActive ?? true,
    },
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showToast.error("دریافت دسته‌بندی‌ها با مشکل مواجه شد");
      }
    };

    fetchCategories();
  }, []);

  // Set image preview
  useEffect(() => {
    if (product?.image) {
      setImagePreview(`${API_URL}/${product.image}`);
    }
  }, [product]);

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Parse the multiline text fields into arrays
      const featuresArray = data.features
        ? data.features.split("\n").filter(Boolean)
        : [];
      const advantagesArray = data.advantages
        ? data.advantages.split("\n").filter(Boolean)
        : [];
      const applicationsArray = data.applications
        ? data.applications.split("\n").filter(Boolean)
        : [];
      const technicalSpecsArray = data.technicalSpecs
        ? data.technicalSpecs.split("\n").filter(Boolean)
        : [];

      // Create the base payload with properly typed values
      const payload: {
        name: string;
        type: string;
        description: string;
        features: string[];
        advantages: string[];
        applications: string[];
        technicalSpecs: string[];
        categoryId?: number;
      } = {
        name: data.name,
        type: data.type,
        description: data.description,
        features: featuresArray,
        advantages: advantagesArray,
        applications: applicationsArray,
        technicalSpecs: technicalSpecsArray,
      };

      // Add categoryId only if it's not "0"
      if (data.categoryId !== "0") {
        payload.categoryId = parseInt(data.categoryId, 10);
      }

      const hasImage = document.getElementById("image") as HTMLInputElement;
      const hasImageFile =
        hasImage && hasImage.files && hasImage.files.length > 0;

      if (hasImageFile) {
        // When there's an image, we need to use FormData
        // But we'll convert our payload to a format that NestJS can parse
        const formData = new FormData();

        // Add all fields from our payload
        Object.entries(payload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            // Append each array element individually with bracket notation
            value.forEach((item) => {
              formData.append(`${key}[]`, item);
            });
          } else if (typeof value === "boolean") {
            // Send boolean as string 'true' or 'false'
            formData.append(key, String(value));
          } else if (value !== null && value !== undefined) {
            // Append other non-null/undefined values as strings
            formData.append(key, value as string);
          }
        });

        // Add image file
        formData.append("image", hasImage.files![0]);

        // For debugging purposes
        console.log(
          "Payload being sent:",
          Object.fromEntries(formData.entries())
        );

        try {
          if (product) {
            await uploadApi.patch(`/products/${product.id}`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
          } else {
            await uploadApi.post(`/products`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
          }
        } catch (error) {
          console.error("Error submitting with image:", error);

          // As a last resort, try to use URLSearchParams which might handle boolean conversion better
          const urlParams = new URLSearchParams();

          Object.entries(payload).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              // For arrays, use JSON stringification
              urlParams.append(key, JSON.stringify(value));
            } else {
              // For other values, convert to string
              urlParams.append(key, String(value));
            }
          });

          // Need special handling for the file
          if (product) {
            throw error; // Not handling this case for now
          } else {
            throw error; // Not handling this case for now
          }
        }
      } else {
        // Without image, send JSON directly - this already has proper typing
        if (product) {
          await uploadApi.patch(`/products/${product.id}`, payload);
        } else {
          await uploadApi.post(`/products`, payload);
        }
      }

      showToast.success(
        product ? "محصول با موفقیت بروزرسانی شد" : "محصول با موفقیت ایجاد شد"
      );

      onSubmit();
    } catch (error: unknown) {
      console.error("Error submitting product:", error);

      // Handle validation errors
      const apiError = error as {
        response?: { data?: { message?: string | string[] } };
      };

      if (apiError.response?.data?.message) {
        const errors = Array.isArray(apiError.response.data.message)
          ? apiError.response.data.message
          : [apiError.response.data.message];

        const fieldErrors: Record<string, string> = {};

        errors.forEach((err: string) => {
          if (err.includes("features")) {
            fieldErrors.features = err;
          } else if (err.includes("advantages")) {
            fieldErrors.advantages = err;
          } else if (err.includes("applications")) {
            fieldErrors.applications = err;
          } else if (err.includes("technicalSpecs")) {
            fieldErrors.technicalSpecs = err;
          } else {
            // Generic error
            showToast.error(err);
          }
        });

        // Apply errors to form fields
        Object.entries(fieldErrors).forEach(([field, message]) => {
          form.setError(field as keyof FormData, {
            type: "manual",
            message,
          });
        });
      } else {
        showToast.error("خطایی در ثبت محصول رخ داد. لطفا دوباره تلاش کنید.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام محصول</FormLabel>
                <FormControl>
                  <Input placeholder="نام محصول را وارد کنید" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع محصول</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="نوع محصول را انتخاب کنید" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cement">سیمان</SelectItem>
                    <SelectItem value="concrete">بتن</SelectItem>
                    <SelectItem value="other">سایر</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>دسته‌بندی</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">بدون دسته‌بندی</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id.toString()}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel htmlFor="image">تصویر محصول</FormLabel>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1"
            />
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm mb-2">پیش‌نمایش تصویر:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-[200px] max-h-[200px] object-contain border rounded"
                />
              </div>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>توضیحات</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="توضیحات محصول را وارد کنید"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ویژگی‌ها</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="هر ویژگی را در یک خط جدید وارد کنید"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  هر ویژگی را در یک خط جدید وارد کنید
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="advantages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مزایا</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="هر مزیت را در یک خط جدید وارد کنید"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  هر مزیت را در یک خط جدید وارد کنید
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="applications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>کاربردها</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="هر کاربرد را در یک خط جدید وارد کنید"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  هر کاربرد را در یک خط جدید وارد کنید
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="technicalSpecs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مشخصات فنی</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="هر مشخصه را در یک خط جدید وارد کنید"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  هر مشخصه را در یک خط جدید وارد کنید
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 space-x-reverse">
          <Button type="button" variant="outline" onClick={onCancel}>
            انصراف
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "در حال ذخیره‌سازی..."
              : product
              ? "بروزرسانی"
              : "ذخیره"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
