export interface FeedbackRow {
  id: number;
  hospital: string;       // 정규화된 병원명
  hospitalRaw: string;    // 원본 병원명
  date: string;
  positiveFeedback: string;
  negativeFeedback: string;
  product: string;        // 프로덕트 리뷰
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

export interface ProductStats {
  product: string;
  total: number;
  positiveCount: number;
  negativeCount: number;
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
  product?: string;
}

export interface AnalysisResult {
  totalRows: number;
  totalPositive: number;
  totalNegative: number;
  totalReviewed: number;
  totalUnreviewed: number;
  hospitals: string[];
  hospitalStats: HospitalStats[];
  products: string[];
  productStats: ProductStats[];
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
