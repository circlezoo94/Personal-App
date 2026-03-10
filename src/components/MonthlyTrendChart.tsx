"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { FeedbackRow } from "@/types/analysis";
import type { TooltipProps } from "recharts";

interface Props {
  rows: FeedbackRow[];
}

interface MonthData {
  month: string;
  긍정: number;
  부정: number;
  total: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, p) => sum + (p.value ?? 0), 0);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}건
        </p>
      ))}
      <p className="text-gray-500 mt-1 border-t pt-1">총 {total}건</p>
    </div>
  );
}

export default function MonthlyTrendChart({ rows }: Props) {
  const monthMap = new Map<string, { 긍정: number; 부정: number }>();

  for (const row of rows) {
    if (!row.date) continue;
    const month = row.date.slice(0, 7);
    if (!month || month.length < 7) continue;
    if (!monthMap.has(month)) monthMap.set(month, { 긍정: 0, 부정: 0 });
    const entry = monthMap.get(month)!;
    if (row.hasPositive) entry.긍정 += 1;
    if (row.hasNegative) entry.부정 += 1;
  }

  if (monthMap.size === 0) return null;

  const data: MonthData[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, counts]) => ({ month, ...counts, total: counts.긍정 + counts.부정 }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">월별 피드백 추이</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 16, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="긍정" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="부정" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
