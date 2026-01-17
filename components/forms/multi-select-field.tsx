'use client';

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFieldProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export function MultiSelectField({
                                   options,
                                   value = [],
                                   onChange,
                                   placeholder = "Seleccionar opciones...",
                                 }: MultiSelectFieldProps) {

  const handleSelect = (selectedValue: string) => {
    if (!value.includes(selectedValue)) {
      onChange([...value, selectedValue]);
    }
  };

  const handleRemove = (itemToRemove: string) => {
    onChange(value.filter((item) => item !== itemToRemove));
  };

  return (
    <div className="space-y-3">
      <Select onValueChange={handleSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={value.includes(option.value)} // Deshabilitar si ya está seleccionado
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Contenedor de Badges */}
      <div className="flex flex-wrap gap-2">
        {value.map((itemValue) => {
          const option = options.find((o) => o.value === itemValue);
          return (
            <Badge
              key={itemValue}
              variant="secondary"
              className="pl-3 pr-1 py-1 gap-1 animate-in fade-in zoom-in duration-200"
            >
              {option?.label || itemValue}
              <button
                type="button"
                onClick={() => handleRemove(itemValue)}
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
