import { Button } from "@/components/ui/button";
import { Category } from "@/types/product";

interface CategoryChipsProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
}

export const CategoryChips = ({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2 py-4">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.slug ? "categoryActive" : "category"}
          size="sm"
          onClick={() => onCategoryChange(category.slug)}
          className="rounded-full px-4"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
