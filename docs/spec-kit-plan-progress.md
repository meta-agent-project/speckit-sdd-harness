# SDD ledger — plan: harness/docs/2026-10-06-spec-kit-harness-plan.md
Ruling: 원장은 project/.superpowers 대신 harness/docs에 둠 — Task 2가 project의 무시된 파일까지 지우기 때문 — 틀려도 비용 없음
Ruling: worktree 없이 main에서 진행 — 사용자가 전체 삭제를 명시 승인했고 작업 자체가 저장소 초기화 — git 이력으로 복구 가능
Ruling: TDD 대신 각 단계의 확인 명령을 게이트로 씀 — 문서·설정 작업이라 테스트 대상 코드 없음
Pre-flight: Task 6→7(llm-wiki 이름), Task 3→7(명령 표기) 연결 확인, 충돌 없음
Task 1: complete (no commit, harness 밖 복사, diff OK)
Task 2: Ruling: 계획에 없던 `git add -A`를 넣어 .gitignore 삭제 후 무시 파일 4835개가 커밋됨 → 원격 없는 로컬 커밋이라 reset 후 `git rm --cached`로 순수 삭제 커밋 재작성 — 비용: 없음(미푸시)
Task 2: complete (commit 221330d, ls -A=.git, ls-files=0)
Task 3: Ruling: init 옵션이 바뀜(--ai→--integration, --non-interactive 추가) — 실제 CLI 도움말에 맞춤 — 비용 없음
Task 3: complete (install notes 작성, skills 방식 /speckit-*)
Task 4: complete (commit 32c68ba, 31 files tracked)
Task 5: complete (constitution 6 lines)
Task 6: Ruling: mklink /J가 Git Bash에서 인자 변환으로 실패 → PowerShell New-Item -ItemType Junction(절대 경로) 사용 — 비용 없음
Task 6: complete (wiki 5 files, header 5/5, junction ignored)
Task 7: Ruling: 명령 표기를 실제 설치값 /speckit-* 로 작성 — Task 3 메모 기준 — 비용 없음
Task 7: complete (living-spec junction, ignored)
Task 8: complete (CLAUDE.md f83f5e9, memory 3 files updated)
Task 9: complete (ROADMAP v1, constitution 1.1.0 기술 제약 추가 — 사용자 요청, wiki overview 재생성; CLAUDE.md 사용자 수정은 미커밋으로 둠)
Final: reviewer (opus) — C1 폴더 이름 드리프트, C2 feature.json 대상 폴더, I1 ROADMAP 미전달, I2 tasks 재생성 시 체크 손실, I3 plan 재검토 → living-spec에 반영(대상 폴더 고정·SPECIFY_FEATURE_DIRECTORY·ROADMAP 행 전달·커밋 후 재생성·converge·plan 전 절 재검토)
Final: Ruling: I4 ROADMAP 범위 열 누락 → 사용자가 범위 열 없는 표를 확정했으므로 living-spec 템플릿에서 범위 열 제거 — 비용: 영역 경계는 spec에서 정함
Final: minors 반영 — 002가 LLM 미들웨어 소유, wiki architecture에 constitution 기술 제약, 새 PC junction 안내, /speckit-constitution 금지, .gitignore node_modules·target, 진행 중 상태 단계, 마무리 커밋 하나로
Final: minor (deferred): 설계 문서의 "constitution 6줄"·"기술은 plan에서" 문구가 v1.1.0과 다름
