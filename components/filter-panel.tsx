'use client';

import * as React from 'react';
import { Search, ListFilter, X, RotateCcw } from 'lucide-react';
import { LEVELS, MODALITIES, OPPORTUNITY_TYPES, ELEGIBLE_COUNTRIES } from "@/consts";
import { GetOpportunitiesParams } from "@/features/opportunities/actions/get-opportunities";

// Shadcn UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Tus Componentes Personalizados
import { SearchableMultiSelect } from "@/components/forms/searchable-multi-select";
import SearchableSelect from "@/components/forms/searchable-select";

interface FilterPanelProps {
  initialFilters: GetOpportunitiesParams;
  onFilterChange: (filters: Partial<GetOpportunitiesParams>) => void;
  activeFiltersCount: number;
}

export default function FilterPanel({
                                      initialFilters,
                                      onFilterChange,
                                      activeFiltersCount
                                    }: FilterPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState<GetOpportunitiesParams>(initialFilters);

  // Sincronizar estado cuando cambian los filtros externos (ej. botón atrás o tags)
  React.useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleApply = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const cleared: GetOpportunitiesParams = {
      search: undefined,
      types: [],
      levels: [],
      countries: [],
      modality: undefined,
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* BARRA DE ACCIÓN RÁPIDA */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, empresa o palabras clave..."
            className="pl-9 h-11 bg-background shadow-sm"
            value={localFilters.search || ''}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={isOpen ? "secondary" : "outline"}
            className="h-11 px-5"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ListFilter className="mr-2 h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" className="h-11 px-3 text-muted-foreground hover:text-destructive" onClick={handleClear}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PANEL EXPANDIBLE */}
      {isOpen && (
        <Card className="border shadow-lg overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">

              {/* Tipos de Oportunidad */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo de Oportunidad</Label>
                <SearchableMultiSelect
                  options={OPPORTUNITY_TYPES}
                  value={localFilters.types || []}
                  onValueChange={(vals) => setLocalFilters(prev => ({ ...prev, types: vals }))}
                  placeholder="Todos los tipos"
                />
              </div>

              {/* Niveles Educativos */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nivel Educativo</Label>
                <SearchableMultiSelect
                  options={LEVELS}
                  value={localFilters.levels || []}
                  onValueChange={(vals) => setLocalFilters(prev => ({ ...prev, levels: vals }))}
                  placeholder="Todos los niveles"
                />
              </div>

              {/* Modalidad */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Modalidad</Label>
                <SearchableSelect
                  options={MODALITIES}
                  value={localFilters.modality || ''}
                  onChange={(val) => setLocalFilters(prev => ({ ...prev, modality: val || undefined }))}
                  placeholder="Cualquier modalidad"
                />
              </div>

              {/* Países Elegibles */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">País Elegible</Label>
                <SearchableMultiSelect
                  options={ELEGIBLE_COUNTRIES}
                  value={localFilters.countries || []}
                  onValueChange={(vals) => setLocalFilters(prev => ({ ...prev, countries: vals }))}
                  placeholder="Cualquier país"
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-end items-center gap-3">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={handleApply} className="min-w-[120px]">
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
