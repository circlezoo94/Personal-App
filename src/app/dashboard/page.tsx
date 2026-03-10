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
import MonthlyTrendChart from "@/components/MonthlyTrendChart";
import ProductChart from "@/components/ProductChart";
import DashboardFilters from "@/components/DashboardFilters";
import LoadingSpinner from "@/components/LoadingSpinner";
import SheetErrorBanner from "@/components/SheetErrorBanner";
import { buildHospitalStats, buildProductStats, extractKeywords } from "@/lib/hospitalAnalyzer";
import SummaryCard from "@/components/SummaryCard";
import InsightCard from "@/components/InsightCard";
import { analyzeFromCsv } from "@/lib/analyzeFromCsv";
import type { SheetErrorCode } from "@/lib/sheetErrors";
import { loadHospitalMapping, applyHospitalMapping } from "@/lib/hospitalMapping";

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

  // 병원명 매핑
  const [hospitalMapping, setHospitalMapping] = useState<Record<string, string>>(() => loadHospitalMapping());

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

  const mappedRows = useMemo(
    () => result
      ? result.rows.map((row) => ({
          ...row,
          hospital: applyHospitalMapping(row.hospital, hospitalMapping),
        }))
      : [],
    [result, hospitalMapping]
  );

  const mappedHospitals = useMemo(
    () => Array.from(new Set(mappedRows.map((r) => r.hospital))).sort(),
    [mappedRows]
  );

  const filteredRows = useMemo(
    () => result
      ? applyFilters(mappedRows, selectedHospitals, selectedProducts, quickDate, dateStart, dateEnd, reviewStatus)
      : [],
    [mappedRows, selectedHospitals, selectedProducts, quickDate, dateStart, dateEnd, reviewStatus]
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
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">FL</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">FeedbackLens</p>
              <p className="text-xs text-gray-400 leading-tight">powered by sentiment analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshLoading}
                className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshLoading ? "불러오는 중..." : "새로고침"}
              </button>
              {lastRefreshed && (
                <span className="text-xs text-gray-400 hidden sm:inline">
                  {lastRefreshed.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {session?.user?.email && (
                <span className="text-xs text-gray-500 hidden sm:inline">{session.user.email}</span>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">피드백 분석 대시보드</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            전체 {result.totalRows}건
            {filteredRows.length !== result.totalRows && (
              <span className="ml-1 text-purple-600 font-medium">
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

        {refreshError && (
          <SheetErrorBanner
            errorCode={refreshError}
            onRetry={handleRefresh}
          />
        )}

        <DashboardFilters
          hospitals={mappedHospitals}
          rawHospitals={result.hospitals}
          onMappingChange={setHospitalMapping}
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

        <StatCards result={statsForCards} />

        <SummaryCard
          rows={filteredRows}
          hospitalStats={filteredHospitalStats}
          productStats={filteredProductStats}
          positiveKeywords={filteredPositiveKeywords}
          negativeKeywords={filteredNegativeKeywords}
          totalReviewed={filteredStats.totalReviewed}
          totalUnreviewed={filteredStats.totalUnreviewed}
        />

        <InsightCard result={result} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HospitalChart hospitalStats={filteredHospitalStats} rows={filteredRows} />
          <div className="flex flex-col gap-6">
            <SentimentChart
              totalPositive={filteredStats.totalPositive}
              totalNegative={filteredStats.totalNegative}
            />
            <MonthlyTrendChart rows={filteredRows} />
          </div>
        </div>

        <ProductChart productStats={filteredProductStats} />

        <KeywordSearch rows={result.rows} />

        <FeedbackTable rows={filteredRows} detectedColumns={result.detectedColumns} />
      </div>
    </div>
  );
}
