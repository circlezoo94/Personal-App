"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { KeywordEntry } from "@/types/analysis";

interface Props {
  keywords: KeywordEntry[];
}

export default function KeywordChart({ keywords }: Props) {
  const displayData = keywords.slice(0, 15);
  const maxCount = displayData[0]?.count ?? 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Keywords</h2>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={displayData}
          layout="vertical"
          margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
        >
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="word"
            width={90}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value} mentions`, "Frequency"]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {displayData.map((entry) => (
              <Cell
                key={entry.word}
                fill={`hsl(217, 91%, ${55 + 25 * (1 - entry.count / maxCount)}%)`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
