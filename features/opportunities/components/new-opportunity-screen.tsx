'use client';

import {useRouter} from 'next/navigation';
import {useCallback, useState} from 'react';
import {toast} from "sonner";

import OpportunityForm from '@/components/opportunity-form';
import {OpportunityFormValues} from "@/features/opportunities/schemas/opportunity.schema";
import {getSkillsActions} from "@/features/skills/actions/get-skills-actions";
import {createOpportunityAction} from "@/features/opportunities/actions/create-opportunity-action";
import {createSkillByNameAction} from "@/features/skills/actions/create-skill-by-name-action";
import {AreaOption} from "@/features/areas/types";
import {createAreaAction} from "@/features/areas/actions/create-area-action";
import {getAreasAction} from "@/features/areas/actions/get-areas-action";
import {SkillOption} from "@/features/skills/type";
import {OrganizationOption} from "@/features/organizations/types";
import {createOrganizationAction} from "@/features/organizations/actions/create-organization-action";
import {getOrganizationsActions} from "@/features/organizations/actions/get-organizations-actions";

interface NewOpportunityScreenProps {
  initialSkillsOptions: SkillOption[];
  initialAreasOptions: AreaOption[];
  initialOrganizationsOptions: OrganizationOption[];
}

export default function NewOpportunityScreen({
                                               initialSkillsOptions,
                                               initialAreasOptions,
                                               initialOrganizationsOptions
                                             }: NewOpportunityScreenProps) {
  const router = useRouter();
  const [skillsOptions, setSkillsOptions] = useState<SkillOption[]>(initialSkillsOptions);
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>(initialAreasOptions)
  const [organizationOptions, setOrganizationOptions] = useState<OrganizationOption[]>(initialOrganizationsOptions)

  // Usamos useMemo para que la función debounced sea persistente entre renders
  const handleSearchSkills = useCallback(async(search: string) => {
    if (search.length < 2) return [];
    try {
      const results = await getSkillsActions({
        page: 1,
        pageSize: 10,
        search,
        orderBy: 'createdAt',
        orderDirection: 'asc',
      });
      if (results?.success && results.data.length > 0) {
        return results.data
      } else {
        return [];
      }
    } catch (error) {
      console.error("[ERROR_SEARCH_SKILLS", error);
      return [];
    }
  },[]);

  const handleCreateOpportunity = useCallback(async (data: OpportunityFormValues) => {
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
    const result = await createSkillByNameAction(name);
    if (result.success && result.data) {
      setSkillsOptions(prev => [result.data!, ...prev]);
      toast.success(`Habilidad "${name}" lista`);
      return result.data;
    }
    toast.error("No se pudo crear la habilidad");
    return null;
  }, []);

  const handleCreateArea = useCallback(async (name: string) => {
    const result = await createAreaAction(name);
    if (result.success && result.data) {
      setAreaOptions(prev => [result.data!, ...prev]);
      toast.success(`Area "${name}" lista`);
      return result.data;
    }
    toast.error("No se pudo crear la habilidad");
    return null;
  }, []);

  const handleSearchAreas = useCallback(async (search: string) => {
    if (search.length < 2) return [];
    const results = await getAreasAction({
      page: 1,
      pageSize: 10,
      search,
      orderBy: 'createdAt',
      orderDirection: 'asc',
    });
    if (results?.success && results.data.length > 0) {
      return results.data
    }
    return []
  },[]);

  const handleSearchOrganizations = useCallback(async (search: string) => {
    if (search.length < 2) return [];
    const results = await getOrganizationsActions({
      page: 1,
      pageSize: 10,
      search,
      orderBy: 'createdAt',
      orderDirection: 'asc',
    });
    if (results?.success && results.data.length > 0) {
      return results.data
    }
    return []
  }, []);

  const handleCreateOrganization = useCallback(async (name: string) => {
    const result = await createOrganizationAction(name);
    if (result.success && result.data) {
      setOrganizationOptions(prev => [result.data!, ...prev]);
      toast.success(`Organizacion "${name}" lista`);
      return result.data;
    }
    toast.error("No se pudo crear la organizacion");
    return null;
  }, []);

  return (
    <OpportunityForm
      onSubmit={handleCreateOpportunity}
      onCancel={() => router.back()}

      skillsOptions={skillsOptions}
      searchSkills={handleSearchSkills}
      createSkill={handleCreateSkill}

      areaOptions={areaOptions}
      searchAreas={handleSearchAreas}
      createArea={handleCreateArea}

      organizationOptions={organizationOptions}
      searchOrganizations={handleSearchOrganizations}
      createOrganization={handleCreateOrganization}
    />
  );
}
