import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditOpportunityScreen from "@/features/opportunities/screens/edit-opportunity-screen";
import {SkillOption} from "@/features/skills/type";
import {AreaOption} from "@/features/areas/types";
import {OrganizationOption} from "@/features/organizations/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditOpportunityPage({ params }: Props) {
  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
  });

  if (!opportunity) {
    return notFound();
  }

  const initialSkillsOptions: SkillOption[] = [];
  const initialAreaOptions: AreaOption[] = [];
  const initialOrganizationOptions : OrganizationOption[] = [];

  // Get skills
  const currentKeysRequiredSkills = opportunity?.requiredSkills || [];
  const currentKeysOptionalSkills = opportunity?.optionalSkills || [];
  const findRequiredSkills = await prisma.skill.findMany({
    where: { key: { in: currentKeysRequiredSkills } },
  })
  const findOptionalSkills = await prisma.skill.findMany({
    where: { key: { in: currentKeysOptionalSkills } },
  })

  for (const skill of [...findRequiredSkills, ...findOptionalSkills]) {
    const skillOption = { value: skill.key, label: skill.name };
    if (!initialSkillsOptions.find(opt => opt.value === skillOption.value)) {
      initialSkillsOptions.push(skillOption);
    }
  }

  // Get area
  const currentKeyAreas = opportunity.areas;
  if (currentKeyAreas.length > 0) {
    const areaSkill = await prisma.area.findMany({
      where: { key: { in: currentKeyAreas } },
    });
    if (areaSkill) {
      areaSkill.forEach(area => {
        const areaOption = { value: area.key, label: area.name };
        if (!initialAreaOptions.find(opt => opt.value === areaOption.value)) {
          initialAreaOptions.push(areaOption);
        }
      })
    }
  }

  // Get organization
  const currentKeyOrganization = opportunity.organization;
  if (currentKeyOrganization) {
    const organization = await prisma.organization.findUnique({
      where: { key: currentKeyOrganization },
    });
    if (organization) {
      const orgOption = { value: organization.key, label: organization.name, logoUrl: organization.logoUrl || undefined };
      initialOrganizationOptions.push(orgOption);
    }
  }

  return (
    <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Editar Oportunidad</h1>
        <p className="text-muted-foreground">Actualiza los detalles de la vacante.</p>
      </div>

      {/* Edit Opportunity Screen */}
      <EditOpportunityScreen
        initialData={opportunity}
        initialSkillsOptions={initialSkillsOptions}
        initialAreasOptions={initialAreaOptions}
        initialOrganizationsOptions={initialOrganizationOptions}
      />
    </main>
  );
}
