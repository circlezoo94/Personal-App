"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
}

interface Insights {
  summary: string;
}

function renderBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-gray-900">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default function InsightCard({ result }: Props) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "인사이트 생성에 실패했습니다.");
        return;
      }
      setInsights(data);
    } catch {
      setError("인사이트 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <span className="text-base">✨</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">AI 인사이트</h2>
            <p className="text-xs text-gray-400">감정 분석 기반 자동 생성 인사이트</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-purple-600 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <span>✨</span>
          {loading ? "분석 중..." : insights ? "다시 생성" : "AI 인사이트 생성"}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {insights && (
        <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
          <p className="text-sm text-gray-700 leading-relaxed">{renderBold(insights.summary)}</p>
        </div>
      )}
    </div>
  );
}
