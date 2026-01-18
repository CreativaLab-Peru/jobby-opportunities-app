'use client';

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
}

interface ComboboxCreativeProps {
  onSearch: (query: string) => Promise<Option[]>;
  onCreate?: (name: string) => Promise<Option | null>; // Nueva prop opcional
  onChange: (value: string) => void;
  value?: string;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function ComboboxCreative({
                                   onSearch,
                                   onCreate,
                                   onChange,
                                   value,
                                   placeholder = "Seleccionar opción...",
                                   emptyMessage = "No se encontraron resultados.",
                                   className,
                                 }: ComboboxCreativeProps) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Efecto de búsqueda
  React.useEffect(() => {
    const fetchOptions = async () => {
      if (debouncedSearch.length < 2) {
        setOptions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await onSearch(debouncedSearch);
        setOptions(results);
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [debouncedSearch, onSearch]);

  // Handler para crear nuevo elemento
  const handleCreate = async () => {
    if (!onCreate || !searchTerm) return;

    setIsCreating(true);
    try {
      const newOption = await onCreate(searchTerm);
      if (newOption) {
        setOptions((prev) => [newOption, ...prev]);
        onChange(newOption.value); // Seleccionar automáticamente
        setOpen(false);
        setSearchTerm("");
      }
    } catch (error) {
      console.error("Error creating option:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate">
            {value
              ? options.find((opt) => opt.value === value)?.label || "Seleccionado"
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && options.length === 0 && searchTerm.length >= 2 && (
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground mb-4">{emptyMessage}</p>
                {onCreate && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8"
                    disabled={isCreating}
                    onClick={handleCreate}
                  >
                    {isCreating ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-3 w-3" />
                    )}
                    Crear "{searchTerm}"
                  </Button>
                )}
              </div>
            )}

            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
