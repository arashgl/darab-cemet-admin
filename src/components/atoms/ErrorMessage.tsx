interface ErrorMessageProps {
  message: string;
  retry?: () => void;
  className?: string;
}

export function ErrorMessage({
  message,
  retry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="text-red-500 dark:text-red-400 mb-4">
        <svg
          className="h-12 w-12 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
        خطا در بارگذاری
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 mb-4">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          تلاش مجدد
        </button>
      )}
    </div>
  );
}
