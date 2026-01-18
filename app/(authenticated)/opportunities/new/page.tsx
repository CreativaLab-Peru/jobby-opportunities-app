import {getSkillsActions} from "@/features/skills/actions/get-skills-actions";
import {getAreasAction} from "@/features/areas/actions/get-areas-action";
import {getOrganizationsActions} from "@/features/organizations/actions/get-organizations-actions";
import NewOpportunityScreen from "@/features/opportunities/screens/new-opportunity-screen";

export default async function NewOpportunityPage() {
  const [resultsSkill, resultAreas, resultOrganizations] = await Promise.all([
    getSkillsActions({
      page: 1,
      pageSize: 24,
      orderDirection: 'desc',
      orderBy: 'createdAt',
    }),
    getAreasAction({
      page: 1,
      pageSize: 24,
      orderDirection: 'desc',
      orderBy: 'createdAt',
    }),
    getOrganizationsActions({
      page: 1,
      pageSize: 24,
      orderDirection: 'desc',
      orderBy: 'createdAt',
    })
  ])
  return (
    <main className="max-w-6xl mx-auto py-10 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Oportunidad</h1>
        <p className="text-muted-foreground">Define los requisitos y detalles de la vacante.</p>
      </div>

      <NewOpportunityScreen
        initialSkillsOptions={resultsSkill.data}
        initialAreasOptions={resultAreas.data}
        initialOrganizationsOptions={resultOrganizations.data}
      />
    </main>
  );
}
