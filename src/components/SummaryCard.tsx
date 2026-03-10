"use client";

import { useState } from "react";
import type { FeedbackRow, HospitalStats, ProductStats, KeywordEntry } from "@/types/analysis";

const STORAGE_KEY_POS = "feedbacklens_custom_keywords_positive";
const STORAGE_KEY_NEG = "feedbacklens_custom_keywords_negative";
const STORAGE_KEY_HIDDEN_POS = "feedbacklens_hidden_keywords_positive";
const STORAGE_KEY_HIDDEN_NEG = "feedbacklens_hidden_keywords_negative";

interface Props {
  rows: FeedbackRow[];
  hospitalStats: HospitalStats[];
  productStats: ProductStats[];
  positiveKeywords: KeywordEntry[];
  negativeKeywords: KeywordEntry[];
  totalReviewed: number;
  totalUnreviewed: number;
}

function loadFromStorage(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

function saveToStorage(key: string, value: string[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function countKeyword(keyword: string, rows: FeedbackRow[]): number {
  const lower = keyword.toLowerCase();
  return rows.filter((r) => {
    const text = `${r.positiveFeedback ?? ""} ${r.negativeFeedback ?? ""}`.toLowerCase();
    return text.includes(lower);
  }).length;
}

interface KeywordSectionProps {
  label: string;
  autoKeywords: KeywordEntry[];
  customStorageKey: string;
  hiddenStorageKey: string;
  rows: FeedbackRow[];
  color: "green" | "red";
}

function KeywordSection({
  label,
  autoKeywords,
  customStorageKey,
  hiddenStorageKey,
  rows,
  color,
}: KeywordSectionProps) {
  const [customKeywords, setCustomKeywords] = useState<string[]>(() => loadFromStorage(customStorageKey));
  const [hiddenKeywords, setHiddenKeywords] = useState<string[]>(() => loadFromStorage(hiddenStorageKey));
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const tagBase = color === "green"
    ? "bg-green-50 text-green-700 border border-green-200"
    : "bg-red-50 text-red-700 border border-red-200";
  const xColor = color === "green"
    ? "text-green-400 hover:text-green-700"
    : "text-red-400 hover:text-red-700";
  const topTagBase = color === "green" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

  const visibleAutoKeywords = autoKeywords.filter((kw) => !hiddenKeywords.includes(kw.word));
  const hasAnyKeyword = visibleAutoKeywords.length > 0 || customKeywords.length > 0;

  function hideAutoKeyword(word: string) {
    const next = [...hiddenKeywords, word];
    setHiddenKeywords(next);
    saveToStorage(hiddenStorageKey, next);
  }

  function addKeyword(value: string) {
    const trimmed = value.trim();
    setIsAdding(false);
    setInputValue("");
    if (!trimmed || customKeywords.includes(trimmed)) return;
    const next = [...customKeywords, trimmed];
    setCustomKeywords(next);
    saveToStorage(customStorageKey, next);
  }

  function removeCustomKeyword(kw: string) {
    const next = customKeywords.filter((k) => k !== kw);
    setCustomKeywords(next);
    saveToStorage(customStorageKey, next);
  }

  function resetAll() {
    setHiddenKeywords([]);
    setCustomKeywords([]);
    saveToStorage(hiddenStorageKey, []);
    saveToStorage(customStorageKey, []);
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        {(hiddenKeywords.length > 0 || customKeywords.length > 0) && (
          <button
            onClick={resetAll}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            초기화
          </button>
        )}
      </div>

      {!hasAnyKeyword && customKeywords.length === 0 ? (
        <p className="text-xs text-gray-400">데이터 없음</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 items-center">
          {/* 자동 추출 키워드 (삭제 가능) */}
          {visibleAutoKeywords.map((kw, i) => (
            <span
              key={`auto-${kw.word}`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                i === 0 ? topTagBase : "bg-gray-100 text-gray-600"
              }`}
            >
              {kw.word}
              <span className="opacity-60">({kw.count})</span>
              <button
                onClick={() => hideAutoKeyword(kw.word)}
                className={i === 0 ? `${xColor} leading-none` : "text-gray-400 hover:text-gray-600 leading-none"}
                aria-label={`${kw.word} 삭제`}
              >
                ×
              </button>
            </span>
          ))}

          {/* 사용자 정의 키워드 */}
          {customKeywords.map((kw) => (
            <span
              key={`custom-${kw}`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tagBase}`}
            >
              {kw}
              <span className="opacity-60">({countKeyword(kw, rows)})</span>
              <button
                onClick={() => removeCustomKeyword(kw)}
                className={`${xColor} leading-none`}
                aria-label={`${kw} 삭제`}
              >
                ×
              </button>
            </span>
          ))}

          {/* 추가 버튼 / 입력 필드 */}
          {isAdding ? (
            <input
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 w-24 focus:outline-none focus:ring-1 focus:ring-purple-400"
              placeholder="키워드 입력"
              onKeyDown={(e) => {
                if (e.key === "Enter") addKeyword(inputValue);
                if (e.key === "Escape") { setIsAdding(false); setInputValue(""); }
              }}
              onBlur={() => addKeyword(inputValue)}
            />
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="text-xs text-gray-400 border border-dashed border-gray-300 rounded-full px-2 py-0.5 hover:text-gray-600 hover:border-gray-400"
            >
              + 추가
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function UnreviewedModal({ rows, onClose }: { rows: FeedbackRow[]; onClose: () => void }) {
  const unreviewedRows = rows.filter((r) => !r.reviewed);
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">미검토 피드백 목록</h2>
            <p className="text-xs text-gray-400 mt-0.5">{unreviewedRows.length}건</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
          {unreviewedRows.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-400 text-center">모든 피드백이 검토 완료되었습니다.</p>
          ) : (
            unreviewedRows.map((row) => (
              <div key={row.id} className="px-6 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-700">{row.hospital || "병원 미상"}</span>
                  <span className="text-xs text-gray-400">{row.date || "날짜 미상"}</span>
                </div>
                {row.negativeFeedback && (
                  <p className="text-sm text-red-700">{row.negativeFeedback}</p>
                )}
                {row.positiveFeedback && (
                  <p className="text-sm text-gray-600 mt-1">{row.positiveFeedback}</p>
                )}
                {!row.negativeFeedback && !row.positiveFeedback && (
                  <p className="text-sm text-gray-400">내용 없음</p>
                )}
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="text-xs text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SummaryCard({
  rows,
  hospitalStats,
  productStats,
  positiveKeywords,
  negativeKeywords,
  totalUnreviewed,
}: Props) {
  const [showUnreviewedModal, setShowUnreviewedModal] = useState(false);

  const totalRows = rows.length;
  const totalPositive = rows.filter((r) => r.hasPositive).length;
  const totalNegative = rows.filter((r) => r.hasNegative).length;
  const today = new Date().toLocaleDateString("ko-KR");

  const topHospitals = hospitalStats.slice(0, 3);
  const topPositiveKeywords = positiveKeywords.slice(0, 5);
  const topNegativeKeywords = negativeKeywords.slice(0, 5);
  const maxProductTotal = productStats.length > 0 ? productStats[0].total : 1;

  return (
    <>
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
                  <button
                    onClick={() => setShowUnreviewedModal(true)}
                    className="text-orange-500 font-medium hover:text-orange-600 hover:underline cursor-pointer"
                  >
                    미검토 {totalUnreviewed}건 ⚠️
                  </button>
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

          {/* ③ 부정 키워드 (편집 가능) */}
          <KeywordSection
            label="부정 피드백 키워드"
            autoKeywords={topNegativeKeywords}
            customStorageKey={STORAGE_KEY_NEG}
            hiddenStorageKey={STORAGE_KEY_HIDDEN_NEG}
            rows={rows}
            color="red"
          />

          {/* ④ 긍정 키워드 (편집 가능) */}
          <KeywordSection
            label="긍정 피드백 키워드"
            autoKeywords={topPositiveKeywords}
            customStorageKey={STORAGE_KEY_POS}
            hiddenStorageKey={STORAGE_KEY_HIDDEN_POS}
            rows={rows}
            color="green"
          />

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

      {showUnreviewedModal && (
        <UnreviewedModal rows={rows} onClose={() => setShowUnreviewedModal(false)} />
      )}
    </>
  );
}
