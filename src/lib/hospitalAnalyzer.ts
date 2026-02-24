import type { FeedbackRow, HospitalStats, ProductStats, AnalysisResult, DetectedColumns } from "@/types/analysis";
import type { KeywordEntry } from "@/types/analysis";
import { extractKeywords } from "@/lib/keywordAnalyzer";
import { normalizeHospitalName } from "@/lib/hospitalNormalizer";

export function parseRows(
  rows: Record<string, string>[],
  cols: DetectedColumns
): FeedbackRow[] {
  return rows.map((row, index) => {
    const positiveFeedback = cols.positive ? (row[cols.positive] ?? "") : "";
    const negativeFeedback = cols.negative ? (row[cols.negative] ?? "") : "";
    const reviewedRaw = cols.reviewed ? (row[cols.reviewed] ?? "") : "";
    const hospitalRaw = cols.hospital ? (row[cols.hospital] ?? "") : "";

    return {
      id: index + 1,
      hospital: normalizeHospitalName(hospitalRaw),
      hospitalRaw,
      date: cols.date ? (row[cols.date] ?? "") : "",
      positiveFeedback,
      negativeFeedback,
      product: cols.product ? (row[cols.product] ?? "") : "",
      reviewed: reviewedRaw.toUpperCase() === "TRUE",
      hasPositive: positiveFeedback.trim().length > 0,
      hasNegative: negativeFeedback.trim().length > 0,
    };
  });
}

export function buildHospitalStats(rows: FeedbackRow[]): HospitalStats[] {
  const map = new Map<string, HospitalStats>();

  for (const row of rows) {
    const key = row.hospital || "(미지정)";
    if (!map.has(key)) {
      map.set(key, { hospital: key, total: 0, positiveCount: 0, negativeCount: 0, reviewedCount: 0 });
    }
    const stat = map.get(key)!;
    stat.total++;
    if (row.hasPositive) stat.positiveCount++;
    if (row.hasNegative) stat.negativeCount++;
    if (row.reviewed) stat.reviewedCount++;
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export function buildProductStats(rows: FeedbackRow[]): ProductStats[] {
  const map = new Map<string, ProductStats>();

  for (const row of rows) {
    if (!row.product.trim()) continue;
    const key = row.product.trim();
    if (!map.has(key)) {
      map.set(key, { product: key, total: 0, positiveCount: 0, negativeCount: 0 });
    }
    const stat = map.get(key)!;
    stat.total++;
    if (row.hasPositive) stat.positiveCount++;
    if (row.hasNegative) stat.negativeCount++;
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export function computeDateRange(rows: FeedbackRow[]): AnalysisResult["dateRange"] {
  const dates = rows
    .map((r) => r.date)
    .filter((d) => d.length > 0)
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => d.getTime());

  if (dates.length === 0) return null;
  const min = new Date(Math.min(...dates)).toISOString().split("T")[0];
  const max = new Date(Math.max(...dates)).toISOString().split("T")[0];
  return { min, max };
}

export function buildResult(
  rows: FeedbackRow[],
  positiveKeywords: KeywordEntry[],
  negativeKeywords: KeywordEntry[],
  detectedColumns: DetectedColumns
): AnalysisResult {
  const hospitalStats = buildHospitalStats(rows);
  const productStats = buildProductStats(rows);

  return {
    totalRows: rows.length,
    totalPositive: rows.filter((r) => r.hasPositive).length,
    totalNegative: rows.filter((r) => r.hasNegative).length,
    totalReviewed: rows.filter((r) => r.reviewed).length,
    totalUnreviewed: rows.filter((r) => !r.reviewed).length,
    hospitals: hospitalStats.map((s) => s.hospital),
    hospitalStats,
    products: productStats.map((s) => s.product),
    productStats,
    positiveKeywords,
    negativeKeywords,
    rows,
    dateRange: computeDateRange(rows),
    detectedColumns,
  };
}

export { extractKeywords };
