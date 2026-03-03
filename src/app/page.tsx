"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import SheetErrorBanner from "@/components/SheetErrorBanner";
import type { SheetErrorCode } from "@/lib/sheetErrors";
import { analyzeFromCsv } from "@/lib/analyzeFromCsv";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<SheetErrorCode | null>(null);

  const fetchAndAnalyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sheet");
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        setError((json.error as SheetErrorCode) ?? "UNKNOWN");
        return;
      }
      const csvText = await res.text();
      let result;
      try {
        result = analyzeFromCsv(csvText);
      } catch {
        setError("PARSE_FAILED");
        return;
      }
      if (result.totalRows === 0) {
        setError("PARSE_FAILED");
        return;
      }
      sessionStorage.setItem("analysisResult", JSON.stringify(result));
      router.push("/dashboard");
    } catch {
      setError("UNKNOWN");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAndAnalyze();
  }, [fetchAndAnalyze]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md">
          <SheetErrorBanner errorCode={error} onRetry={fetchAndAnalyze} />
        </div>
      </div>
    );
  }

  return null;
}
