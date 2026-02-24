"use client";

interface Props {
  hospitals: string[];
  selectedHospitals: string[];
  onHospitalsChange: (v: string[]) => void;

  quickDate: "all" | "today" | "week" | "month";
  onQuickDateChange: (v: "all" | "today" | "week" | "month") => void;

  dateStart: string;
  dateEnd: string;
  onDateStartChange: (v: string) => void;
  onDateEndChange: (v: string) => void;

  reviewStatus: "all" | "reviewed" | "unreviewed";
  onReviewStatusChange: (v: "all" | "reviewed" | "unreviewed") => void;

  hasReviewedColumn: boolean;
}

const QUICK_DATE_LABELS: { value: "all" | "today" | "week" | "month"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "today", label: "오늘" },
  { value: "week", label: "이번 주" },
  { value: "month", label: "이번 달" },
];

export default function DashboardFilters({
  hospitals,
  selectedHospitals,
  onHospitalsChange,
  quickDate,
  onQuickDateChange,
  dateStart,
  dateEnd,
  onDateStartChange,
  onDateEndChange,
  reviewStatus,
  onReviewStatusChange,
  hasReviewedColumn,
}: Props) {
  const toggleHospital = (h: string) => {
    if (selectedHospitals.includes(h)) {
      onHospitalsChange(selectedHospitals.filter((x) => x !== h));
    } else {
      onHospitalsChange([...selectedHospitals, h]);
    }
  };

  const handleQuickDate = (v: "all" | "today" | "week" | "month") => {
    onQuickDateChange(v);
    onDateStartChange("");
    onDateEndChange("");
  };

  const handleDateRange = (start: string, end: string) => {
    onDateStartChange(start);
    onDateEndChange(end);
    if (start || end) onQuickDateChange("all");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      {/* 병원 필터 */}
      {hospitals.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            병원 필터
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onHospitalsChange([])}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedHospitals.length === 0
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              전체
            </button>
            {hospitals.map((h) => (
              <button
                key={h}
                onClick={() => toggleHospital(h)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedHospitals.includes(h)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {/* 날짜 빠른 선택 */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            기간
          </p>
          <div className="flex gap-2">
            {QUICK_DATE_LABELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleQuickDate(value)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  quickDate === value && !dateStart && !dateEnd
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 범위 직접 선택 */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            날짜 범위
          </p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateStart}
              onChange={(e) => handleDateRange(e.target.value, dateEnd)}
              className="text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <span className="text-gray-400 text-xs">~</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => handleDateRange(dateStart, e.target.value)}
              className="text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* 검토 여부 */}
        {hasReviewedColumn && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              검토 여부
            </p>
            <div className="flex gap-2">
              {(
                [
                  { value: "all", label: "전체" },
                  { value: "reviewed", label: "검토 완료" },
                  { value: "unreviewed", label: "미검토" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onReviewStatusChange(value)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    reviewStatus === value
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
