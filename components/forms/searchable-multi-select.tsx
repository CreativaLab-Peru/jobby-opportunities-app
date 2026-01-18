'use client';

import * as React from "react";
import { Check, X, ChevronDown, XCircle, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";

interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MultiSelectProps {
  options: Option[];
  onValueChange: (value: string[]) => void;
  onCreate?: (name: string) => Promise<Option | null | void>;
  onSearch?: (query: string) => Promise<Option[]>;
  value?: string[];
  placeholder?: string;
  maxCount?: number;
  className?: string;
}

export function SearchableMultiSelect({
                              options: initialOptions,
                              onValueChange,
                              onCreate,
                              onSearch,
                              value = [],
                              placeholder = "Seleccionar...",
                              maxCount = 3,
                              className,
                            }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [dynamicOptions, setDynamicOptions] = React.useState<Option[]>(initialOptions);

  // Sincronizar opciones iniciales
  React.useEffect(() => {
    setDynamicOptions(initialOptions);
  }, [initialOptions]);

  // Lógica de búsqueda con Debounce
  React.useEffect(() => {
    const handler = setTimeout(async () => {
      if (!onSearch || inputValue.length < 2) return;

      setIsSearching(true);
      try {
        const results = await onSearch(inputValue);
        setDynamicOptions(prev => {
          const existingValues = new Set(prev.map(o => o.value));
          const newUniqueOptions = results.filter(o => !existingValues.has(o.value));
          return [...prev, ...newUniqueOptions];
        });
      } catch (error) {
        console.error("Error searching options:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [inputValue, onSearch]);

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onValueChange(newValue);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onValueChange([]);
  };

  const handleCreate = async () => {
    if (!onCreate || !inputValue.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const newOption = await onCreate(inputValue);
      if (newOption && typeof newOption === 'object') {
        setDynamicOptions(prev => [...prev, newOption]);
        onValueChange([...value, newOption.value]);
      }
      setInputValue("");
    } catch (error) {
      console.error("Error creating option:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // --- SOLUCIÓN AL FILTRADO ---
  // Filtramos las opciones dinámicas basándonos en el inputValue actual.
  // Esto limpia la lista visualmente mientras se mantiene el estado interno.
  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return dynamicOptions;
    const search = inputValue.toLowerCase();
    return dynamicOptions.filter(opt =>
      opt.label.toLowerCase().includes(search)
    );
  }, [dynamicOptions, inputValue]);

  const showCreateOption =
    onCreate &&
    inputValue.length >= 2 &&
    !isSearching &&
    !dynamicOptions.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn(
        "relative flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-background shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
        className
      )}>
        <PopoverTrigger asChild>
          <div role="combobox" className="flex flex-wrap flex-1 gap-1 px-2 py-1 cursor-pointer items-center min-h-8">
            {value.length > 0 ? (
              <>
                {value.slice(0, maxCount).map((val) => {
                  const option = dynamicOptions.find((o) => o.value === val);
                  return (
                    <Badge key={val} variant="secondary" className="rounded-sm px-1 font-normal animate-in fade-in zoom-in-95 duration-200">
                      {option?.label || val}
                      <button
                        className="ml-1 rounded-full outline-none hover:bg-background/80"
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleOption(val);
                        }}
                      >
                        <XCircle className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  );
                })}
                {value.length > maxCount && (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal text-muted-foreground">
                    {`+ ${value.length - maxCount} más`}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </PopoverTrigger>

        <div className="flex items-center self-stretch pr-2 shrink-0">
          {isSearching && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground mr-2" />}
          {value.length > 0 && (
            <>
              <button type="button" onClick={handleClear} className="mx-2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
              <Separator orientation="vertical" className="h-4 w-[1px] bg-border" />
            </>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
            className="ml-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
          </button>
        </div>
      </div>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}> {/* Mantenemos false para controlar el filtrado nosotros */}
          <div className="relative border-b">
            <CommandInput
              placeholder={onSearch ? "Buscando..." : "Buscar..."}
              value={inputValue}
              onValueChange={setInputValue}
              className="border-none focus:ring-0"
            />
          </div>
          <CommandList>
            {/* Si no hay resultados filtrados y no estamos cargando ni creando, mostrar vacío */}
            {filteredOptions.length === 0 && !isSearching && !showCreateOption && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No hay resultados.
              </div>
            )}

            {showCreateOption && (
              <div className="p-1 border-b">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10 h-9 px-2"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  <span className="truncate">Crear "{inputValue}"</span>
                </Button>
              </div>
            )}

            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    className="cursor-pointer"
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
