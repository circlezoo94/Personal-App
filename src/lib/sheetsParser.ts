import Papa from "papaparse";

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
  return { headers, rows: result.data };
}

export function detectTextColumn(
  headers: string[],
  rows: Record<string, string>[]
): string {
  const feedbackKeywords = [
    "feedback", "comment", "response", "review",
    "suggestion", "opinion", "text", "message", "note",
  ];

  for (const keyword of feedbackKeywords) {
    const match = headers.find((h) => h.toLowerCase().includes(keyword));
    if (match) return match;
  }

  let bestColumn = headers[0];
  let bestAvgLength = 0;

  for (const header of headers) {
    const totalLength = rows.reduce((sum, row) => sum + (row[header]?.length ?? 0), 0);
    const avg = rows.length > 0 ? totalLength / rows.length : 0;
    if (avg > bestAvgLength) {
      bestAvgLength = avg;
      bestColumn = header;
    }
  }

  return bestColumn;
}
