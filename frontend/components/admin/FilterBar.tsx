import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearFilters: () => void;
  children?: ReactNode;
  showClear?: boolean;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onClearFilters,
  children,
  showClear = false,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex-1 flex gap-2 w-full sm:w-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
            className="pl-9"
          />
        </div>
        <Button onClick={onSearchSubmit}>Search</Button>
      </div>
      {children}
      {showClear && (
        <Button variant="outline" onClick={onClearFilters}>
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
