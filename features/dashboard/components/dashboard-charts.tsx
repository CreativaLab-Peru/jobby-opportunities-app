"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface SkillData {
  name: string;
  count: number;
}

// Configuración extendida para soportar múltiples colores
const skillsConfig = {
  count: {
    label: "Demanda",
  },
  // Definimos slots de colores para las barras
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

export function SkillsBarChart({ data }: { data: SkillData[] }) {
  return (
    <ChartContainer config={skillsConfig} className="min-h-[400px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 10, right: 60, top: 20, bottom: 10 }}
        barSize={32} // Tamaño fijo para mayor consistencia
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.4} />

        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          hide // Mantenemos oculto porque usamos LabelList dentro
        />

        <XAxis type="number" hide />

        <ChartTooltip
          cursor={{ fill: "rgba(0,0,0,0.05)" }}
          content={<ChartTooltipContent indicator="line" />}
        />

        <Bar
          dataKey="count"
          radius={[0, 4, 4, 0]} // Redondeado solo en la punta derecha
        >
          {/* Mapeo de colores dinámicos */}
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={`var(--chart-${(index % 5) + 1})`}
              fillOpacity={0.9}
            />
          ))}

          {/* Nombre de la Skill (Dentro de la barra) */}
          <LabelList
            dataKey="name"
            position="insideLeft"
            offset={12}
            className="fill-white font-bold text-[11px] uppercase tracking-wider"
            style={{ pointerEvents: 'none', textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
          />

          {/* Valor numérico (Fuera de la barra) */}
          <LabelList
            dataKey="count"
            position="right"
            offset={12}
            className="fill-muted-foreground font-mono font-semibold"
            fontSize={14}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
