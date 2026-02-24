"use client";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SentimentBreakdown } from "@/types/analysis";

interface Props {
  sentiment: SentimentBreakdown;
}

const COLORS: Record<string, string> = {
  Positive: "#22c55e",
  Neutral: "#eab308",
  Negative: "#ef4444",
};

export default function SentimentChart({ sentiment }: Props) {
  const data = [
    { name: "Positive", value: sentiment.positive },
    { name: "Neutral", value: sentiment.neutral },
    { name: "Negative", value: sentiment.negative },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Sentiment Distribution
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} responses`,
              name,
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
