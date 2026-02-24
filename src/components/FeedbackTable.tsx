"use client";

import { useState } from "react";
import type { FeedbackRow, DetectedColumns } from "@/types/analysis";

interface Props {
  rows: FeedbackRow[];
  detectedColumns: DetectedColumns;
}

const PAGE_SIZE = 10;

export default function FeedbackTable({ rows, detectedColumns }: Props) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const paginated = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const showHospital = !!detectedColumns.hospital;
  const showDate = !!detectedColumns.date;
  const showReviewed = !!detectedColumns.reviewed;

  const colSpan = 1 + (showHospital ? 1 : 0) + (showDate ? 1 : 0) + 2 + (showReviewed ? 1 : 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          피드백 목록
          <span className="ml-2 text-sm font-normal text-gray-400">{rows.length}건</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-2 px-3 text-gray-500 font-medium w-10">#</th>
              {showHospital && (
                <th className="text-left py-2 px-3 text-gray-500 font-medium w-28">병원명</th>
              )}
              {showDate && (
                <th className="text-left py-2 px-3 text-gray-500 font-medium w-24">접수 날짜</th>
              )}
              <th className="text-left py-2 px-3 text-gray-500 font-medium">긍정 피드백</th>
              <th className="text-left py-2 px-3 text-gray-500 font-medium">부정 피드백</th>
              {showReviewed && (
                <th className="text-left py-2 px-3 text-gray-500 font-medium w-20">검토</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 align-top">
                <td className="py-3 px-3 text-gray-400 text-xs">{row.id}</td>
                {showHospital && (
                  <td className="py-3 px-3 text-gray-700 text-xs font-medium whitespace-nowrap">
                    {row.hospital || "—"}
                  </td>
                )}
                {showDate && (
                  <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">
                    {row.date || "—"}
                  </td>
                )}
                <td className="py-3 px-3 text-gray-700 max-w-xs">
                  {row.positiveFeedback ? (
                    <p className="line-clamp-3 text-green-800 text-xs">{row.positiveFeedback}</p>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="py-3 px-3 text-gray-700 max-w-xs">
                  {row.negativeFeedback ? (
                    <p className="line-clamp-3 text-red-800 text-xs">{row.negativeFeedback}</p>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                {showReviewed && (
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.reviewed
                          ? "bg-purple-100 text-purple-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {row.reviewed ? "완료" : "미검토"}
                    </span>
                  </td>
                )}
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-gray-400">
                  조건에 맞는 피드백이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            총 {rows.length}건 · {page + 1} / {totalPages} 페이지
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              이전
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
