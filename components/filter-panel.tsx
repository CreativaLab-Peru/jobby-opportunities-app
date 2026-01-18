'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { LEVELS, MODALITIES, OPPORTUNITY_TYPES } from "@/consts";
import { GetOpportunitiesParams } from "@/features/opportunities/actions/get-opportunities";
import { Button } from '@/components/ui/button';

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
  const [isOpen, setIsOpen] = useState(false);

  // Sincronizamos el estado local con los filtros que vienen de la URL (SSR)
  const [localFilters, setLocalFilters] = useState<GetOpportunitiesParams>(initialFilters);

  // Cada vez que los filtros de la URL cambian (ej. botón atrás), actualizamos el panel
  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleCheckboxChange = (field: 'types' | 'levels', value: string) => {
    setLocalFilters(prev => {
      const current = (prev[field] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const emptyFilters: GetOpportunitiesParams = {
      search: undefined,
      types: [],
      levels: [],
      countries: [],
      modality: undefined,
    };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-muted-foreground h-8">
            <X className="w-3 h-3 mr-1" /> Limpiar
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="p-6 bg-white border rounded-xl shadow-sm animate-in fade-in zoom-in duration-200">
          {/* Búsqueda Principal */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Título, empresa o palabras clave..."
                value={localFilters.search || ''}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Tipo */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold border-b pb-1">Tipo</h4>
              <div className="grid gap-2">
                {OPPORTUNITY_TYPES.map(type => (
                  <label key={type.value} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={(localFilters.types || []).includes(type.value)}
                      onChange={() => handleCheckboxChange('types', type.value)}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm group-hover:text-black transition-colors">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Niveles */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold border-b pb-1">Nivel</h4>
              <div className="grid gap-2">
                {LEVELS.map(level => (
                  <label key={level.value} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={(localFilters.levels || []).includes(level.value)}
                      onChange={() => handleCheckboxChange('levels', level.value)}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm group-hover:text-black transition-colors">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Modalidad */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold border-b pb-1">Modalidad</h4>
              <select
                value={localFilters.modality || ''}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, modality: e.target.value || undefined }))}
                className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Todas</option>
                {MODALITIES.map(mod => (
                  <option key={mod.value} value={mod.value}>{mod.label}</option>
                ))}
              </select>
            </div>

            {/* Países (Simplificado para el ejemplo) */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold border-b pb-1">Ubicación</h4>
              <input
                type="text"
                placeholder="Ej: México, España..."
                value={(localFilters.countries || []).join(', ')}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  countries: e.target.value ? e.target.value.split(',').map(s => s.trim()) : []
                }))}
                className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Acciones del Panel */}
          <div className="flex justify-end items-center gap-3 mt-8 pt-4 border-t">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyFilters} className="bg-black text-white hover:bg-gray-800">
              Aplicar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
