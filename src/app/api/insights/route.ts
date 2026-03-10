import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult } from "@/types/analysis";

let insightCache: { data: object; cachedAt: number } | null = null;
const INSIGHT_CACHE_TTL = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  if (insightCache && Date.now() - insightCache.cachedAt < INSIGHT_CACHE_TTL) {
    return NextResponse.json(insightCache.data);
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
    }

    const result: AnalysisResult = await req.json();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

    const negativeFeedbacks = result.rows
      .filter((r) => r.negativeFeedback)
      .map((r) => `[${r.hospital}] ${r.negativeFeedback}`)
      .join("\n");

    const hospitalSummary = result.hospitalStats
      .map((h) => `${h.hospital}: 전체 ${h.total}건, 부정 ${h.negativeCount}건`)
      .join("\n");

    const prompt = `
당신은 의료 기관 피드백 분석 전문가입니다.
아래 피드백 데이터를 분석해서 한국어로 핵심 인사이트를 제공해주세요.

[전체 현황]
- 전체 피드백: ${result.totalRows}건
- 긍정: ${result.totalPositive}건, 부정: ${result.totalNegative}건

[병원별 현황]
${hospitalSummary}

[부정 피드백 목록]
${negativeFeedbacks}

전체 데이터를 종합하여 2~3문장으로 핵심 인사이트를 작성해줘.
주요 수치와 키워드는 **볼드**로 표시해줘. (예: **부정 피드백이 90%**, **대기 시간** 문제)

JSON 형식으로만 응답해줘 (마크다운 코드블록 없이):
{
  "summary": "2~3문장 핵심 인사이트 내용"
}
`;

    const response = await model.generateContent(prompt);
    const text = response.response.text().replace(/```json|```/g, "").trim();
    const insights = JSON.parse(text);

    insightCache = { data: insights, cachedAt: Date.now() };
    return NextResponse.json(insights);
  } catch (e) {
    console.error("Insights API error:", e);
    return NextResponse.json({ error: "인사이트 생성에 실패했습니다.", details: String(e) }, { status: 500 });
  }
}
