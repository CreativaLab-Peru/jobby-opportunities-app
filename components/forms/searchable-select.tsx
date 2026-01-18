import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, X, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  loading?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
                                                             options,
                                                             value,
                                                             onChange,
                                                             placeholder = "Seleccionar...",
                                                             searchPlaceholder = "Buscar...",
                                                             className,
                                                             disabled = false,
                                                             error,
                                                             helperText,
                                                             loading = false,
                                                           }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      setSearchTerm("");
    }
  };

  const handleOptionSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="relative" ref={containerRef}>
        {/* Trigger Button - Estilo más moderno y redondeado */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled || loading}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-4 py-2 text-sm",
            "ring-offset-background transition-all duration-200 shadow-sm",
            "hover:bg-accent/10 hover:border-accent-foreground/20",
            "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive/30 focus:border-destructive",
            className
          )}
        >
          <span className={cn("truncate font-medium", !selectedOption && "text-muted-foreground font-normal")}>
            {loading ? "Cargando..." : selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-2">
            {selectedOption && !disabled && (
              <div
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
          </div>
        </button>

        {/* Dropdown - Redondeado XL y Animación Sutil */}
        {isOpen && (
          <div className="absolute top-full z-50 mt-2 w-full rounded-xl border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Search Box con fondo sutil */}
            <div className="p-2.5">
              <div className="relative flex items-center bg-muted/50 rounded-md px-2 focus-within:bg-background focus-within:ring-1 focus-within:ring-ring transition-all">
                <Search className="h-4 w-4 text-muted-foreground ml-1" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-2 pr-3 py-2 text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto px-1.5 pb-1.5 scrollbar-thin scrollbar-thumb-rounded">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-sm text-muted-foreground text-center italic">
                  No se encontraron resultados
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    className={cn(
                      "group flex w-full items-center justify-between px-3 py-2.5 my-0.5 text-sm rounded-md transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:outline-none",
                      option.value === value ? "bg-accent/50 text-accent-foreground font-medium" : "text-foreground/80"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {(error || helperText) && (
        <div className="px-1">
          {error ? (
            <p className="text-xs font-medium text-destructive">{error}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
