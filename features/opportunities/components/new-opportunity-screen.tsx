'use client';

import {useRouter} from 'next/navigation';
import {useCallback, useState, useMemo} from 'react';
import {toast} from "sonner";
import debounce from "lodash.debounce";

import OpportunityForm from '@/components/opportunity-form';
import {OpportunityFormValues} from "@/features/opportunities/schemas/opportunity.schema";
import {getSkillsActions} from "@/features/skills/actions/get-skills-actions";
import {createOpportunityAction} from "@/features/opportunities/actions/create-opportunity-action";
import {createSkillAction} from "@/features/skills/actions/create-skill-action";
import {AreaOption} from "@/features/areas/types";
import {SkillOption} from "@/features/opportunities/type";

interface NewOpportunityScreenProps {
  initialSkillsOptions: SkillOption[];
  initialAreasOptions: AreaOption[];
}

export default function NewOpportunityScreen({
                                               initialSkillsOptions,
                                               initialAreasOptions
                                             }: NewOpportunityScreenProps) {
  const router = useRouter();
  const [skillsOptions, setSkillsOptions] = useState<SkillOption[]>(initialSkillsOptions);
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>(initialAreasOptions)

  // Usamos useMemo para que la función debounced sea persistente entre renders
  const handleSearchSkills = useMemo(() =>
      debounce(async (query: string) => {
        if (query.length < 2) return;
        const results = await getSkillsActions({
          page: 1,
          pageSize: 10,
          search: query,
          orderBy: 'name',
          orderDirection: 'asc',
        });
        if (results?.success && results.data.length > 0) {
          setSkillsOptions(prev => {
            const existing = new Set(prev.map(opt => opt.value));
            const newOnes = results?.data?.filter(r => !existing.has(r.value));
            return [...prev, ...newOnes];
          });
        }
      }, 300),
    []);

  const handleCreate = useCallback(async (data: OpportunityFormValues) => {
    const toastId = toast.loading("Guardando oportunidad...");
    const result = await createOpportunityAction(data);

    if (result.success) {
      toast.success("Publicada con éxito", {id: toastId});
      router.push('/dashboard');
      router.refresh();
    } else {
      toast.error(result.error || "Ocurrió un error", {id: toastId});
    }
  }, [router]);

  const handleCreateSkill = useCallback(async (name: string) => {
    const result = await createSkillAction(name);
    if (result.success && result.data) {
      setSkillsOptions(prev => [result.data!, ...prev]);
      toast.success(`Habilidad "${name}" lista`);
      return result.data;
    }
    toast.error("No se pudo crear la habilidad");
    return null;
  }, []);

  return (
    <OpportunityForm
      skillsOptions={skillsOptions}
      areaOptions={areaOptions}
      onSubmit={handleCreate}
      onCancel={() => router.back()}
      searchSkills={handleSearchSkills}
      createSkill={handleCreateSkill}
    />
  );
}
