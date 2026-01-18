import DashboardScreen from "@/features/dashboard/screens/dashboard-screen";
import {
  getInventoryKPIs,
  getMasterDataHealth,
  getMatchingIntelligence,
  getSkillsAnalytics
} from "@/features/dashboard/actions/dashboard";

export const dynamic = "force-dynamic"; // Asegura data fresca

export default async function DashboardPage() {
  // Ejecutamos todas las consultas en paralelo para máxima velocidad
  const [kpis, skills, health, matching] = await Promise.all([
    getInventoryKPIs(),
    getSkillsAnalytics(),
    getMasterDataHealth(),
    getMatchingIntelligence(),
  ]);

  const dashboardData = { kpis, skills, health, matching };

  return (
    <main className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Dashboard de Oportunidades
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Análisis de mercado, skills y salud de la plataforma en tiempo real.
          </p>
        </header>

        <DashboardScreen data={dashboardData} />
      </div>
    </main>
  );
}
