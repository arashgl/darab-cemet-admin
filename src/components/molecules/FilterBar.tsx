import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: Array<{ id: number; name: string }>;
  onReset: () => void;
  searchPlaceholder?: string;
  className?: string;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onReset,
  searchPlaceholder = 'جستجو...',
  className = '',
}: FilterBarProps) {
  const hasFilters =
    searchTerm || (selectedCategory && selectedCategory !== 'all');

  return (
    <div className={`flex flex-col md:flex-row gap-4 ${className}`}>
      <div className="flex-1">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>
      <div className="w-full md:w-64">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="انتخاب دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" onClick={onReset} disabled={!hasFilters}>
        پاک کردن فیلترها
      </Button>
    </div>
  );
}
