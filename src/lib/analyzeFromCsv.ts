import Papa from "papaparse";
import { detectColumns } from "@/lib/sheetsParser";
import { parseRows, buildResult } from "@/lib/hospitalAnalyzer";
import { extractKeywords } from "@/lib/keywordAnalyzer";
import type { AnalysisResult } from "@/types/analysis";

export function analyzeFromCsv(csvText: string): AnalysisResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    throw new Error(`CSV parse error: ${parsed.errors[0]?.message}`);
  }

  const headers = parsed.meta.fields ?? [];
  const detectedColumns = detectColumns(headers);
  const feedbackRows = parseRows(parsed.data, detectedColumns);

  const positiveTexts = feedbackRows.map((r) => r.positiveFeedback).filter((t) => t.length > 0);
  const negativeTexts = feedbackRows.map((r) => r.negativeFeedback).filter((t) => t.length > 0);

  const positiveKeywords = extractKeywords(positiveTexts, 20);
  const negativeKeywords = extractKeywords(negativeTexts, 20);

  return buildResult(feedbackRows, positiveKeywords, negativeKeywords, detectedColumns);
}
