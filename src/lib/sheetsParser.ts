import Papa from "papaparse";
import type { DetectedColumns } from "@/types/analysis";

export function buildCsvUrl(inputUrl: string): string {
  const sheetIdMatch = inputUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!sheetIdMatch) {
    throw new Error("Invalid Google Sheets URL. Could not extract sheet ID.");
  }
  const sheetId = sheetIdMatch[1];
  const gidMatch = inputUrl.match(/[?&#]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

export interface ParsedSheet {
  headers: string[];
  rows: Record<string, string>[];
  detectedColumns: DetectedColumns;
}

function findColumn(headers: string[], exact: string[], keywords: string[]): string | undefined {
  // 1) 정확한 컬럼명 매칭 (우선)
  for (const name of exact) {
    const match = headers.find((h) => h === name);
    if (match) return match;
  }
  // 2) 키워드 포함 매칭 (폴백)
  for (const keyword of keywords) {
    const match = headers.find((h) => h.toLowerCase().includes(keyword.toLowerCase()));
    if (match) return match;
  }
  return undefined;
}

export function detectColumns(headers: string[]): DetectedColumns {
  return {
    hospital: findColumn(headers, ["병원명"], ["hospital", "병원", "clinic", "기관", "지점"]),
    date: findColumn(headers, ["접수 날짜"], ["날짜", "date", "일자", "접수", "작성일", "time"]),
    positive: findColumn(headers, ["긍정 피드백"], ["긍정", "positive", "칭찬"]),
    negative: findColumn(headers, ["부정(개선) 피드백"], ["부정", "negative", "개선", "불만"]),
    reviewed: findColumn(headers, ["검토 여부"], ["검토", "reviewed", "확인", "check"]),
    product: findColumn(headers, ["프로덕트 리뷰"], ["리뷰", "review"]),
  };
}

export async function fetchAndParseSheet(inputUrl: string): Promise<ParsedSheet> {
  const csvUrl = buildCsvUrl(inputUrl);

  const response = await fetch(csvUrl, {
    cache: "no-store",
    headers: { "User-Agent": "FeedbackAnalysisDashboard/1.0" },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        "Sheet is not public. Please share the sheet with 'Anyone with the link' set to Viewer."
      );
    }
    throw new Error(`Failed to fetch sheet: HTTP ${response.status}`);
  }

  const csvText = await response.text();

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`);
  }

  const headers = result.meta.fields ?? [];
  const detectedColumns = detectColumns(headers);
  return { headers, rows: result.data, detectedColumns };
}
