"use client";

interface Props {
  hospitals: string[];
  selectedHospitals: string[];
  onHospitalsChange: (v: string[]) => void;

  products: string[];
  selectedProducts: string[];
  onProductsChange: (v: string[]) => void;

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

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  color = "blue",
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: "blue" | "indigo" | "purple" | "teal";
  children: React.ReactNode;
}) {
  const activeClass = {
    blue: "bg-blue-600 text-white border-blue-600",
    indigo: "bg-indigo-600 text-white border-indigo-600",
    purple: "bg-purple-600 text-white border-purple-600",
    teal: "bg-teal-600 text-white border-teal-600",
  }[color];
  const hoverClass = {
    blue: "hover:border-blue-400",
    indigo: "hover:border-indigo-400",
    purple: "hover:border-purple-400",
    teal: "hover:border-teal-400",
  }[color];

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
        active ? activeClass : `bg-white text-gray-600 border-gray-300 ${hoverClass}`
      }`}
    >
      {children}
    </button>
  );
}

export default function DashboardFilters({
  hospitals,
  selectedHospitals,
  onHospitalsChange,
  products,
  selectedProducts,
  onProductsChange,
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
  const toggle = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
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
        <FilterGroup label="병원 필터">
          <div className="flex flex-wrap gap-2">
            <ToggleButton active={selectedHospitals.length === 0} onClick={() => onHospitalsChange([])}>
              전체
            </ToggleButton>
            {hospitals.map((h) => (
              <ToggleButton
                key={h}
                active={selectedHospitals.includes(h)}
                onClick={() => toggle(selectedHospitals, h, onHospitalsChange)}
              >
                {h}
              </ToggleButton>
            ))}
          </div>
        </FilterGroup>
      )}

      {/* 프로덕트 필터 */}
      {products.length > 0 && (
        <FilterGroup label="프로덕트 필터">
          <div className="flex flex-wrap gap-2">
            <ToggleButton
              active={selectedProducts.length === 0}
              onClick={() => onProductsChange([])}
              color="teal"
            >
              전체
            </ToggleButton>
            {products.map((p) => (
              <ToggleButton
                key={p}
                active={selectedProducts.includes(p)}
                onClick={() => toggle(selectedProducts, p, onProductsChange)}
                color="teal"
              >
                {p}
              </ToggleButton>
            ))}
          </div>
        </FilterGroup>
      )}

      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        {/* 날짜 빠른 선택 */}
        <FilterGroup label="기간">
          <div className="flex gap-2">
            {QUICK_DATE_LABELS.map(({ value, label }) => (
              <ToggleButton
                key={value}
                active={quickDate === value && !dateStart && !dateEnd}
                onClick={() => handleQuickDate(value)}
                color="indigo"
              >
                {label}
              </ToggleButton>
            ))}
          </div>
        </FilterGroup>

        {/* 날짜 범위 직접 선택 */}
        <FilterGroup label="날짜 범위">
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
        </FilterGroup>

        {/* 검토 여부 */}
        {hasReviewedColumn && (
          <FilterGroup label="검토 여부">
            <div className="flex gap-2">
              {(
                [
                  { value: "all", label: "전체" },
                  { value: "reviewed", label: "검토 완료" },
                  { value: "unreviewed", label: "미검토" },
                ] as const
              ).map(({ value, label }) => (
                <ToggleButton
                  key={value}
                  active={reviewStatus === value}
                  onClick={() => onReviewStatusChange(value)}
                  color="purple"
                >
                  {label}
                </ToggleButton>
              ))}
            </div>
          </FilterGroup>
        )}
      </div>
    </div>
  );
}
