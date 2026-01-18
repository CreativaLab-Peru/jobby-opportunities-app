import NewOpportunityScreen from "@/features/opportunities/components/new-opportunity-screen";
import {getSkillsActions} from "@/features/skills/actions/get-skills-actions";
import {getAreasAction} from "@/features/areas/actions/get-areas";

export default async function NewOpportunityPage() {
  const [resultsSkill, resultAreas] = await Promise.all([
    getSkillsActions({
      page: 1,
      pageSize: 100,
      orderDirection: 'desc',
      orderBy: 'name',
    }),
    getAreasAction({
      page: 1,
      pageSize: 100,
      orderDirection: 'desc',
      orderBy: 'name',
    })
  ])
  return (
    <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Oportunidad</h1>
        <p className="text-muted-foreground">Define los requisitos y detalles de la vacante.</p>
      </div>

      <NewOpportunityScreen
        initialSkillsOptions={resultsSkill.data}
        initialAreasOptions={resultAreas.data}
      />
    </main>
  );
}
