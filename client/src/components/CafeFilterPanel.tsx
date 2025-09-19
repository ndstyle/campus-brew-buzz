import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Coffee, Filter, Star, DollarSign, X } from "lucide-react";
import { CafeFilter } from "@/types";

interface CafeFilterPanelProps {
  filters: CafeFilter;
  onFiltersChange: (filters: CafeFilter) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const CafeFilterPanel = ({
  filters,
  onFiltersChange,
  onClose,
  isOpen = true,
}: CafeFilterPanelProps) => {
  const [localFilters, setLocalFilters] = useState<CafeFilter>(filters);

  const categories = [
    { id: "all", label: "All", icon: Coffee },
    { id: "cafe", label: "Café", icon: Coffee },
    { id: "restaurant", label: "Restaurant", icon: Coffee },
    { id: "bakery", label: "Bakery", icon: Coffee },
    { id: "tea_house", label: "Tea House", icon: Coffee },
    { id: "bubble_tea", label: "Bubble Tea", icon: Coffee },
  ];

  const cuisineTypes = [
    { id: "coffee", label: "Coffee" },
    { id: "tea", label: "Tea" },
    { id: "pastry", label: "Pastry" },
    { id: "light_meals", label: "Light Meals" },
    { id: "bubble_tea", label: "Bubble Tea" },
    { id: "specialty_drinks", label: "Specialty Drinks" },
  ];

  const priceRanges = [
    { id: "$", label: "$", description: "Budget-friendly" },
    { id: "$$", label: "$$", description: "Moderate" },
    { id: "$$$", label: "$$$", description: "Expensive" },
    { id: "$$$$", label: "$$$$", description: "Very Expensive" },
  ];

  const handleCategoryChange = (categoryId: string) => {
    const updatedFilters = { ...localFilters, category: categoryId };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleRatingChange = (values: number[]) => {
    const updatedFilters = {
      ...localFilters,
      minRating: values[0],
      maxRating: values[1],
    };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handlePriceRangeToggle = (priceId: string) => {
    const currentPrices = localFilters.priceRange;
    const updatedPrices = currentPrices.includes(priceId)
      ? currentPrices.filter((p) => p !== priceId)
      : [...currentPrices, priceId];

    const updatedFilters = { ...localFilters, priceRange: updatedPrices };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleCuisineToggle = (cuisineId: string) => {
    const currentCuisines = localFilters.cuisineType;
    const updatedCuisines = currentCuisines.includes(cuisineId)
      ? currentCuisines.filter((c) => c !== cuisineId)
      : [...currentCuisines, cuisineId];

    const updatedFilters = { ...localFilters, cuisineType: updatedCuisines };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: CafeFilter = {
      category: "all",
      minRating: 1,
      maxRating: 10,
      priceRange: [],
      cuisineType: [],
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.category !== "all") count++;
    if (localFilters.minRating > 1 || localFilters.maxRating < 10) count++;
    if (localFilters.priceRange.length > 0) count++;
    if (localFilters.cuisineType.length > 0) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                data-testid="button-clear-filters"
              >
                Clear all
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Category</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={
                    localFilters.category === category.id
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                  className="flex items-center gap-1"
                  data-testid={`button-category-${category.id}`}
                >
                  <Icon className="h-3 w-3" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Rating Range</h4>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3 w-3" />
              {localFilters.minRating.toFixed(1)} -{" "}
              {localFilters.maxRating.toFixed(1)}
            </div>
          </div>
          <Slider
            value={[localFilters.minRating, localFilters.maxRating]}
            onValueChange={handleRatingChange}
            max={10}
            min={1}
            step={0.1}
            className="w-full"
            data-testid="slider-rating-range"
          />
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Price Range</h4>
          <div className="grid grid-cols-2 gap-2">
            {priceRanges.map((price) => (
              <div
                key={price.id}
                className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-muted/50"
                onClick={() => handlePriceRangeToggle(price.id)}
                data-testid={`checkbox-price-${price.id}`}
              >
                <Checkbox
                  checked={localFilters.priceRange.includes(price.id)}
                  onChange={() => handlePriceRangeToggle(price.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span className="font-medium text-sm">{price.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {price.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cuisine Type Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Cuisine Type</h4>
          <div className="space-y-2">
            {cuisineTypes.map((cuisine) => (
              <div
                key={cuisine.id}
                className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-muted/50"
                onClick={() => handleCuisineToggle(cuisine.id)}
                data-testid={`checkbox-cuisine-${cuisine.id}`}
              >
                <Checkbox
                  checked={localFilters.cuisineType.includes(cuisine.id)}
                  onChange={() => handleCuisineToggle(cuisine.id)}
                />
                <span className="text-sm">{cuisine.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CafeFilterPanel;
