"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface TypeDistributionData {
  type: string;
  _count: { _all: number };
}

const typeConfig = {
  count: {
    label: "Oportunidades",
    color: "transparent",
  },
  INTERNSHIP: { label: "Pasantía", color: "hsl(var(--chart-1))" },
  SCHOLARSHIP: { label: "Beca", color: "hsl(var(--chart-2))" },
  EMPLOYMENT: { label: "Empleo", color: "hsl(var(--chart-3))" },
  EXCHANGE_PROGRAM: { label: "Intercambio", color: "hsl(var(--chart-4))" },
  OTHER: { label: "Otros", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export function DistributionPieChart({ data }: { data: TypeDistributionData[] }) {
  const chartData = data.map((item) => {
    // 1. Obtenemos la clave del config
    const configKey = item.type as keyof typeof typeConfig;

    // 2. Accedemos de forma segura al color
    // Usamos un Type Assertion o verificamos si existe la propiedad color
    const configItem = typeConfig[configKey];
    const fill = (configItem && 'color' in configItem)
      ? configItem.color
      : "hsl(var(--chart-5))"; // Fallback por defecto

    return {
      type: item.type,
      count: item._count._all,
      fill: fill,
    };
  });

  return (
    <ChartContainer
      config={typeConfig}
      className="mx-auto aspect-square max-h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="type"
          innerRadius={60}
          strokeWidth={2}
          stroke="hsl(var(--background))"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="type" />}
          className="-translate-y-2 flex-wrap"
        />
      </PieChart>
    </ChartContainer>
  );
}
