# 트러블슈팅 로그

> 발생한 문제는 여기에 기록한다. 같은 문제가 반복될 경우 ⚠️ 주의사항 섹션으로 격상.
> 새 문제 발생 시 아래 양식으로 추가: 증상 → 원인 → 해결 → 예방.

---

## [반복 → 예방 완료] .next 캐시 stale 오류 (`Cannot find module './276.js'`)

**증상**: `Cannot find module './276.js'` (또는 다른 숫자.js) 서버 에러, 페이지 렌더링 불가
**발생 횟수**: 3회 이상 반복 → CLAUDE.md ⚠️ 주의사항으로 격상됨
**원인**: `npm run build` 실행 시 `.next`가 프로덕션 빌드로 교체 → dev 서버가 존재하지 않는 chunk 참조
**해결**:
```bash
pkill -f "next dev"          # dev 서버 종료
npm run dev                  # 재시작 (캐시 자동 삭제 포함)
```
**예방 조치 완료**:
1. `package.json` `dev` 스크립트: `rm -rf .next && next dev` — 시작 시 항상 캐시 정리
2. `typecheck` 스크립트 추가: `tsc --noEmit` — `.next` 건드리지 않고 타입만 검사
3. **타입 검사는 `npm run typecheck`, 빌드는 배포 직전에만 `npm run build` 사용**

---

## [반복] "missing required error components, refreshing..."

**증상**: 브라우저에 해당 메시지만 표시되고 페이지가 로드되지 않음
**원인 A**: dev 서버 최초 시작 직후 아직 컴파일 중인 과도기 상태 → 자동 해소됨
**원인 B**: `.next`를 수동 삭제하는 동안 dev 서버가 살아 있어 불완전 재컴파일 발생
**해결**: `npm run dev` 로 서버 재시작 후 브라우저 강제 새로고침 (`Cmd+Shift+R`)
**예방**: `.next`를 절대 수동으로 삭제하지 말 것. `npm run dev`가 자동 처리함

---

## npm 명령어 not found (PATH 문제)

**증상**: `npm: command not found` — 터미널 세션마다 발생 가능
**원인**: nvm으로 Node를 설치했을 때 새 셸 세션에서 nvm이 자동 로드되지 않는 경우
**해결**: `source "$HOME/.nvm/nvm.sh"` 실행 후 npm 재시도
**예방**: `~/.zshrc`에 nvm 초기화 구문이 있는지 확인

## Google Sheets 403 오류

**증상**: 시트 URL 입력 후 "Sheet is not public" 에러
**원인**: 시트 공유 설정이 "링크가 있는 모든 사용자 → 뷰어"로 되어 있지 않음
**해결**: 사용자에게 시트 공유 설정 변경 안내 (코드 문제 아님)
**상태**: API가 403 감지 시 명확한 에러 메시지 반환하도록 구현 완료

---

*마지막 업데이트: 2026-02-24*
