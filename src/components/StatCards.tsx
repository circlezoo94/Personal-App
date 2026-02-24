import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
}

export default function StatCards({ result }: Props) {
  const cards = [
    {
      label: "Total Responses",
      value: result.totalRows,
      sub: `${result.analyzedRows} analyzed`,
      color: "bg-blue-50 border-blue-200 text-blue-700",
    },
    {
      label: "Positive",
      value: `${result.sentiment.positivePercent}%`,
      sub: `${result.sentiment.positive} responses`,
      color: "bg-green-50 border-green-200 text-green-700",
    },
    {
      label: "Neutral",
      value: `${result.sentiment.neutralPercent}%`,
      sub: `${result.sentiment.neutral} responses`,
      color: "bg-yellow-50 border-yellow-200 text-yellow-700",
    },
    {
      label: "Negative",
      value: `${result.sentiment.negativePercent}%`,
      sub: `${result.sentiment.negative} responses`,
      color: "bg-red-50 border-red-200 text-red-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
