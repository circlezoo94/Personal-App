import Sentiment from "sentiment";
import type { FeedbackRow, SentimentBreakdown } from "@/types/analysis";

const analyzer = new Sentiment();

const POSITIVE_THRESHOLD = 0.05;
const NEGATIVE_THRESHOLD = -0.05;

export function classifySentiment(comparative: number): FeedbackRow["sentiment"] {
  if (comparative >= POSITIVE_THRESHOLD) return "positive";
  if (comparative <= NEGATIVE_THRESHOLD) return "negative";
  return "neutral";
}

export function analyzeRows(
  rows: Record<string, string>[],
  textColumn: string
): FeedbackRow[] {
  return rows
    .filter((row) => row[textColumn]?.trim().length > 0)
    .map((row, index) => {
      const text = row[textColumn].trim();
      const result = analyzer.analyze(text);
      const sentiment = classifySentiment(result.comparative);
      return {
        id: index + 1,
        text,
        sentiment,
        score: result.score,
        comparative: result.comparative,
      };
    });
}

export function buildSentimentBreakdown(rows: FeedbackRow[]): SentimentBreakdown {
  const total = rows.length;
  const positive = rows.filter((r) => r.sentiment === "positive").length;
  const negative = rows.filter((r) => r.sentiment === "negative").length;
  const neutral = rows.filter((r) => r.sentiment === "neutral").length;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  return {
    positive,
    negative,
    neutral,
    positivePercent: pct(positive),
    negativePercent: pct(negative),
    neutralPercent: pct(neutral),
  };
}
