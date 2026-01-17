'use client';

import Link from 'next/link';
import { Plus, SearchX, Inbox, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface EmptyStateProps {
  isFiltered: boolean;
  title?: string;
  description?: string;
}

export function EmptyState({
                             isFiltered,
                             title,
                             description
                           }: EmptyStateProps) {
  const router = useRouter();

  // 1. Definimos el contenido basado en si hay filtros activos
  const content = isFiltered ? {
    icon: <SearchX className="w-12 h-12 text-muted-foreground/60" />,
    title: title || "No encontramos resultados",
    description: description || "Intenta ajustar los filtros o términos de búsqueda para encontrar lo que buscas.",
    action: (
      <Button
        variant="outline"
        onClick={() => router.push(window.location.pathname)}
        className="gap-2"
      >
        <RefreshCcw className="w-4 h-4" />
        Limpiar filtros
      </Button>
    )
  } : {
    icon: <Inbox className="w-12 h-12 text-muted-foreground/60" />,
    title: title || "No hay oportunidades",
    description: description || "Aún no has creado ninguna oportunidad. Comienza agregando la primera ahora mismo.",
    action: (
      <Button asChild className="gap-2 bg-black hover:bg-gray-800">
        <Link href="/opportunities/new">
          <Plus className="w-4 h-4" />
          Crear primera oportunidad
        </Link>
      </Button>
    )
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 lg:p-20 text-center animate-in fade-in duration-500">
      <div className="bg-muted/50 p-4 rounded-full mb-6">
        {content.icon}
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2">
        {content.title}
      </h3>

      <p className="text-muted-foreground max-w-sm mb-8">
        {content.description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {content.action}
      </div>
    </div>
  );
}
