import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { useCafeSearch, type CafeResult } from "@/hooks/useCafeSearch";

interface CafeSearchAutocompleteProps {
  onCafeSelected: (cafe: CafeResult) => void;
  onAddNewCafe: (cafeName: string) => void;
  onBack?: () => void;
  campus?: string;
  mapCafes?: any[]; // Pass map data to search
}

const CafeSearchAutocomplete = ({ 
  onCafeSelected, 
  onAddNewCafe, 
  onBack,
  campus,
  mapCafes
}: CafeSearchAutocompleteProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { searchCafes, results, isLoading, clearResults } = useCafeSearch(mapCafes);

  // Debounced search
  useEffect(() => {
    console.log("🔍 [AUTOCOMPLETE] Search term changed to:", searchTerm);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= 2) {
      console.log("🔍 [AUTOCOMPLETE] Setting up debounced search...");
      searchTimeoutRef.current = setTimeout(() => {
        console.log("🔍 [AUTOCOMPLETE] Executing debounced search for:", searchTerm);
        searchCafes(searchTerm, campus);
        setShowDropdown(true);
        setSelectedIndex(-1);
      }, 300);
    } else {
      console.log("🔍 [AUTOCOMPLETE] Search term too short, clearing results");
      clearResults();
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, campus, searchCafes, clearResults]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    const totalItems = results.length + 1; // +1 for "Can't find your cafe?" option

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleCafeSelection(results[selectedIndex]);
        } else if (selectedIndex === results.length) {
          handleAddNewCafe();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleCafeSelection = (cafe: CafeResult) => {
    setShowDropdown(false);
    onCafeSelected(cafe);
  };

  const handleAddNewCafe = () => {
    if (searchTerm.trim()) {
      setShowDropdown(false);
      onAddNewCafe(searchTerm.trim());
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="mobile-safe-area py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Find Cafe</h1>
              <p className="text-muted-foreground">Search for the cafe you want to review</p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <Card className="p-4 mb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Start typing a cafe name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground animate-spin" />
            )}
          </div>
        </Card>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <div ref={dropdownRef} className="relative z-50">
            <Card className="bg-popover border border-border shadow-lg">
              {isLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Searching cafes...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((cafe, index) => (
                    <div
                      key={cafe.id}
                      onClick={() => handleCafeSelection(cafe)}
                      className={`flex items-center p-3 cursor-pointer transition-colors ${
                        selectedIndex === index 
                          ? 'bg-accent text-accent-foreground' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <MapPin className="w-4 h-4 mr-3 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{cafe.name}</p>
                        {cafe.address && (
                          <p className="text-sm text-muted-foreground truncate">{cafe.address}</p>
                        )}
                        {cafe.campus && (
                          <p className="text-xs text-muted-foreground">{cafe.campus}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                searchTerm.length >= 2 && (
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground text-sm mb-2">
                      No cafes found for "{searchTerm}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Database appears empty. Try adding a new cafe below.
                    </p>
                  </div>
                )
              )}
              
              {/* Can't find your cafe option */}
              {searchTerm.length >= 2 && (
                <div className="border-t border-border">
                  <div
                    onClick={handleAddNewCafe}
                    className={`flex items-center p-3 cursor-pointer transition-colors ${
                      selectedIndex === results.length 
                        ? 'bg-accent text-accent-foreground' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-3 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Can't find your cafe?</p>
                      <p className="text-sm text-muted-foreground">Add "{searchTerm}" as a new cafe</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Type at least 2 characters to start searching
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            🐛 Debug: Check console for search API calls and responses
          </p>
        </div>
      </div>
    </div>
  );
};

export default CafeSearchAutocomplete;