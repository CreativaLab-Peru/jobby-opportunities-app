'use client';

import { Organization } from "@prisma/client";
import { OrganizationCard } from "./organization-card";

interface OrganizationListProps {
  organizations: Organization[];
  onEdit: (org: Organization) => void;
  onDelete: (id: string) => void;
}

export default function OrganizationList({
                                           organizations,
                                           onEdit,
                                           onDelete
                                         }: OrganizationListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {organizations.map((org) => (
        <OrganizationCard
          key={org.id}
          organization={org}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
