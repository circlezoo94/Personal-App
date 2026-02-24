"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { HospitalStats } from "@/types/analysis";

interface Props {
  hospitalStats: HospitalStats[];
}

export default function HospitalChart({ hospitalStats }: Props) {
  if (hospitalStats.length === 0) return null;

  const data = hospitalStats.slice(0, 15).map((s) => ({
    name: s.hospital,
    긍정: s.positiveCount,
    부정: s.negativeCount,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        병원별 긍정 / 부정 피드백
      </h2>
      <ResponsiveContainer width="100%" height={Math.max(240, data.length * 40)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
        >
          <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${value}건`, name]}
          />
          <Legend />
          <Bar dataKey="긍정" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
          <Bar dataKey="부정" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
