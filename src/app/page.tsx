"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SheetErrorBanner from "@/components/SheetErrorBanner";
import type { SheetErrorCode } from "@/lib/sheetErrors";
import { analyzeFromCsv } from "@/lib/analyzeFromCsv";

const STEPS = [
  { min: 0, max: 30, label: "서버 연결 중..." },
  { min: 30, max: 60, label: "Sheet 데이터 불러오는 중..." },
  { min: 60, max: 90, label: "데이터 분석 중..." },
  { min: 90, max: 100, label: "대시보드 준비 중..." },
];

function getStepLabel(progress: number) {
  return STEPS.find((s) => progress < s.max)?.label ?? "대시보드 준비 중...";
}

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<SheetErrorCode | null>(null);
  const [progress, setProgress] = useState(0);

  const fetchAndAnalyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) { clearInterval(interval); return prev; }
        return prev + 10;
      });
    }, 500);

    try {
      const res = await fetch("/api/sheet");
      if (!res.ok) {
        clearInterval(interval);
        const json = await res.json() as { error?: string };
        setError((json.error as SheetErrorCode) ?? "UNKNOWN");
        return;
      }
      const csvText = await res.text();
      let result;
      try {
        result = analyzeFromCsv(csvText);
      } catch {
        clearInterval(interval);
        setError("PARSE_FAILED");
        return;
      }
      if (result.totalRows === 0) {
        clearInterval(interval);
        setError("PARSE_FAILED");
        return;
      }
      clearInterval(interval);
      setProgress(100);
      sessionStorage.setItem("analysisResult", JSON.stringify(result));
      setTimeout(() => router.push("/dashboard"), 300);
    } catch {
      clearInterval(interval);
      setError("UNKNOWN");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAndAnalyze();
  }, [fetchAndAnalyze]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-80">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">FL</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">FeedbackLens</h1>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-3 text-center">{getStepLabel(progress)}</p>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">{progress}%</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md px-4">
          <SheetErrorBanner errorCode={error} onRetry={fetchAndAnalyze} />
        </div>
      </div>
    );
  }

  return null;
}
