/**
 * 병원명 정규화 모듈
 *
 * 처리 순서:
 * 1. 의료진 이름/직함 제거 ("씨엘병원 최범채원장님" → "씨엘병원")
 * 2. 오타 교정 ("서을" → "서울")
 * 3. 발음 변형 통일 ("시엘" → "씨엘")
 * 4. 병원 접미사 없으면 추가 ("서울미즈" → "서울미즈병원")
 */

// 오타 교정 목록
const TYPO_FIXES: [RegExp, string][] = [
  [/서을/g, "서울"],
  [/서울 미즈/g, "서울미즈"],
];

// 발음 변형 → 대표형 통일 (씨엘로 통일)
const PHONETIC_MAP: [RegExp, string][] = [
  [/시엘(?=병원|$|\s)/g, "씨엘"],
];

// 병원 접미사 목록
const HOSPITAL_SUFFIXES = ["병원", "의원", "클리닉", "센터", "메디컬", "의료원"];

// 의료진 정보 제거 패턴 (공백 + 한글 이름 + 직함)
const STAFF_PATTERNS = [
  /\s+[가-힣]{2,4}\s*원장님\s*$/,
  /\s+[가-힣]{2,4}\s*원장\s*$/,
  /\s+[가-힣]{2,4}\s*의사\s*$/,
  /\s+[가-힣]{2,4}\s*선생님\s*$/,
];

export function normalizeHospitalName(raw: string): string {
  if (!raw.trim()) return "";

  let name = raw.trim();

  // 1. 의료진 정보 제거
  for (const pattern of STAFF_PATTERNS) {
    const stripped = name.replace(pattern, "").trim();
    if (stripped.length > 0) {
      name = stripped;
      break;
    }
  }

  // 2. 오타 교정
  for (const [pattern, replacement] of TYPO_FIXES) {
    name = name.replace(pattern, replacement);
  }

  // 3. 발음 변형 통일
  for (const [pattern, canonical] of PHONETIC_MAP) {
    name = name.replace(pattern, canonical);
  }

  // 4. 병원 접미사 없으면 추가
  const hasSuffix = HOSPITAL_SUFFIXES.some((s) => name.endsWith(s));
  if (!hasSuffix && name.length > 0) {
    name = name + "병원";
  }

  return name;
}
