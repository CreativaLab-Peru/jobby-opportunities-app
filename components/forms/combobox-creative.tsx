'use client';

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Plus, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";

interface Option {
  value: string;
  label: string;
  logoUrl?: string;
}

interface ComboboxCreativeProps {
  options: Option[];
  onSearch?: (query: string) => Promise<Option[]>;
  onCreate?: (name: string) => Promise<Option | null>;
  onChange: (value: string) => void;
  value?: string;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  image?: boolean
}

export function ComboboxCreative({
                                   options: externalOptions,
                                   onSearch,
                                   onCreate,
                                   onChange,
                                   value,
                                   image,
                                   placeholder = "Seleccionar opción...",
                                   emptyMessage = "No se encontraron resultados.",
                                   className,
                                 }: ComboboxCreativeProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Option[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // 1. Efecto para detectar cuando el usuario deja de escribir
  React.useEffect(() => {
    if (debouncedSearch === searchTerm) setIsTyping(false);
  }, [debouncedSearch, searchTerm]);

  // 2. Efecto de búsqueda asíncrona
  React.useEffect(() => {
    const fetchOptions = async () => {
      if (!onSearch || debouncedSearch.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsFetching(true);
      try {
        const results = await onSearch(debouncedSearch);
        setSearchResults(results);
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchOptions();
  }, [debouncedSearch, onSearch]);

  // 3. Unión de opciones (Locales + Resultados de búsqueda)
  const allOptions = React.useMemo(() => {
    const combined = [...externalOptions, ...searchResults];
    const uniqueMap = new Map();
    combined.forEach(opt => uniqueMap.set(opt.value, opt));
    return Array.from(uniqueMap.values());
  }, [externalOptions, searchResults]);

  // --- SOLUCIÓN AL PROBLEMA DE FILTRADO ---
  // Filtramos la lista unificada localmente basándonos en lo que el usuario escribe
  const filteredOptions = React.useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (!normalizedSearch) return allOptions;

    return allOptions.filter(option =>
      option.label.toLowerCase().includes(normalizedSearch)
    );
  }, [allOptions, searchTerm]);

  const selectedOption = React.useMemo(() => {
    return allOptions.find((opt) => opt.value === value);
  }, [value, allOptions]);

  const handleInputChange = (val: string) => {
    setSearchTerm(val);
    setIsTyping(val.length >= 2);
  };

  const showLoading = isTyping || isFetching;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full justify-between font-normal text-left h-10", className)}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedOption?.logoUrl && (
              <img
                src={selectedOption.logoUrl}
                alt=""
                className="h-5 w-5 rounded-md object-contain shrink-0"
              />
            )}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="relative flex items-center border-b px-2">
            <CommandInput
              placeholder="Escribe para buscar..."
              value={searchTerm}
              onValueChange={handleInputChange}
              className="border-none focus:ring-0"
            />
            {showLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
          </div>

          <CommandList className="max-h-[300px] overflow-y-auto">
            {/* Renderizamos filteredOptions en lugar de allOptions */}
            <div className={cn(
              "transition-opacity duration-200",
              showLoading ? "opacity-40 pointer-events-none" : "opacity-100"
            )}>
              {filteredOptions.length > 0 && (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onChange(option.value === value ? "" : option.value);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Check className={cn("h-4 w-4 shrink-0", value === option.value ? "opacity-100" : "opacity-0")} />
                      { image && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-muted overflow-hidden">
                          {option.logoUrl ? (
                            <img src={option.logoUrl} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <ImageIcon className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <span className="truncate flex-1">{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </div>

            {/* Mensajes de error cuando el FILTRO local está vacío */}
            {!showLoading && filteredOptions.length === 0 && searchTerm.length > 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}

            {/* Botón de creación con lógica de duplicados basada en el label exacto */}
            {searchTerm.length >= 2 && !showLoading &&
              !allOptions.some(o => o.label.toLowerCase() === searchTerm.toLowerCase()) &&
              onCreate && (
                <div className="p-1 border-t mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start font-normal text-primary"
                    disabled={isCreating}
                    onClick={async () => {
                      setIsCreating(true);
                      const newOpt = await onCreate(searchTerm);
                      if (newOpt) {
                        onChange(newOpt.value);
                        setOpen(false);
                        setSearchTerm("");
                      }
                      setIsCreating(false);
                    }}
                  >
                    {isCreating ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Plus className="mr-2 h-3 w-3" />}
                    Crear {searchTerm}
                  </Button>
                </div>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
