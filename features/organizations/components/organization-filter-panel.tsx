'use client';

import * as React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OrganizationFilters {
  search?: string;
  page?: number;
}

interface FilterPanelProps {
  initialFilters: OrganizationFilters;
  onFilterChange: (filters: Partial<OrganizationFilters>) => void;
}

export default function OrganizationFilterPanel({
                                                  initialFilters,
                                                  onFilterChange,
                                                }: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = React.useState(initialFilters.search || '');

  // Sincronizar cuando cambia la URL externamente
  React.useEffect(() => {
    setSearchTerm(initialFilters.search || '');
  }, [initialFilters.search]);

  const handleApply = () => {
    onFilterChange({ search: searchTerm || undefined, page: 1 });
  };

  const handleClear = () => {
    setSearchTerm('');
    onFilterChange({ search: undefined, page: 1 });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center animate-in fade-in duration-500">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar organización por nombre, RUC o email..."
          className="pl-9 h-11 bg-background shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <Button onClick={handleApply} className="h-11 px-6">
          Buscar
        </Button>
        {initialFilters.search && (
          <Button
            variant="ghost"
            className="h-11 px-3 text-muted-foreground hover:text-destructive"
            onClick={handleClear}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
