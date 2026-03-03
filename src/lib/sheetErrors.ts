export type SheetErrorCode =
  | "SHEET_URL_NOT_CONFIGURED"
  | "SHEET_FETCH_FAILED"
  | "PARSE_FAILED"
  | "UNKNOWN";

export const SHEET_ERROR_MESSAGES: Record<SheetErrorCode, { title: string; description: string }> = {
  SHEET_URL_NOT_CONFIGURED: {
    title: "Sheet 연결이 설정되지 않았습니다",
    description: "환경변수 NEXT_PUBLIC_SHEET_URL이 등록되지 않았습니다. 관리자에게 문의해주세요.",
  },
  SHEET_FETCH_FAILED: {
    title: "Sheet에 연결할 수 없습니다",
    description: "Google Sheet에 접근하지 못했습니다. Sheet가 '링크가 있는 모든 사용자' 공개 상태인지 확인해주세요.",
  },
  PARSE_FAILED: {
    title: "데이터를 읽을 수 없습니다",
    description: "Sheet 데이터 형식을 인식하지 못했습니다. 컬럼 구조를 확인해주세요.",
  },
  UNKNOWN: {
    title: "알 수 없는 오류가 발생했습니다",
    description: "잠시 후 다시 시도해주세요.",
  },
};
