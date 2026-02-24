export interface FeedbackRow {
  id: number;
  text: string;
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  comparative: number;
}

export interface SentimentBreakdown {
  positive: number;
  negative: number;
  neutral: number;
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number;
}

export interface KeywordEntry {
  word: string;
  count: number;
}

export interface AnalysisResult {
  totalRows: number;
  analyzedRows: number;
  sentiment: SentimentBreakdown;
  keywords: KeywordEntry[];
  rows: FeedbackRow[];
  columnUsed: string;
}

export interface AnalyzeRequest {
  url: string;
  textColumn?: string;
}

export interface AnalyzeError {
  error: string;
  details?: string;
}
