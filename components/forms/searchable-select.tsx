'use client';

import React, { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, X, Check, Loader2 } from "lucide-react";

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

  // Filtrado optimizado: Memoizado para rendimiento
  const filteredOptions = useMemo(() => {
    const safeSearch = searchTerm.toLowerCase().trim();
    if (!safeSearch) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(safeSearch)
    );
  }, [options, searchTerm]);

  // Encontrar la opción seleccionada para mostrar su etiqueta
  const selectedOption = useMemo(() =>
      options.find((option) => option.value === value)
    , [options, value]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autofocus al abrir el menú
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleOptionSelect = (val: string) => {
    // Si haces clic en el que ya está seleccionado, se limpia (toggle)
    onChange(val === value ? "" : val);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // CRÍTICO: Evita que handleToggle se dispare
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={containerRef}>
      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled || loading}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all",
            "ring-offset-background text-left",
            "focus:outline-none focus:ring-1 focus:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive",
            className
          )}
        >
          <span className={cn("truncate block", !selectedOption && "text-muted-foreground")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <div className="flex items-center gap-1 ml-2 shrink-0">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                {value && !disabled && (
                  <X
                    className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={handleClear}
                  />
                )}
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )} />
              </>
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={cn(
            "absolute top-full z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95 duration-100 origin-top"
          )}>
            {/* Search Box */}
            <div className="flex items-center border-b px-3 bg-muted/20">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                ref={searchInputRef}
                className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsOpen(false);
                }}
              />
            </div>

            {/* Options List */}
            <div className="max-h-[250px] overflow-y-auto p-1 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No se encontraron resultados.
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionSelect(option.value)}
                      className={cn(
                        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-left",
                        "hover:bg-accent hover:text-accent-foreground",
                        option.value === value ? "bg-accent text-accent-foreground" : "text-foreground"
                      )}
                    >
                      <Check className={cn(
                        "mr-2 h-4 w-4 shrink-0 transition-all",
                        option.value === value ? "opacity-100 scale-100" : "opacity-0 scale-50"
                      )} />
                      <span className="truncate">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper / Error Text */}
      {(error || helperText) && (
        <p className={cn(
          "text-[0.8rem] font-medium leading-none tracking-tight px-1",
          error ? "text-destructive" : "text-muted-foreground"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default SearchableSelect;
