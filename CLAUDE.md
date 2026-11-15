# 하네스 유지보수

이 저장소는 연결된 프로젝트가 함께 사용하는 하네스 원본이다. 스킬별 확정 지침과 견본은 각 스킬 안에 보관하고, 앱에도 내장한 지침을 바꿀 때는 양쪽을 함께 맞춘다. 공통 개발 규칙은 `rules.md`에 있다.

## 고치기 전에

- 먼저 git pull로 GitHub 원격(origin/master)을 받고 그 위에서 고친다.
- 로컬에만 있는 커밋이 있으면 원격과 비교해 보이고, 합칠지 사용자에게 묻는다.

## Spec Kit 올리기

speckit-* 스킬 7개와 speckit/ 은 github/spec-kit 의 specify init 생성 결과 그대로다. 손으로 고치지 않는다. 하네스만의 방식은 flow · living-spec 등 하네스 스킬과 rules.md 에 둔다.

- 세션 시작 훅이 하루 한 번 새 버전을 알린다. 직접 보려면 node bin/harness.js speckit-check
- 연결된 프로젝트에 진행 중인 영역이 없을 때만 올린다
- node bin/harness.js speckit-update [vX.Y.Z] 로 올린다. uv 가 있어야 한다
- 이미 하네스에 있는 스킬 · 템플릿 · 스크립트만 바꾸고, 그것들이 새로 부르는 스크립트는 따라 넣는다
- 올린 뒤 git diff 로 바뀐 절을 본다
- 하네스 스킬이 가리키는 곳이 그대로인지 본다. flow 5단계의 speckit-implement 1~9 단계, SPECIFY_FEATURE_DIRECTORY, 템플릿 절 이름이다
- 달라졌으면 하네스 스킬 쪽을 고친다
- 연결된 프로젝트에서 .specify/scripts/bash/check-prerequisites.sh --json --paths-only 가 도는지 보고 커밋한다

## 변경 이력

| 날짜 | 변경 내용 | 대상 | 사유 |
|---|---|---|---|
| 2026-11-15 | 구현은 implementer 서브에이전트(복잡 Opus · 단순 Sonnet)가 하고 메인은 지휘 · 검증만 한다. 동시 실행은 의존 · CPU 80 · heavy 잠금 · worktree로 정한다. 요구사항 변경은 living-spec, bugfix는 실제 버그만으로 입구를 나눴다. Spec Kit을 원본 생성 결과로 따라가는 speckit-check · speckit-update를 넣고 v1.4.0으로 올렸다. 고치기 전 원격을 먼저 받는다 | `agents/implementer.md`, `bin/harness.js`, `rules.md`, `skills/flow`, `skills/flow-all`, `skills/bugfix`, `skills/living-spec`, `skills/speckit-*`, `speckit/`, `README.md`, `CLAUDE.md` | 구현을 메인이 할 때와 서브에이전트가 할 때가 섞이고, 병렬 실행이 PC를 다 쓰고, spec 변경 때 쓸 스킬이 분명하지 않고, Spec Kit 업데이트를 따라가고 싶다는 사용자 요청 |
| 2026-11-16 | 기다리는 명령은 일 하나에 하나만, 다시 걸 때 옛 것을 끄고 다 쓴 서버도 끈다 | `rules.md` | 에이전트들이 끝났나 확인하는 반복을 겹겹이 남겨 실행 중 작업이 38개로 보이고 하루 넘은 서버가 남은 일 |
| 2026-11-15 | 큰 묶음이 끝나면 에이전트가 tasks.md 에 넘김 메모를 쓰고 새 에이전트가 잇는다 | `rules.md` | 한 서브에이전트를 오래 이어 써서 대화가 30만 넘게 쌓이자 실수와 사용량이 늘어 새 에이전트로 바꿔 달라는 사용자 요청 |
| 2026-11-14 | flow-all 스킬 추가. 여러 영역을 동시에 돌리고 spec · 화면 시안만 승인받으며 승인된 영역은 plan부터 합치기까지 묻지 않는다 | `skills/flow-all`, `rules.md`, `README.md` | spec은 대화로 승인하되 그 뒤 plan · tasks · 구현은 승인 없이 한 번에 끝까지 해 달라는 사용자 요청 |
| 2026-11-14 | wiki는 사용자가 llm-wiki를 직접 부를 때만 만든다. flow 마무리 · living-spec start · update · bugfix에서 저절로 부르던 것을 빼고 항상 먼저 읽기에서 wiki/overview.md를 뺐다 | `skills/llm-wiki`, `skills/flow`, `skills/living-spec`, `skills/bugfix`, `rules.md`, `README.md` | 개발이 끝날 때마다 wiki가 돌아서, 명시적으로 부를 때만 돌게 해 달라는 사용자 요청 |
| 2026-10-27 | 구조·포함 관계 그림만 색 테두리·이름표, 장면·비유·과정 그림은 둘째 견본처럼 흑백. 도구 화면도 생성형으로 그리고 표시를 남김 | `skills/figure-style`, 강의프로그램 앱의 `skill.figure-style` | 색이 필요 없는 그림에도 테두리 색이 들어가서, 견본 두 장(색 있음·없음)의 쓰임대로 나눠 달라는 사용자 요청 |
| 2026-10-26 | 전역 스타일의 적용 범위·선택자 충돌 추적과 실행 환경별 배치 검증 추가. 코드 블록의 줄 번호·본문 정렬을 측정 예시로 명시 | `skills/design-consistency`, `skills/tdd` | 책과 슬라이드의 같은 클래스 이름으로 세로 배치가 섞인 문제를 분석해, 독립 문서 검사와 앱 내 화면 검증의 차이를 반영함 |
| 2026-10-25 | 실제 PNG 2장을 첨부하는 생성형 그림 화풍과 명세 등록. 흑백 그림에 구조 구분용 여러 강조색을 사용 | `skills/figure-style`, 강의프로그램 앱의 `skill.figure-style` | 자유로운 다색 채움이 눈에 부담스러워, 사용자가 두 견본과 실제 샘플 3종을 확인하고 기본 화풍으로 확정함 |
