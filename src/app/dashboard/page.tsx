"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult, FeedbackRow, HospitalStats } from "@/types/analysis";
import StatCards from "@/components/StatCards";
import SentimentChart from "@/components/SentimentChart";
import KeywordChart from "@/components/KeywordChart";
import FeedbackTable from "@/components/FeedbackTable";
import HospitalChart from "@/components/HospitalChart";
import ProductChart from "@/components/ProductChart";
import DashboardFilters from "@/components/DashboardFilters";
import LoadingSpinner from "@/components/LoadingSpinner";
import { buildHospitalStats, buildProductStats, extractKeywords } from "@/lib/hospitalAnalyzer";

type QuickDate = "all" | "today" | "week" | "month";
type ReviewStatus = "all" | "reviewed" | "unreviewed";

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function startOf(unit: "today" | "week" | "month"): Date {
  const now = new Date();
  if (unit === "today") {
    now.setHours(0, 0, 0, 0);
    return now;
  }
  if (unit === "week") {
    const day = now.getDay();
    now.setDate(now.getDate() - day);
    now.setHours(0, 0, 0, 0);
    return now;
  }
  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  return now;
}

function applyFilters(
  rows: FeedbackRow[],
  selectedHospitals: string[],
  selectedProducts: string[],
  quickDate: QuickDate,
  dateStart: string,
  dateEnd: string,
  reviewStatus: ReviewStatus
): FeedbackRow[] {
  return rows.filter((row) => {
    // 병원 필터
    if (selectedHospitals.length > 0 && !selectedHospitals.includes(row.hospital)) return false;

    // 프로덕트 필터
    if (selectedProducts.length > 0 && !selectedProducts.includes(row.product)) return false;

    // 날짜 필터
    const rowDate = parseDate(row.date);
    if (dateStart || dateEnd) {
      if (rowDate) {
        if (dateStart && rowDate < new Date(dateStart)) return false;
        if (dateEnd) {
          const end = new Date(dateEnd);
          end.setHours(23, 59, 59, 999);
          if (rowDate > end) return false;
        }
      }
    } else if (quickDate !== "all" && rowDate) {
      if (rowDate < startOf(quickDate)) return false;
    }

    // 검토 여부 필터
    if (reviewStatus === "reviewed" && !row.reviewed) return false;
    if (reviewStatus === "unreviewed" && row.reviewed) return false;

    return true;
  });
}

function computeStats(rows: FeedbackRow[]) {
  return {
    totalRows: rows.length,
    totalPositive: rows.filter((r) => r.hasPositive).length,
    totalNegative: rows.filter((r) => r.hasNegative).length,
    totalReviewed: rows.filter((r) => r.reviewed).length,
    totalUnreviewed: rows.filter((r) => !r.reviewed).length,
  };
}

export default function DashboardPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  // 필터 상태
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [quickDate, setQuickDate] = useState<QuickDate>("all");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>("all");

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (!stored) { router.replace("/"); return; }
    try { setResult(JSON.parse(stored)); }
    catch { router.replace("/"); }
    finally { setReady(true); }
  }, [router]);

  const filteredRows = useMemo(
    () => result
      ? applyFilters(result.rows, selectedHospitals, selectedProducts, quickDate, dateStart, dateEnd, reviewStatus)
      : [],
    [result, selectedHospitals, selectedProducts, quickDate, dateStart, dateEnd, reviewStatus]
  );

  const filteredStats = useMemo(() => computeStats(filteredRows), [filteredRows]);

  const filteredHospitalStats: HospitalStats[] = useMemo(
    () => buildHospitalStats(filteredRows),
    [filteredRows]
  );

  const filteredProductStats = useMemo(
    () => buildProductStats(filteredRows),
    [filteredRows]
  );

  const filteredPositiveKeywords = useMemo(
    () => extractKeywords(filteredRows.map((r) => r.positiveFeedback).filter(Boolean), 20),
    [filteredRows]
  );

  const filteredNegativeKeywords = useMemo(
    () => extractKeywords(filteredRows.map((r) => r.negativeFeedback).filter(Boolean), 20),
    [filteredRows]
  );

  if (!ready || !result) return <LoadingSpinner />;

  const statsForCards = {
    ...filteredStats,
    detectedColumns: result.detectedColumns,
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">피드백 분석 대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">
            전체 {result.totalRows}건
            {filteredRows.length !== result.totalRows && (
              <span className="ml-1 text-blue-600 font-medium">
                → 필터 적용 {filteredRows.length}건
              </span>
            )}
            {result.dateRange && (
              <span className="ml-2 text-gray-400">
                ({result.dateRange.min} ~ {result.dateRange.max})
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-blue-600 hover:underline self-start sm:self-auto"
        >
          다른 시트 분석
        </button>
      </div>

      {/* 필터 */}
      <DashboardFilters
        hospitals={result.hospitals}
        selectedHospitals={selectedHospitals}
        onHospitalsChange={setSelectedHospitals}
        products={result.products}
        selectedProducts={selectedProducts}
        onProductsChange={setSelectedProducts}
        quickDate={quickDate}
        onQuickDateChange={setQuickDate}
        dateStart={dateStart}
        dateEnd={dateEnd}
        onDateStartChange={setDateStart}
        onDateEndChange={setDateEnd}
        reviewStatus={reviewStatus}
        onReviewStatusChange={setReviewStatus}
        hasReviewedColumn={!!result.detectedColumns.reviewed}
      />

      {/* 통계 카드 */}
      <StatCards result={statsForCards} />

      {/* 차트 행 1: 병원별 + 긍부정 도넛 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HospitalChart hospitalStats={filteredHospitalStats} />
        <SentimentChart
          totalPositive={filteredStats.totalPositive}
          totalNegative={filteredStats.totalNegative}
        />
      </div>

      {/* 프로덕트별 차트 */}
      <ProductChart productStats={filteredProductStats} />

      {/* 차트 행 2: 키워드 (긍정/부정 각각) */}
      <KeywordChart
        positiveKeywords={filteredPositiveKeywords}
        negativeKeywords={filteredNegativeKeywords}
      />

      {/* 피드백 테이블 */}
      <FeedbackTable rows={filteredRows} detectedColumns={result.detectedColumns} />
    </div>
  );
}
