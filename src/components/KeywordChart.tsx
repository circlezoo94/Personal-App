"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { KeywordEntry } from "@/types/analysis";

interface SingleChartProps {
  keywords: KeywordEntry[];
  title: string;
  color: string;
}

function SingleKeywordChart({ keywords, title, color }: SingleChartProps) {
  const data = keywords.slice(0, 12);
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
        <p className="text-sm text-gray-400 text-center py-8">데이터 없음</p>
      </div>
    );
  }
  const maxCount = data[0].count;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
        >
          <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis type="category" dataKey="word" width={80} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => [`${value}건`, "빈도"]} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.word}
                fill={color}
                opacity={0.5 + 0.5 * (entry.count / maxCount)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface Props {
  positiveKeywords: KeywordEntry[];
  negativeKeywords: KeywordEntry[];
}

export default function KeywordChart({ positiveKeywords, negativeKeywords }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SingleKeywordChart
        keywords={positiveKeywords}
        title="긍정 피드백 주요 키워드"
        color="#22c55e"
      />
      <SingleKeywordChart
        keywords={negativeKeywords}
        title="부정 피드백 주요 키워드"
        color="#ef4444"
      />
    </div>
  );
}
