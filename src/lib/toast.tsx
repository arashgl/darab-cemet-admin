import { toast, ToastOptions, Toaster } from "react-hot-toast";

// Custom toast options
const defaultOptions: ToastOptions = {
  duration: 5000,
  position: "bottom-right",
  style: {
    direction: "rtl",
  },
};

// Toast variants
export const showToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, { ...defaultOptions, ...options }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, { ...defaultOptions, ...options }),

  warning: (message: string, options?: ToastOptions) =>
    toast(message, {
      ...defaultOptions,
      ...options,
      icon: "⚠️",
      style: {
        ...defaultOptions.style,
        backgroundColor: "#fff8e1",
        color: "#ffa000",
        border: "1px solid #ffecb3",
      },
    }),

  default: (message: string, options?: ToastOptions) =>
    toast(message, { ...defaultOptions, ...options }),
};

// Toast component to be added to the app
export const ToastProvider = () => {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        bottom: 20,
        right: 20,
        zIndex: 9999,
      }}
      toastOptions={{
        duration: 5000,
        style: {
          padding: "16px",
          borderRadius: "8px",
          background: "#fff",
          color: "#333",
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
          direction: "rtl",
        },
        success: {
          style: {
            background: "#f0fff4",
            color: "#38a169",
            border: "1px solid #c6f6d5",
          },
        },
        error: {
          style: {
            background: "#fff5f5",
            color: "#e53e3e",
            border: "1px solid #fed7d7",
          },
        },
      }}
    />
  );
};
