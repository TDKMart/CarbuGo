import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface OptimizedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function OptimizedSearchBar({ 
  value, 
  onChange, 
  onSearch,
  isLoading,
  placeholder = "Rechercher une station ou ville..."
}: OptimizedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  // Debounce the search to avoid too many API calls
  const debouncedValue = useDebounce(value, 300);

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && value.trim()) {
      onSearch(value.trim());
    }
  }, [onSearch, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'ring-2 ring-primary ring-opacity-50' : ''
      }`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`h-4 w-4 transition-colors ${
            isFocused ? 'text-primary' : 'text-gray-400'
          }`} />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          disabled={isLoading}
          autoComplete="off"
          spellCheck="false"
        />
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
              disabled={isLoading}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
        </div>
      </div>
      
      {/* Search suggestions could be added here */}
      {value && debouncedValue && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {/* This could be populated with search suggestions */}
        </div>
      )}
    </form>
  );
}