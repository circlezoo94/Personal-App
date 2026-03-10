import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: Pick<
    AnalysisResult,
    "totalRows" | "totalPositive" | "totalNegative" | "totalReviewed" | "totalUnreviewed" | "detectedColumns"
  >;
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
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
      icon: <ChatIcon />,
      iconColor: "text-purple-400",
      accent: null,
    },
    {
      label: "긍정 피드백",
      value: result.totalPositive,
      sub: `전체의 ${pct(result.totalPositive)}%`,
      icon: <ThumbUpIcon />,
      iconColor: "text-green-400",
      accent: "bg-green-400",
    },
    {
      label: "부정 피드백",
      value: result.totalNegative,
      sub: `전체의 ${pct(result.totalNegative)}%`,
      icon: <ThumbDownIcon />,
      iconColor: "text-red-400",
      accent: "bg-red-400",
    },
    ...(hasReviewed
      ? [
          {
            label: "검토 완료",
            value: result.totalReviewed,
            sub: `전체의 ${pct(result.totalReviewed)}%`,
            icon: <CheckIcon />,
            iconColor: "text-blue-400",
            accent: "bg-blue-400",
          },
          {
            label: "미검토",
            value: result.totalUnreviewed,
            sub: `전체의 ${pct(result.totalUnreviewed)}%`,
            icon: <ClockIcon />,
            iconColor: "text-yellow-400",
            accent: "bg-yellow-400",
          },
        ]
      : []),
  ];

  return (
    <div className={`grid gap-4 ${hasReviewed ? "grid-cols-2 md:grid-cols-5" : "grid-cols-3"}`}>
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-100 shadow-sm bg-white p-5 relative overflow-hidden"
        >
          <div className={`${card.iconColor} mb-3`}>{card.icon}</div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
          <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          {card.accent && (
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${card.accent}`} />
          )}
        </div>
      ))}
    </div>
  );
}
