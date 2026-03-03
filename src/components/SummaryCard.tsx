"use client";

import type { FeedbackRow, HospitalStats, ProductStats, KeywordEntry } from "@/types/analysis";

interface Props {
  rows: FeedbackRow[];
  hospitalStats: HospitalStats[];
  productStats: ProductStats[];
  positiveKeywords: KeywordEntry[];
  negativeKeywords: KeywordEntry[];
  totalReviewed: number;
  totalUnreviewed: number;
}

export default function SummaryCard({
  rows,
  hospitalStats,
  productStats,
  positiveKeywords,
  negativeKeywords,
  totalUnreviewed,
}: Props) {
  const totalRows = rows.length;
  const totalPositive = rows.filter((r) => r.hasPositive).length;
  const totalNegative = rows.filter((r) => r.hasNegative).length;
  const today = new Date().toLocaleDateString("ko-KR");

  const topHospitals = hospitalStats.slice(0, 3);
  const topPositiveKeywords = positiveKeywords.slice(0, 5);
  const topNegativeKeywords = negativeKeywords.slice(0, 5);
  const maxProductTotal = productStats.length > 0 ? productStats[0].total : 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">피드백 요약</h2>
        <span className="text-xs text-gray-400">{today}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* ① 전체 현황 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">전체 현황</h3>
          <p className="text-2xl font-bold text-gray-900 mb-2">{totalRows}건</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>
              긍정{" "}
              <span className="text-green-600 font-medium">{totalPositive}건</span>
              {totalRows > 0 && (
                <span className="text-gray-400 ml-1">
                  ({((totalPositive / totalRows) * 100).toFixed(0)}%)
                </span>
              )}
            </p>
            <p>
              부정{" "}
              <span className="text-red-600 font-medium">{totalNegative}건</span>
              {totalRows > 0 && (
                <span className="text-gray-400 ml-1">
                  ({((totalNegative / totalRows) * 100).toFixed(0)}%)
                </span>
              )}
            </p>
            <p className="mt-2">
              {totalUnreviewed === 0 ? (
                <span className="text-green-600 font-medium">모두 검토 완료 ✓</span>
              ) : (
                <span className="text-orange-500 font-medium">미검토 {totalUnreviewed}건 ⚠️</span>
              )}
            </p>
          </div>
        </div>

        {/* ② 병원 Top 3 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">병원 Top 3</h3>
          {topHospitals.length === 0 ? (
            <p className="text-xs text-gray-400">데이터 없음</p>
          ) : (
            <div className="space-y-2">
              {topHospitals.map((h, i) => {
                const negRatio = h.total > 0 ? (h.negativeCount / h.total) * 100 : 0;
                return (
                  <div key={h.hospital} className="flex items-center gap-1 text-xs">
                    <span className="text-gray-400 shrink-0">{i + 1}.</span>
                    <span className="flex-1 font-medium text-gray-700 truncate">{h.hospital}</span>
                    <span className="text-gray-500 shrink-0">{h.total}건</span>
                    <span
                      className={`shrink-0 font-medium ${
                        negRatio >= 70 ? "text-red-500" : "text-gray-400"
                      }`}
                    >
                      부정 {negRatio.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ③ 부정 키워드 Top 5 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">부정 피드백 키워드</h3>
          {topNegativeKeywords.length === 0 ? (
            <p className="text-xs text-gray-400">데이터 없음</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {topNegativeKeywords.map((kw, i) => (
                <span
                  key={kw.word}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    i === 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {kw.word}
                  <span className="ml-1 opacity-60">({kw.count})</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ④ 긍정 키워드 Top 5 */}
        {topPositiveKeywords.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">긍정 피드백 키워드</h3>
            <div className="flex flex-wrap gap-1.5">
              {topPositiveKeywords.map((kw, i) => (
                <span
                  key={kw.word}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    i === 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {kw.word}
                  <span className="ml-1 opacity-60">({kw.count})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ⑤ 제품별 분포 */}
        {productStats.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">제품별 피드백 분포</h3>
            <div className="space-y-2.5">
              {productStats.map((p) => {
                const negRatio = p.total > 0 ? (p.negativeCount / p.total) * 100 : 0;
                const widthPct = (p.total / maxProductTotal) * 100;
                return (
                  <div key={p.product}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 truncate flex-1">{p.product}</span>
                      <span className="ml-2 text-gray-500 shrink-0">{p.total}건</span>
                      <span
                        className={`ml-2 shrink-0 ${negRatio >= 70 ? "text-red-500" : "text-gray-400"}`}
                      >
                        부정 {negRatio.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
