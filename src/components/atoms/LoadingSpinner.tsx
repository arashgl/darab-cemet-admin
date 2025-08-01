interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={`animate-spin rounded-full border-t-2 border-b-2 border-current ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="در حال بارگذاری..."
    >
      <span className="sr-only">در حال بارگذاری...</span>
    </div>
  );
}
