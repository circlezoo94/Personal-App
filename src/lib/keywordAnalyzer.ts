import type { KeywordEntry } from "@/types/analysis";

// ── 동의어 정규화 맵 (소문자/원형 → 대표형) ──────────────────────────────
const SYNONYM_MAP = new Map<string, string>([
  ["레포트", "리포트"],
  ["ranking", "랭킹"],
  ["score",   "스코어"],
]);

// ── 핵심 도메인 화이트리스트 (불용어/조사 제거 면제) ─────────────────────
const WHITELIST = new Set([
  "AI", "리포트", "레포트", "배아", "랭킹", "스코어", "등급", "이식",
  "필터", "로그인", "계정", "권한", "업로드", "다운로드", "FileWatcher",
  "outcome", "ET", "cycle",
]);

// ── 불용어 ────────────────────────────────────────────────────────────────
const STOPWORDS = new Set([
  // 영어 불용어
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
  "for", "of", "with", "is", "it", "this", "that", "was", "are",
  "be", "as", "by", "from", "we", "i", "my", "our", "your", "their",
  "they", "he", "she", "his", "her", "have", "had", "has", "not",
  "no", "can", "will", "do", "did", "would", "could", "should",
  "very", "just", "so", "than", "then", "when", "what", "which",
  "who", "how", "its", "also", "been", "more", "were", "me", "you",
  "up", "out", "about", "get", "got", "use", "used", "all", "one",

  // 조사 / 어미
  "이", "그", "저", "것", "수", "등", "및", "의", "를", "에",
  "은", "는", "가", "을", "도", "로", "으로", "만", "에서", "에게",
  "까지", "부터", "보다", "라고", "이라고", "라는", "이라는",
  "하여", "해서", "하고", "하며", "하면", "하는", "한", "할",
  "했", "하였", "됩니다", "있습니다", "합니다", "입니다", "습니다",
  "있어", "없어", "되어", "돼서", "된", "될", "되는", "되고",

  // 지시어 / 대명사
  "이것", "그것", "저것", "여기", "거기", "저기",
  "이런", "그런", "저런", "이렇게", "그렇게", "어떻게",
  "무엇", "누구", "언제", "왜", "어디",

  // 일반 동사 / 형용사
  "같은", "같이", "많은", "많이", "좋은", "좋아", "나쁜",
  "크게", "작게", "빠르게", "느리게", "쉽게", "어렵게", "다시",
  "또한", "그리고", "하지만", "그러나", "따라서", "그래서",
  "때문에", "위해", "통해", "대한", "관련", "경우", "때",
  "중", "후", "전", "내", "외", "간", "약",

  // VoC 문서 상용구
  "요청", "필요", "현재", "기존", "추가", "개선", "문의", "확인",
  "사용", "제공", "설정", "화면", "버튼", "클릭", "입력", "표시",
  "처리", "진행", "완료", "적용", "변경", "수정", "삭제", "생성",
  "저장", "조회", "선택", "이동", "실행",

  // 상태 / 현상
  "있음", "없음", "발생", "문제", "오류", "에러", "이슈",

  // 의료 일반 (분석 목적에 불필요한 범용어)
  "배양", "설명", "분석", "환자", "병원", "의사",

  // 기능/방식 범용어
  "기능", "방식",

  // 연결 어미
  "따라", "인해", "대해", "따른", "위한", "통한",
]);

// ── 한국어 조사/어미 접미사 (긴 것 우선 — greedy 매칭) ────────────────────
const JOSA_SUFFIXES = [
  // 3자
  "에게서", "로부터", "이라는", "이라고", "에서는", "에게는", "에서도",
  // 2자
  "라는", "라고", "에게", "에서", "에는", "에도", "에만",
  "으로", "로는", "로도", "로만",
  "이라", "이며", "이고", "이나", "이가", "이를", "이는", "이도", "이만",
  // 1자
  "가", "는", "은", "를", "을", "이", "의", "도", "만", "로", "과", "와",
  "나", "며", "고", "서", "게", "죠", "요", "네", "야", "아",
];

// 한국어 순수 토큰에서 조사/어미 접미사를 제거
function stripJosa(word: string): string {
  if (WHITELIST.has(word)) return word;  // 도메인 키워드 보호
  for (const josa of JOSA_SUFFIXES) {
    if (word.endsWith(josa) && word.length > josa.length) {
      return word.slice(0, word.length - josa.length);
    }
  }
  return word;
}

function isStopword(word: string): boolean {
  if (WHITELIST.has(word)) return false;  // 화이트리스트 최우선
  return STOPWORDS.has(word) || STOPWORDS.has(word.toLowerCase());
}

// ── 토크나이저 ────────────────────────────────────────────────────────────
function tokenize(text: string): string[] {
  const rawTokens = text
    .replace(/[^a-zA-Z0-9가-힣\s]/g, " ")  // 대소문자 보존
    .split(/\s+/);

  const result: string[] = [];
  for (const raw of rawTokens) {
    if (!raw) continue;
    if (/^\d+$/.test(raw)) continue;  // 숫자만인 토큰 제거

    const hasKorean = /[가-힣]/.test(raw);
    const hasEnglish = /[a-zA-Z]/.test(raw);

    if (!hasKorean && !hasEnglish) continue;

    if (hasKorean && !hasEnglish) {
      // 순수 한국어: 조사 제거 후 필터
      const word = stripJosa(raw);
      if (word.length <= 1) continue;   // 어근 1자 이하 버림
      if (isStopword(word)) continue;
      result.push(word);
    } else if (hasKorean && hasEnglish) {
      // 혼합 토큰(AI점수, ET결과 등): 조사 제거 없이 그대로 유지
      if (isStopword(raw)) continue;
      result.push(raw);
    } else {
      // 순수 영어: 3자 이상
      if (raw.length < 3) continue;
      if (isStopword(raw)) continue;
      result.push(raw);
    }
  }
  return result;
}

// ── 토큰 정규화 (동의어 병합 + 영문 대문자화) ─────────────────────────────
function normalizeToken(token: string): string {
  // 동의어 맵: 원형 우선, 소문자 폴백
  if (SYNONYM_MAP.has(token)) return SYNONYM_MAP.get(token)!;
  const lower = token.toLowerCase();
  if (SYNONYM_MAP.has(lower)) return SYNONYM_MAP.get(lower)!;

  // 순수 영문 토큰: 대문자로 통일 (AI/ai → AI, Score/score → SCORE)
  if (/^[a-zA-Z]+$/.test(token)) return token.toUpperCase();

  return token;
}

// ── 키워드 추출 ───────────────────────────────────────────────────────────
export function extractKeywords(texts: string[], topN = 20): KeywordEntry[] {
  const frequency = new Map<string, number>();
  for (const text of texts) {
    for (const raw of tokenize(text)) {
      const token = normalizeToken(raw);
      frequency.set(token, (frequency.get(token) ?? 0) + 1);
    }
  }
  return Array.from(frequency.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}
