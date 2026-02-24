"use client";

import { useState } from "react";
import type { FeedbackRow } from "@/types/analysis";

interface Props {
  rows: FeedbackRow[];
  columnUsed: string;
}

const SENTIMENT_STYLES: Record<FeedbackRow["sentiment"], string> = {
  positive: "bg-green-100 text-green-800",
  neutral: "bg-yellow-100 text-yellow-800",
  negative: "bg-red-100 text-red-800",
};

const PAGE_SIZE = 10;

export default function FeedbackTable({ rows, columnUsed }: Props) {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<FeedbackRow["sentiment"] | "all">("all");

  const filtered = filter === "all" ? rows : rows.filter((r) => r.sentiment === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(0);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Feedback Responses
          <span className="ml-2 text-sm font-normal text-gray-500">
            (column: &quot;{columnUsed}&quot;)
          </span>
        </h2>
        <div className="flex gap-2">
          {(["all", "positive", "neutral", "negative"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-colors
                ${filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-gray-500 font-medium w-12">#</th>
              <th className="text-left py-2 px-3 text-gray-500 font-medium">Feedback</th>
              <th className="text-left py-2 px-3 text-gray-500 font-medium w-28">Sentiment</th>
              <th className="text-left py-2 px-3 text-gray-500 font-medium w-20">Score</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-3 text-gray-400">{row.id}</td>
                <td className="py-3 px-3 text-gray-700 max-w-md">
                  <p className="line-clamp-2">{row.text}</p>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${SENTIMENT_STYLES[row.sentiment]}`}
                  >
                    {row.sentiment}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-500 font-mono text-xs">
                  {row.comparative.toFixed(2)}
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  No rows match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {filtered.length} results · Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
