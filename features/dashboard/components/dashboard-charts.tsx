"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// --- TIPOS ---
interface SkillData {
  name: string;
  count: number;
}

// --- CONFIGURACIÓN DE SHADCN ---
const skillsConfig = {
  count: {
    label: "Demanda",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;


export function SkillsBarChart({ data }: { data: SkillData[] }) {
  return (
    <ChartContainer config={skillsConfig} className="min-h-[300px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 10, right: 40 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          hide
        />
        <XAxis type="number" hide />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={5}>
          <LabelList
            dataKey="name"
            position="insideLeft"
            offset={8}
            className="fill-white font-medium shadow-sm"
            fontSize={12}
          />
          <LabelList
            dataKey="count"
            position="right"
            offset={8}
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
