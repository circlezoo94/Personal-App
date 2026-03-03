"use client";

import { useState, useRef } from "react";
import type { ReactNode } from "react";
import type { FeedbackRow } from "@/types/analysis";

interface Props {
  rows: FeedbackRow[];
}

const MAX_KEYWORDS = 10;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countOccurrences(text: string, keyword: string): number {
  if (!text || !keyword) return 0;
  const regex = new RegExp(escapeRegex(keyword), "gi");
  return (text.match(regex) ?? []).length;
}

function extractMatchingSentences(text: string, keyword: string): string[] {
  if (!keyword || !text) return [];
  const sentences = text
    .split(/\n|(?<=\.|。)\s+|•/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return sentences.filter((s) => regex.test(s));
}

function highlightSingle(
  text: string,
  keyword: string,
  type: "positive" | "negative"
): ReactNode {
  const regex = new RegExp(`(${escapeRegex(keyword)})`, "gi");
  const parts = text.split(regex);
  const markClass =
    type === "positive"
      ? "bg-green-100 text-green-800 rounded px-0.5 font-medium"
      : "bg-red-100 text-red-800 rounded px-0.5 font-medium";
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className={markClass}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function KeywordSearch({ rows }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [modalKeyword, setModalKeyword] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [expandedModalRows, setExpandedModalRows] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  function addKeyword() {
    const kw = inputValue.trim();
    if (!kw || keywords.includes(kw) || keywords.length >= MAX_KEYWORDS) return;
    setKeywords((prev) => [...prev, kw]);
    setInputValue("");
    inputRef.current?.focus();
  }

  function closeModal() {
    setModalKeyword(null);
    setExpandedModalRows(new Set());
  }

  function toggleModalRow(id: number) {
    setExpandedModalRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
    if (modalKeyword === kw) closeModal();
  }

  function getStats(keyword: string) {
    let posCount = 0;
    let negCount = 0;
    let matchedRows = 0;
    for (const row of rows) {
      const inPos = countOccurrences(row.positiveFeedback, keyword);
      const inNeg = countOccurrences(row.negativeFeedback, keyword);
      posCount += inPos;
      negCount += inNeg;
      if (inPos > 0 || inNeg > 0) matchedRows++;
    }
    const rowPercent = rows.length > 0 ? (matchedRows / rows.length) * 100 : 0;
    return { posCount, negCount, rowPercent };
  }

  const modalRows = modalKeyword
    ? rows.filter(
        (r) =>
          countOccurrences(r.positiveFeedback, modalKeyword) > 0 ||
          countOccurrences(r.negativeFeedback, modalKeyword) > 0
      )
    : [];

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">키워드 검색</h2>

        {/* 태그 입력 영역 */}
        <div className="flex flex-wrap gap-2 items-center p-3 border border-gray-200 rounded-lg min-h-[48px] bg-gray-50">
          {keywords.map((kw) => (
            <span
              key={kw}
              onClick={() => setModalKeyword(kw)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full cursor-pointer hover:bg-blue-200 transition-colors"
            >
              {kw}
              <button
                onClick={(e) => { e.stopPropagation(); removeKeyword(kw); }}
                className="text-blue-500 hover:text-blue-700 leading-none"
              >
                ×
              </button>
            </span>
          ))}

          {keywords.length < MAX_KEYWORDS && (
            <div className="flex items-center gap-1 flex-1 min-w-[160px]">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                onKeyDown={(e) => {
                  if (isComposing || e.nativeEvent.isComposing || e.keyCode === 229) return;
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                placeholder={
                  keywords.length === 0
                    ? "키워드 입력 후 Enter 또는 + 버튼"
                    : "키워드 추가..."
                }
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={addKeyword}
                disabled={!inputValue.trim()}
                className="px-2 py-0.5 text-xs font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          )}

          {keywords.length >= MAX_KEYWORDS && (
            <span className="text-xs text-gray-400">최대 {MAX_KEYWORDS}개</span>
          )}
        </div>

        {/* 결과 테이블 */}
        {keywords.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">키워드</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">긍정 등장</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">부정 등장</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">등장 비율</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-medium">관련 피드백</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => {
                  const { posCount, negCount, rowPercent } = getStats(kw);
                  return (
                    <tr key={kw} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 px-3">
                        <span
                          onClick={() => setModalKeyword(kw)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          {kw}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeKeyword(kw); }}
                            className="text-blue-400 hover:text-blue-600 leading-none"
                          >
                            ×
                          </button>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={posCount > 0 ? "text-green-600 font-semibold" : "text-gray-300"}>
                          {posCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={negCount > 0 ? "text-red-600 font-semibold" : "text-gray-300"}>
                          {negCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={posCount + negCount > 0 ? "text-gray-700" : "text-gray-300"}>
                          {rowPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setModalKeyword(kw)}
                          disabled={posCount + negCount === 0}
                          className="text-xs text-blue-600 hover:underline disabled:text-gray-300 disabled:no-underline disabled:cursor-default"
                        >
                          보기
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 모달 */}
      {modalKeyword && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => closeModal()}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  키워드 관련 피드백
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {modalKeyword}
                  </span>
                  <span className="ml-2">{modalRows.length}건</span>
                </p>
              </div>
              <button
                onClick={() => closeModal()}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-2 text-gray-500 font-medium w-8">#</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium w-28">병원명</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium w-24">날짜</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">긍정 피드백</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">부정 피드백</th>
                  </tr>
                </thead>
                <tbody>
                  {modalRows.map((row) => {
                    const isRowExpanded = expandedModalRows.has(row.id);
                    return (
                      <tr key={row.id} className="border-b border-gray-50 align-top hover:bg-gray-50">
                        <td className="py-2 px-2 text-gray-400">{row.id}</td>
                        <td className="py-2 px-2 text-gray-700 font-medium whitespace-nowrap">
                          {row.hospital || "—"}
                        </td>
                        <td className="py-2 px-2 text-gray-500 whitespace-nowrap">
                          {row.date || "—"}
                        </td>
                        <td className="py-2 px-2 text-green-800 max-w-xs">
                          {(() => {
                            const sentences = extractMatchingSentences(row.positiveFeedback, modalKeyword);
                            if (sentences.length === 0) return <span className="text-gray-300">—</span>;
                            return (
                              <div>
                                {isRowExpanded
                                  ? <p>{highlightSingle(row.positiveFeedback, modalKeyword, "positive")}</p>
                                  : sentences.map((s, i) => (
                                      <p key={i} className="mb-1">{highlightSingle(s, modalKeyword, "positive")}</p>
                                    ))
                                }
                                <button
                                  onClick={() => toggleModalRow(row.id)}
                                  className="text-gray-400 text-xs mt-1 hover:text-gray-600"
                                >
                                  {isRowExpanded ? "접기 ▲" : "전체 보기 ▼"}
                                </button>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-2 px-2 text-red-800 max-w-xs">
                          {(() => {
                            const sentences = extractMatchingSentences(row.negativeFeedback, modalKeyword);
                            if (sentences.length === 0) return <span className="text-gray-300">—</span>;
                            return (
                              <div>
                                {isRowExpanded
                                  ? <p>{highlightSingle(row.negativeFeedback, modalKeyword, "negative")}</p>
                                  : sentences.map((s, i) => (
                                      <p key={i} className="mb-1">{highlightSingle(s, modalKeyword, "negative")}</p>
                                    ))
                                }
                                <button
                                  onClick={() => toggleModalRow(row.id)}
                                  className="text-gray-400 text-xs mt-1 hover:text-gray-600"
                                >
                                  {isRowExpanded ? "접기 ▲" : "전체 보기 ▼"}
                                </button>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
