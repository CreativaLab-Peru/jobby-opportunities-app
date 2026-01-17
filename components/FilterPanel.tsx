'use client';
import { useState } from 'react';
import {LEVELS, MODALITIES, OPPORTUNITY_TYPES} from "@/consts";

interface FilterPanelProps {
  onFilterChange: (filters: Filters) => void;
  activeFiltersCount: number;
}

export interface Filters {
  search: string | null;
  types: string[];
  levels: string[];
  countries: string[];
  modality: string | null;
  language: string | null;
  deadlineFrom: string | null;
  deadlineTo: string | null;
  salaryMin: string | null;
  salaryMax: string | null;
}

export default function FilterPanel({ onFilterChange, activeFiltersCount }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: null,
    types: [],
    levels: [],
    countries: [],
    modality: null,
    language: null,
    deadlineFrom: null,
    deadlineTo: null,
    salaryMin: null,
    salaryMax: null
  });

  const handleCheckboxChange = (field: 'types' | 'levels', value: string) => {
    setFilters(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleCountriesChange = (value: string) => {
    const countriesArray = value ? value.split(',').map(c => c.trim()).filter(c => c) : [];
    setFilters(prev => ({ ...prev, countries: countriesArray }));
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    const emptyFilters: Filters = {
      search: null,
      types: [],
      levels: [],
      countries: [],
      modality: null,
      language: null,
      deadlineFrom: null,
      deadlineTo: null,
      salaryMin: null,
      salaryMax: null
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="mb-4">
      {/* Botón toggle de filtros */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="font-medium">Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-semibold text-white bg-indigo-600 rounded-full">
            {activeFiltersCount}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Panel de filtros */}
      {isOpen && (
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Barra de búsqueda - Ocupa todo el ancho */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar por título u organización
            </label>
            <input
              type="text"
              placeholder="Ej: becas google, harvard..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value || null }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Tipo de Oportunidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Oportunidad</label>
              <div className="space-y-2">
                {OPPORTUNITY_TYPES.map(type => (
                  <label key={type.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.types.includes(type.value)}
                      onChange={() => handleCheckboxChange('types', type.value)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nivel Educativo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nivel Educativo</label>
              <div className="space-y-2">
                {LEVELS.map(level => (
                  <label key={level.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.levels.includes(level.value)}
                      onChange={() => handleCheckboxChange('levels', level.value)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Modalidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad</label>
              <select
                value={filters.modality || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, modality: e.target.value || null }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Todas</option>
                {MODALITIES.map(mod => (
                  <option key={mod.value} value={mod.value}>{mod.label}</option>
                ))}
              </select>
            </div>

            {/* Países */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Países</label>
              <input
                type="text"
                value={filters.countries.join(', ')}
                onChange={(e) => handleCountriesChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: Perú, Chile, Colombia"
              />
            </div>

            {/* Idioma */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
              <input
                type="text"
                value={filters.language || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value || null }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: Español, Inglés"
              />
            </div>

            {/* Fecha Límite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Límite</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.deadlineFrom || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, deadlineFrom: e.target.value || null }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Desde"
                />
                <input
                  type="date"
                  value={filters.deadlineTo || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, deadlineTo: e.target.value || null }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Hasta"
                />
              </div>
            </div>

            {/* Rango Salarial */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rango Salarial</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.salaryMin || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, salaryMin: e.target.value || null }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Mínimo"
                />
                <input
                  type="number"
                  value={filters.salaryMax || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, salaryMax: e.target.value || null }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Máximo"
                />
              </div>
            </div>

          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Limpiar
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
