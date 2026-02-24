import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: Pick<
    AnalysisResult,
    "totalRows" | "totalPositive" | "totalNegative" | "totalReviewed" | "totalUnreviewed" | "detectedColumns"
  >;
}

export default function StatCards({ result }: Props) {
  const total = result.totalRows;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const hasReviewed = !!result.detectedColumns.reviewed;

  const cards = [
    {
      label: "전체 피드백",
      value: total,
      sub: "건",
      color: "bg-blue-50 border-blue-200 text-blue-700",
    },
    {
      label: "긍정 피드백",
      value: result.totalPositive,
      sub: `전체의 ${pct(result.totalPositive)}%`,
      color: "bg-green-50 border-green-200 text-green-700",
    },
    {
      label: "부정 피드백",
      value: result.totalNegative,
      sub: `전체의 ${pct(result.totalNegative)}%`,
      color: "bg-red-50 border-red-200 text-red-700",
    },
    ...(hasReviewed
      ? [
          {
            label: "검토 완료",
            value: result.totalReviewed,
            sub: `전체의 ${pct(result.totalReviewed)}%`,
            color: "bg-purple-50 border-purple-200 text-purple-700",
          },
          {
            label: "미검토",
            value: result.totalUnreviewed,
            sub: `전체의 ${pct(result.totalUnreviewed)}%`,
            color: "bg-orange-50 border-orange-200 text-orange-700",
          },
        ]
      : []),
  ];

  return (
    <div className={`grid gap-4 ${hasReviewed ? "grid-cols-2 md:grid-cols-5" : "grid-cols-3"}`}>
      {cards.map((card) => (
        <div key={card.label} className={`border rounded-xl p-4 ${card.color}`}>
          <p className="text-xs font-medium uppercase tracking-wide opacity-70">
            {card.label}
          </p>
          <p className="text-3xl font-bold mt-1">{card.value}</p>
          <p className="text-xs mt-1 opacity-60">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
