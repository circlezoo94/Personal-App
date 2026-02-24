import { NextRequest, NextResponse } from "next/server";
import { fetchAndParseSheet, detectTextColumn } from "@/lib/sheetsParser";
import { analyzeRows, buildSentimentBreakdown } from "@/lib/sentimentAnalyzer";
import { extractKeywords } from "@/lib/keywordAnalyzer";
import type { AnalyzeRequest, AnalysisResult, AnalyzeError } from "@/types/analysis";

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();

    if (!body.url) {
      return NextResponse.json<AnalyzeError>(
        { error: "Missing required field: url" },
        { status: 400 }
      );
    }

    const { headers, rows } = await fetchAndParseSheet(body.url);

    if (rows.length === 0) {
      return NextResponse.json<AnalyzeError>(
        { error: "The sheet appears to be empty." },
        { status: 422 }
      );
    }

    const textColumn = body.textColumn ?? detectTextColumn(headers, rows);
    const analyzedRows = analyzeRows(rows, textColumn);

    if (analyzedRows.length === 0) {
      return NextResponse.json<AnalyzeError>(
        { error: `Column "${textColumn}" contains no readable text.` },
        { status: 422 }
      );
    }

    const sentiment = buildSentimentBreakdown(analyzedRows);
    const texts = analyzedRows.map((r) => r.text);
    const keywords = extractKeywords(texts, 20);

    const result: AnalysisResult = {
      totalRows: rows.length,
      analyzedRows: analyzedRows.length,
      sentiment,
      keywords,
      rows: analyzedRows,
      columnUsed: textColumn,
    };

    return NextResponse.json<AnalysisResult>(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json<AnalyzeError>({ error: message }, { status: 500 });
  }
}
