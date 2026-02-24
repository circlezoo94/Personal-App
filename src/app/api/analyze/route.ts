import { NextRequest, NextResponse } from "next/server";
import { fetchAndParseSheet } from "@/lib/sheetsParser";
import { parseRows, buildResult } from "@/lib/hospitalAnalyzer";
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

    const { rows, detectedColumns } = await fetchAndParseSheet(body.url);

    if (rows.length === 0) {
      return NextResponse.json<AnalyzeError>(
        { error: "The sheet appears to be empty." },
        { status: 422 }
      );
    }

    const feedbackRows = parseRows(rows, detectedColumns);

    const positiveTexts = feedbackRows
      .map((r) => r.positiveFeedback)
      .filter((t) => t.length > 0);
    const negativeTexts = feedbackRows
      .map((r) => r.negativeFeedback)
      .filter((t) => t.length > 0);

    const positiveKeywords = extractKeywords(positiveTexts, 20);
    const negativeKeywords = extractKeywords(negativeTexts, 20);

    const result: AnalysisResult = buildResult(
      feedbackRows,
      positiveKeywords,
      negativeKeywords,
      detectedColumns
    );

    return NextResponse.json<AnalysisResult>(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json<AnalyzeError>({ error: message }, { status: 500 });
  }
}
