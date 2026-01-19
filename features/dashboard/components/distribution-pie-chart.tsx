"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
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

// Asegúrate de que las llaves coincidan exactamente con lo que viene en 'item.type'
const typeConfig = {
  INTERNSHIP: { label: "Pasantía", color: "hsl(var(--chart-1))" },
  SCHOLARSHIP: { label: "Beca", color: "hsl(var(--chart-2))" },
  EMPLOYMENT: { label: "Empleo", color: "hsl(var(--chart-3))" },
  EXCHANGE_PROGRAM: { label: "Intercambio", color: "hsl(var(--chart-4))" },
  OTHER: { label: "Otros", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export function DistributionPieChart({ data }: { data: TypeDistributionData[] }) {
  const totalOpportunities = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr._count._all, 0);
  }, [data]);

  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      type: item.type,
      count: item._count._all,
      // Usamos la convención de Shadcn: var(--color-LLAVE)
      fill: `var(--color-${item.type})`,
    }));
  }, [data]);

  return (
    <ChartContainer
      config={typeConfig}
      className="mx-auto aspect-square max-h-[350px] w-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel className="min-w-[150px]" />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="type"
          innerRadius={70}
          outerRadius={90}
          strokeWidth={5}
          stroke="hsl(var(--background))"
          paddingAngle={2}
        >
          {/* IMPORTANTE: No mapeamos Cells manualmente aquí.
             Al pasar el 'fill' en los objetos de 'chartData' con la variable CSS
             que ChartContainer inyecta, Recharts lo reconoce automáticamente.
          */}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                      {totalOpportunities.toLocaleString()}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-xs uppercase font-medium">
                      Total
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="type" />}
          className="flex-wrap gap-x-4 gap-y-2 pt-4"
        />
      </PieChart>
    </ChartContainer>
  );
}
