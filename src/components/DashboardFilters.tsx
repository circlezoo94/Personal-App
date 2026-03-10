"use client";

import { useState } from "react";
import HospitalMappingModal from "@/components/HospitalMappingModal";

interface Props {
  hospitals: string[];
  selectedHospitals: string[];
  onHospitalsChange: (v: string[]) => void;

  rawHospitals: string[];
  onMappingChange: (mapping: Record<string, string>) => void;

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

const HOSPITAL_PAGE_SIZE = 8;

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  );
}

function HospitalTag({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
        active
          ? "bg-purple-600 text-white border-purple-600"
          : "bg-white border-gray-200 text-gray-700 hover:border-purple-300"
      }`}
    >
      {children}
    </button>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
        active
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
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
  rawHospitals,
  onMappingChange,
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
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [showAllHospitals, setShowAllHospitals] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);

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

  const filteredHospitals = hospitals.filter((h) =>
    h.toLowerCase().includes(hospitalSearch.toLowerCase())
  );
  const visibleHospitals = showAllHospitals
    ? filteredHospitals
    : filteredHospitals.slice(0, HOSPITAL_PAGE_SIZE);
  const hiddenCount = filteredHospitals.length - HOSPITAL_PAGE_SIZE;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        {/* 병원 필터 */}
        {hospitals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">병원 필터</p>
              <button
                onClick={() => setShowMappingModal(true)}
                className="text-xs text-purple-600 border border-purple-200 rounded px-3 py-1 hover:bg-purple-50"
              >
                🏥 병원명 통합
              </button>
            </div>
            <div className="relative mb-2">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              <input
                type="text"
                value={hospitalSearch}
                onChange={(e) => setHospitalSearch(e.target.value)}
                placeholder="병원 검색..."
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <HospitalTag active={selectedHospitals.length === 0} onClick={() => onHospitalsChange([])}>
                전체
              </HospitalTag>
              {visibleHospitals.map((h) => (
                <HospitalTag
                  key={h}
                  active={selectedHospitals.includes(h)}
                  onClick={() => toggle(selectedHospitals, h, onHospitalsChange)}
                >
                  {h}
                </HospitalTag>
              ))}
              {!hospitalSearch && hiddenCount > 0 && (
                <button
                  onClick={() => setShowAllHospitals((v) => !v)}
                  className="px-3 py-1 text-xs rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-gray-400"
                >
                  {showAllHospitals ? "접기 ∧" : `+${hiddenCount}개 더 보기 ∨`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 프로덕트 필터 */}
        {products.length > 0 && (
          <FilterGroup label="프로덕트 필터">
            <div className="flex flex-wrap gap-2">
              <HospitalTag active={selectedProducts.length === 0} onClick={() => onProductsChange([])}>
                전체
              </HospitalTag>
              {products.map((p) => (
                <HospitalTag
                  key={p}
                  active={selectedProducts.includes(p)}
                  onClick={() => toggle(selectedProducts, p, onProductsChange)}
                >
                  {p}
                </HospitalTag>
              ))}
            </div>
          </FilterGroup>
        )}

        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          <FilterGroup label="기간">
            <div className="flex gap-2">
              {QUICK_DATE_LABELS.map(({ value, label }) => (
                <FilterButton
                  key={value}
                  active={quickDate === value && !dateStart && !dateEnd}
                  onClick={() => handleQuickDate(value)}
                >
                  {label}
                </FilterButton>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="날짜 범위">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateStart}
                onChange={(e) => handleDateRange(e.target.value, dateEnd)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
              <span className="text-gray-400 text-xs">~</span>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => handleDateRange(dateStart, e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>
          </FilterGroup>

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
                  <FilterButton
                    key={value}
                    active={reviewStatus === value}
                    onClick={() => onReviewStatusChange(value)}
                  >
                    {label}
                  </FilterButton>
                ))}
              </div>
            </FilterGroup>
          )}
        </div>
      </div>

      {showMappingModal && (
        <HospitalMappingModal
          hospitals={rawHospitals}
          onClose={() => setShowMappingModal(false)}
          onSave={(mapping) => {
            onMappingChange(mapping);
            onHospitalsChange([]);
          }}
        />
      )}
    </>
  );
}
