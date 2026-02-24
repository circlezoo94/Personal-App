# FeedbackLens

Google Sheets 공개 URL을 입력받아 병원 고객 피드백을 분석·시각화하는 Next.js 대시보드.

---

## 주요 명령어

```bash
npm run dev        # .next 캐시 삭제 후 dev 서버 시작 (rm -rf .next && next dev)
npm run typecheck  # 타입 검사만 (dev 서버에 영향 없음, 개발 중 사용)
npm run build      # 프로덕션 빌드 (배포 직전에만 사용 — dev 서버와 충돌)
npm run lint       # ESLint 검사
```

> **⚠️ 중요**: dev 서버가 켜진 상태에서 `npm run build` 실행 금지. 타입 검사는 `npm run typecheck` 사용.

---

## 아키텍처

```
Google Sheets URL
  → /api/analyze (POST)
    → sheetsParser: CSV export URL 변환 + PapaParse
    → hospitalAnalyzer: 행 파싱 + 병원명 정규화 + 통계 집계
    → keywordAnalyzer: 긍정/부정 피드백 키워드 추출
  → sessionStorage("analysisResult")
    → /dashboard (클라이언트 필터링 + 차트)
```

### 디렉터리 구조

```
src/
  app/
    page.tsx              # URL 입력 폼
    dashboard/page.tsx    # 대시보드 (클라이언트 필터링 전담)
    api/analyze/route.ts  # 유일한 API 엔드포인트
  components/             # UI 컴포넌트 (모두 "use client")
  lib/
    sheetsParser.ts       # CSV fetch + 컬럼 자동 감지
    hospitalAnalyzer.ts   # 행 파싱 + 통계 빌드
    hospitalNormalizer.ts # 병원명 정규화 규칙
    keywordAnalyzer.ts    # 키워드 빈도 분석
  types/
    analysis.ts           # 모든 타입 정의 (단일 소스)
```

---

## Google Sheets 컬럼 매핑

`sheetsParser.ts`의 `detectColumns()`가 헤더를 자동 감지한다. 정확한 컬럼명 우선, 키워드 폴백 순.

| 필드 | 정확한 컬럼명 | 폴백 키워드 |
|------|-------------|------------|
| hospital | `병원명` | hospital, 병원, clinic |
| date | `접수 날짜` | 날짜, date, 접수 |
| positive | `긍정 피드백` | 긍정, positive |
| negative | `부정(개선) 피드백` | 부정, negative, 개선 |
| reviewed | `검토 여부` | 검토, reviewed |
| product | `프로덕트 리뷰` | 리뷰, review |

> **주의**: `reviewed` 컬럼은 Google Sheets 체크박스 → CSV 시 `"TRUE"` / `"FALSE"` 문자열로 내보내짐.
> **무시하는 컬럼**: `프로덕트 전달`, `코멘트 및 액션 아이템` — 파싱하지 않음. product 키워드 폴백에서 `프로덕트` 제거한 이유는 `프로덕트 전달` 컬럼을 잘못 감지하는 것을 방지하기 위함.

---

## 코드 스타일

### TypeScript
- 모든 타입은 `src/types/analysis.ts`에만 정의. 컴포넌트/lib에 인라인 타입 선언 금지.
- `any` 사용 금지. 불확실한 외부 데이터는 `unknown`으로 받고 좁혀 쓴다.
- `!` non-null assertion은 Map의 `has()` 이후처럼 100% 안전한 경우에만 허용.

### React / Next.js
- 모든 컴포넌트는 `"use client"` 선언 (현재 서버 컴포넌트 없음).
- 대시보드 필터링은 `useMemo`로 클라이언트에서 처리. API 재호출 금지.
- 분석 결과는 `sessionStorage("analysisResult")`로만 공유. URL params·전역 상태 사용 금지.

### 컴포넌트
- Props 타입은 파일 상단에 `interface Props {}` 로 선언.
- 조건부 렌더링: 데이터 없으면 `return null` (빈 컨테이너 렌더링 금지).

### Tailwind
- 인라인 `style={{}}` 대신 Tailwind 클래스 우선 사용.
- 색상 의미: 긍정 `green`, 부정 `red`, 검토완료 `purple`, 미검토 `orange`, 프로덕트 `teal`.

