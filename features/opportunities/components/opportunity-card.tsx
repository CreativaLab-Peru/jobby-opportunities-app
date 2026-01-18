'use client';

import { Opportunity } from "@prisma/client";
import {
  Calendar,
  MapPin,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
  Globe,
  Briefcase
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onEdit: (opp: Opportunity) => void;
  onDelete: (id: string) => void;
}

export function OpportunityCard({ opportunity, onEdit, onDelete }: OpportunityCardProps) {
  const isExpired = opportunity.deadline && new Date(opportunity.deadline) < new Date();

  // Formateador de moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: opportunity.currency || 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={cn(
      "group relative flex flex-col sm:flex-row gap-4 p-5 bg-card border rounded-xl transition-all hover:shadow-md hover:border-primary/20",
      opportunity.status === 'ACTIVE' && "opacity-60 grayscale"
    )}>

      {/* 1. Logo y Título */}
      <div className="flex shrink-0">
        <Avatar className="h-14 w-14 rounded-lg border bg-muted">
          <AvatarImage src={opportunity.organizationLogoUrl || ''} className="object-contain p-1" />
          <AvatarFallback className="rounded-lg"><Briefcase className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                {opportunity.type}
              </Badge>
              {opportunity.modality === 'REMOTE' && (
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 text-[10px]">
                  Remoto
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">
              {opportunity.title}
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              {opportunity.organization || 'Organización no especificada'}
            </p>
          </div>

          {/* Acciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(opportunity.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 2. Información Secundaria */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {opportunity.ubication || 'Ubicación remota'}
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            {opportunity.language === 'ES' ? 'Español' : 'Inglés'}
          </div>
          {opportunity.deadline && (
            <div className={cn(
              "flex items-center gap-1.5 font-medium",
              isExpired ? "text-destructive" : "text-amber-600"
            )}>
              <Calendar className="h-3.5 w-3.5" />
              Cierra: {format(new Date(opportunity.deadline), "d MMM, yyyy", { locale: es })}
            </div>
          )}
        </div>

        {/* 3. Salario y Skills (Footer de la Card) */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {opportunity.requiredSkills.slice(0, 3).map(skill => (
              <span key={skill} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium">
                {skill}
              </span>
            ))}
            {opportunity.requiredSkills.length > 3 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{opportunity.requiredSkills.length - 3} más
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {opportunity.minSalary && (
              <div className="text-sm font-semibold text-foreground">
                {formatCurrency(opportunity.minSalary)}
                {opportunity.maxSalary && ` - ${formatCurrency(opportunity.maxSalary)}`}
              </div>
            )}
            {opportunity.url && (
              <Button size="sm" variant="link" className="h-auto p-0 text-primary" asChild>
                <a href={opportunity.url} target="_blank" rel="noopener noreferrer">
                  Ver link <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
