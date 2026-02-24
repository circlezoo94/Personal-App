"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/types/analysis";
import StatCards from "@/components/StatCards";
import SentimentChart from "@/components/SentimentChart";
import KeywordChart from "@/components/KeywordChart";
import FeedbackTable from "@/components/FeedbackTable";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (!stored) {
      router.replace("/");
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch {
      router.replace("/");
    } finally {
      setReady(true);
    }
  }, [router]);

  if (!ready || !result) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
          <p className="text-sm text-gray-500 mt-1">
            {result.analyzedRows} of {result.totalRows} rows analyzed from
            column &quot;{result.columnUsed}&quot;
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-blue-600 hover:underline self-start sm:self-auto"
        >
          Analyze another sheet
        </button>
      </div>

      <StatCards result={result} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentChart sentiment={result.sentiment} />
        <KeywordChart keywords={result.keywords} />
      </div>

      <FeedbackTable rows={result.rows} columnUsed={result.columnUsed} />
    </div>
  );
}
