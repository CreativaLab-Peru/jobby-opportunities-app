'use client';

import { Opportunity } from "@prisma/client";
import {OpportunityCard} from "@/features/opportunities/components/opportunity-card";

interface OpportunityListProps {
  opportunities: Opportunity[];
  onEdit: (opp: Opportunity) => void;
  onDelete: (id: string) => void;
}

export default function OpportunityList({ opportunities, onEdit, onDelete }: OpportunityListProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {opportunities.map((opportunity) => (
        <OpportunityCard
          key={opportunity.id}
          opportunity={opportunity}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