---

## 병원명 정규화 규칙

`src/lib/hospitalNormalizer.ts`에서 관리. 새 병원 패턴 발견 시 이 파일만 수정.

처리 순서 (순서 변경 금지):
1. 의료진 정보 제거 (`씨엘병원 최범채원장님` → `씨엘병원`)
2. 오타 교정 (`서을` → `서울`)
3. 발음 변형 통일 (`시엘` → `씨엘`)
4. 병원 접미사 보정 (`서울미즈` → `서울미즈병원`)

> **주의**: `FeedbackRow.hospital`은 정규화된 이름, `hospitalRaw`는 원본. UI에서 그룹핑·필터링은 반드시 `hospital`(정규화) 기준으로.

---

## ⚠️ 주의사항

### 캐시 관련
- **절대 `next dev`를 직접 실행하지 말 것.** 반드시 `npm run dev` 사용 (캐시 자동 삭제 포함).
- **`.next` 디렉터리를 수동 삭제하지 말 것.** dev 서버가 켜진 상태에서 삭제하면 404 또는 "missing required error components" 발생.
- `npm run build` 후 dev 서버가 켜져 있으면 반드시 `npm run dev`로 재시작.

### API 설계
- `/api/analyze`는 POST 전용. 결과를 캐싱하거나 GET으로 변환하지 말 것 (시트 데이터는 항상 최신).
- 시트가 비공개이면 403 반환. 클라이언트에서 별도 처리 필요.

### 데이터 흐름
- `sessionStorage`에 저장된 결과는 탭 종료 시 소멸. 새로고침 후 `/`로 리다이렉트되는 것은 의도된 동작.
- 필터는 전부 클라이언트 메모리 연산. 행이 수천 건을 넘으면 가상화(virtualization) 고려 필요.

---

## 트러블슈팅

발생한 문제의 증상·원인·해결법은 아래 파일에서 관리한다.
새 문제가 발생하면 즉시 기록하고, **같은 문제가 2회 이상 반복되면 위 ⚠️ 주의사항으로 격상**한다.

@docs/TROUBLESHOOTING.md

---

## 새 기능 추가 가이드

### 새 컬럼 추가
1. [sheetsParser.ts:35](src/lib/sheetsParser.ts#L35) → `detectColumns()`에 감지 규칙 추가
2. [analysis.ts:1](src/types/analysis.ts#L1) → `DetectedColumns`, `FeedbackRow`에 필드 추가
3. [hospitalAnalyzer.ts:6](src/lib/hospitalAnalyzer.ts#L6) → `parseRows()`에서 파싱, 필요 시 집계 함수 추가
4. 컴포넌트/필터 연결

### 핵심 함수 위치
| 함수 | 파일:라인 | 역할 |
|------|---------|------|
| `detectColumns()` | [sheetsParser.ts:35](src/lib/sheetsParser.ts#L35) | 컬럼 자동 감지 |
| `fetchAndParseSheet()` | [sheetsParser.ts:46](src/lib/sheetsParser.ts#L46) | CSV fetch + 파싱 |
| `parseRows()` | [hospitalAnalyzer.ts:6](src/lib/hospitalAnalyzer.ts#L6) | 행 파싱 + 정규화 |
| `buildHospitalStats()` | [hospitalAnalyzer.ts:31](src/lib/hospitalAnalyzer.ts#L31) | 병원별 통계 |
| `buildProductStats()` | [hospitalAnalyzer.ts:49](src/lib/hospitalAnalyzer.ts#L49) | 프로덕트별 통계 |
| `normalizeHospitalName()` | [hospitalNormalizer.ts:33](src/lib/hospitalNormalizer.ts#L33) | 병원명 정규화 |
| `extractKeywords()` | [keywordAnalyzer.ts:22](src/lib/keywordAnalyzer.ts#L22) | 키워드 빈도 분석 |

### 새 병원 정규화 패턴 추가
[hospitalNormalizer.ts:12](src/lib/hospitalNormalizer.ts#L12) — `TYPO_FIXES`, `PHONETIC_MAP`, `STAFF_PATTERNS` 배열에만 항목 추가.
