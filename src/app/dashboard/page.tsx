"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import type { AnalysisResult, FeedbackRow, HospitalStats } from "@/types/analysis";
import StatCards from "@/components/StatCards";
import SentimentChart from "@/components/SentimentChart";
import FeedbackTable from "@/components/FeedbackTable";
import KeywordSearch from "@/components/KeywordSearch";
import HospitalChart from "@/components/HospitalChart";
import ProductChart from "@/components/ProductChart";
import DashboardFilters from "@/components/DashboardFilters";
import LoadingSpinner from "@/components/LoadingSpinner";
import SheetErrorBanner from "@/components/SheetErrorBanner";
import { buildHospitalStats, buildProductStats, extractKeywords } from "@/lib/hospitalAnalyzer";
import SummaryCard from "@/components/SummaryCard";
import { analyzeFromCsv } from "@/lib/analyzeFromCsv";
import type { SheetErrorCode } from "@/lib/sheetErrors";

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
  const { data: session } = useSession();

  // 새로고침 상태
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [refreshError, setRefreshError] = useState<SheetErrorCode | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [cacheStatus, setCacheStatus] = useState<"HIT" | "MISS" | null>(null);

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

  const handleRefresh = useCallback(async () => {
    setRefreshLoading(true);
    setRefreshError(null);
    try {
      const res = await fetch("/api/sheet");
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        setRefreshError((json.error as SheetErrorCode) ?? "UNKNOWN");
        return;
      }
      const xCache = res.headers.get("X-Cache");
      const csvText = await res.text();
      try {
        const newResult = analyzeFromCsv(csvText);
        sessionStorage.setItem("analysisResult", JSON.stringify(newResult));
        setResult(newResult);
        setLastRefreshed(new Date());
        setCacheStatus(xCache === "HIT" ? "HIT" : "MISS");
      } catch {
        setRefreshError("PARSE_FAILED");
      }
    } catch {
      setRefreshError("UNKNOWN");
    } finally {
      setRefreshLoading(false);
    }
  }, []);

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
    () => extractKeywords(filteredRows.map((r) => r.positiveFeedback), 5),
    [filteredRows]
  );

  const filteredNegativeKeywords = useMemo(
    () => extractKeywords(filteredRows.map((r) => r.negativeFeedback), 5),
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
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshLoading}
              className="text-sm text-blue-600 border border-blue-200 rounded px-3 py-1 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshLoading ? "불러오는 중..." : "새로고침"}
            </button>
            {lastRefreshed && (
              <span className="text-xs text-gray-400">
                {lastRefreshed.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
            {cacheStatus === "HIT" && (
              <span className="text-xs text-gray-400">캐시됨</span>
            )}
            {cacheStatus === "MISS" && (
              <span className="text-xs text-blue-400">새로 불러옴</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {session?.user?.email && (
              <span className="text-xs text-gray-400">{session.user.email}</span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-red-400 hover:underline"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 새로고침 에러 */}
      {refreshError && (
        <SheetErrorBanner
          errorCode={refreshError}
          onRetry={handleRefresh}
        />
      )}

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

      {/* 피드백 요약 */}
      <SummaryCard
        rows={filteredRows}
        hospitalStats={filteredHospitalStats}
        productStats={filteredProductStats}
        positiveKeywords={filteredPositiveKeywords}
        negativeKeywords={filteredNegativeKeywords}
        totalReviewed={filteredStats.totalReviewed}
        totalUnreviewed={filteredStats.totalUnreviewed}
      />

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

      {/* 키워드 검색 */}
      <KeywordSearch rows={result.rows} />

      {/* 피드백 테이블 */}
      <FeedbackTable rows={filteredRows} detectedColumns={result.detectedColumns} />
    </div>
  );
}
