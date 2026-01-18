'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback } from 'react';
import { toast } from "sonner";
import debounce from "lodash.debounce";

import OpportunityForm from '@/components/opportunity-form';
import { getSkillsActions } from "@/features/skills/actions/get-skills-actions";
import { createSkillByNameAction } from "@/features/skills/actions/create-skill-by-name-action";
import {Opportunity} from "@prisma/client";
import {updateOpportunityAction} from "@/features/opportunities/actions/update-opportunity-action";

interface Props {
  initialData: Opportunity; // Aquí vendrá la oportunidad de Prisma
}

export default function EditOpportunityScreen({ initialData }: Props) {
  const router = useRouter();

  // Inicializamos las opciones de skills con las que ya tiene la oportunidad
  const [skillsOptions, setSkillsOptions] = useState(() => {
    const skills = [
      ...(initialData.requiredSkills || []),
      ...(initialData.optionalSkills || [])
    ];
    return Array.from(new Set(skills)).map(s => ({ label: s, value: s }));
  });

  // --- BUSQUEDA DE SKILLS (DEBOUNCED) ---
  const handleSearchSkills = useMemo(() =>
      debounce(async (query: string) => {
        if (query.length < 2) return;
        const results = await getSkillsActions(query);
        if (results?.length > 0) {
          setSkillsOptions(prev => {
            const existing = new Set(prev.map(opt => opt.value));
            const newOnes = results.filter(r => !existing.has(r.value));
            return [...prev, ...newOnes];
          });
        }
      }, 300),
    []);

  // --- CREACIÓN DE SKILLS ---
  const handleCreateSkill = useCallback(async (name: string) => {
    const result = await createSkillByNameAction(name);
    if (result.success && result.data) {
      setSkillsOptions(prev => [result.data!, ...prev]);
      return result.data;
    }
    return null;
  }, []);

  // --- ACTUALIZACIÓN ---
  const handleUpdate = async (data: any) => {
    const toastId = toast.loading("Actualizando cambios...");
    const result = await updateOpportunityAction(initialData.id, data);

    if (result.success) {
      toast.success("Oportunidad actualizada", { id: toastId });
      router.push('/dashboard');
      router.refresh();
    } else {
      toast.error(result.error || "Error al actualizar", { id: toastId });
    }
  };

  return (
    <OpportunityForm
      opportunity={initialData} // El formulario se pre-rellena aquí
      onSubmit={handleUpdate}
      onCancel={() => router.back()}
      skillsOptions={skillsOptions}
      searchSkills={handleSearchSkills}
      createSkill={handleCreateSkill}
    />
  );
}
