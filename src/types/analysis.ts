export interface FeedbackRow {
  id: number;
  hospital: string;
  date: string;
  positiveFeedback: string;
  negativeFeedback: string;
  comment: string;
  reviewed: boolean;
  hasPositive: boolean;
  hasNegative: boolean;
}

export interface HospitalStats {
  hospital: string;
  total: number;
  positiveCount: number;
  negativeCount: number;
  reviewedCount: number;
}

export interface KeywordEntry {
  word: string;
  count: number;
}

export interface DetectedColumns {
  hospital?: string;
  date?: string;
  positive?: string;
  negative?: string;
  reviewed?: string;
}

export interface AnalysisResult {
  totalRows: number;
  totalPositive: number;
  totalNegative: number;
  totalReviewed: number;
  totalUnreviewed: number;
  hospitals: string[];
  hospitalStats: HospitalStats[];
  positiveKeywords: KeywordEntry[];
  negativeKeywords: KeywordEntry[];
  rows: FeedbackRow[];
  dateRange: { min: string; max: string } | null;
  detectedColumns: DetectedColumns;
}

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeError {
  error: string;
  details?: string;
}
