"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ProductStats } from "@/types/analysis";

interface Props {
  productStats: ProductStats[];
}

export default function ProductChart({ productStats }: Props) {
  if (productStats.length === 0) return null;

  const data = productStats.map((s) => ({
    name: s.product,
    긍정: s.positiveCount,
    부정: s.negativeCount,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        프로덕트별 긍정 / 부정 피드백
      </h2>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
        >
          <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value: number, name: string) => [`${value}건`, name]} />
          <Legend />
          <Bar dataKey="긍정" stackId="a" fill="#22c55e" />
          <Bar dataKey="부정" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
