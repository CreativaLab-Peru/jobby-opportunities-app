'use client';

import { Organization } from "@prisma/client";
import {
  Building2,
  Key,
  MoreVertical,
  Pencil,
  Trash2,
  CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OrganizationCardProps {
  organization: Organization;
  onEdit: (org: Organization) => void;
  onDelete: (id: string) => void;
}

export function OrganizationCard({ organization, onEdit, onDelete }: OrganizationCardProps) {

  return (
    <div className="group relative flex items-center gap-4 p-4 bg-card border rounded-xl transition-all hover:shadow-md hover:border-primary/20">

      {/* 1. Logo / Avatar */}
      <Avatar className="h-14 w-14 rounded-lg border bg-muted shrink-0 shadow-sm">
        <AvatarImage
          src={organization.logoUrl || ''}
          className="object-contain p-1"
        />
        <AvatarFallback className="rounded-lg">
          <Building2 className="h-6 w-6 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      {/* 2. Info Principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-bold text-base leading-tight truncate group-hover:text-primary transition-colors">
            {organization.name}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-md font-mono">
            <Key className="h-3 w-3" />
            {organization.key}
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" />
            Registrado: {format(new Date(organization.createdAt), "MMM yyyy", { locale: es })}
          </div>
        </div>
      </div>

      {/* 3. Acciones */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
          onClick={() => onEdit(organization)}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(organization)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            {/*<DropdownMenuItem*/}
            {/*  onClick={() => onDelete(organization.id)}*/}
            {/*  className="text-destructive focus:text-destructive"*/}
            {/*>*/}
            {/*  <Trash2 className="mr-2 h-4 w-4" /> Eliminar*/}
            {/*</DropdownMenuItem>*/}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
