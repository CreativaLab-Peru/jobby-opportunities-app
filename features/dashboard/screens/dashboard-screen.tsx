"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, AlertTriangle, Cpu, Globe } from "lucide-react";
import {StatCard} from "@/features/dashboard/components/stat-card";
import {SkillsBarChart} from "@/features/dashboard/components/dashboard-charts";
import {DistributionPieChart} from "@/features/dashboard/components/distribution-pie-chart";

// Tipado para la data que viene del server action
interface DashboardData {
  kpis: {
    totalActive: number;
    expiringSoon: number;
    typeDistribution: any[];
  };
  skills: {
    topSkills: Array<{ name: string; count: number }>;
  };
  health: {
    geographicDiversity: number;
    anonymousOrgs: number;
    visualIdentityRate: number;
  };
  matching: {
    matchDensity: number;
    recentTags: number;
  };
}

export default function DashboardScreen({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      {/* KPIs Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Activas" value={data.kpis.totalActive} icon={Briefcase} />
        <StatCard title="Expira pronto" value={data.kpis.expiringSoon} icon={AlertTriangle} />
        <StatCard title="Matches" value={data.matching.matchDensity} icon={Cpu} />
        <StatCard title="Países" value={data.health.geographicDiversity} icon={Globe} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Skills Chart con Shadcn UI */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Skills Demandadas</CardTitle>
            <CardDescription>Habilidades requeridas en ofertas activas</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillsBarChart data={data.skills.topSkills} />
          </CardContent>
        </Card>

        {/* Pie Chart con Shadcn UI */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Distribución de Ofertas</CardTitle>
            <CardDescription>Por tipo de contrato</CardDescription>
          </CardHeader>
          <CardContent>
            <DistributionPieChart data={data.kpis.typeDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Health Checks Footer */}
      <div className="grid gap-4 md:grid-cols-3">
        <HealthCard
          label="Salud de Logos"
          value={`${data.health.visualIdentityRate.toFixed(1)}%`}
          status={data.health.visualIdentityRate > 80 ? "good" : "warning"}
        />
        <HealthCard
          label="Orgs por Vincular"
          value={data.health.anonymousOrgs}
          status={data.health.anonymousOrgs === 0 ? "good" : "danger"}
        />
        <HealthCard
          label="Nuevos Tags"
          value={data.matching.recentTags}
          status="neutral"
        />
      </div>
    </div>
  );
}

function HealthCard({ label, value, status }: { label: string, value: string | number, status: string }) {
  const bgColors: any = { good: "bg-emerald-50", warning: "bg-amber-50", danger: "bg-red-50", neutral: "bg-slate-50" };
  const textColors: any = { good: "text-emerald-700", warning: "text-amber-700", danger: "text-red-700", neutral: "text-slate-700" };

  return (
    <div className={`p-4 rounded-xl border ${bgColors[status]}`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${textColors[status]}`}>{value}</p>
    </div>
  );
}
