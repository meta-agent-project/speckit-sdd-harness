# Spec Kit 하네스 설계

- 날짜: 2026-10-06
- 참여: 사용자 + Claude
- 상태: 구현됨 (2026-10-06). 이후 변경: constitution v1.1.0에 기술 제약 절 추가(사용자 결정), ROADMAP 영역 표에서 범위 열 제외, backlog.md 추가

## 결정

기존 문서와 앱 코드를 모두 버리고, GitHub Spec Kit을 그대로 설치한 뒤 최소한으로 커스터마이징해 나만의 하네스로 쓴다. 커스터마이징은 constitution · ROADMAP · wiki와 스킬 2개(`llm-wiki`, `living-spec`)뿐이다.

참고: [spec-kit](https://github.com/github/spec-kit) · [Living Spec 가이드](https://github.com/github/spec-kit/blob/main/docs/guides/evolving-specs.md) · [speckit-roadmap(커뮤니티, 형식만 참고)](https://github.com/srobroek/speckit-roadmap)

## 원칙

- 전체는 얕게 먼저, 세부는 실행 직전에 깊게. 되돌리기 비싼 결정(기술 스택·디자인 시스템·제품 원칙)은 그 영역의 spec·plan 단계에서 정한다.
- Living Spec: 영역의 `spec.md`가 현재 진실이다. 바꿀 때는 spec을 먼저 고치고 plan·tasks를 다시 만든다. 이력은 git이 맡는다.
- spec에는 기술 스택을 쓰지 않는다. 기술은 plan에서 정한다.
- 역할: specs = 원본 · ROADMAP = 프로젝트 인덱스 · wiki = 원본에서 만든 요약·색인 · git = 변경 이력.

## 구조

```
project/                       .git만 남기고 새로 시작
├ .specify/                    specify init 결과 그대로
│  ├ memory/constitution.md    커스텀 (아래)
│  ├ templates/  scripts/      그대로
├ specs/NNN-영역/              /speckit-specify로 하나씩 작성. 템플릿 그대로, 요구사항 ID는 FR-001
├ ROADMAP.md                   커스텀 (아래)
├ wiki/                        llm-wiki가 생성. 직접 고치지 않음
└ CLAUDE.md                    행동 지침 · 스킬 사용 규칙 · 대화창 출력 규칙만

harness/
├ skills/llm-wiki/SKILL.md
├ skills/living-spec/SKILL.md
└ docs/                        하네스 설계 문서, 옛 mockup 보관
```

다른 영역의 요구사항은 `003/FR-001`처럼 폴더 번호를 붙여 가리킨다.

## constitution.md

```
- 요구사항을 먼저 정의하고 구현한다.
- 모든 핵심 요구사항은 검증 가능해야 한다.
- 보안 관련 입력은 검증한다.
- 불필요한 복잡성을 추가하지 않는다.
- 기존 확정된 프로젝트 규칙을 깨지 않는다.
- spec에는 기술 스택을 쓰지 않는다.
```

## ROADMAP.md

- 비전 · 범위 밖 (짧게)
- 영역 지도: 폴더 · 의도 · 범위 · 의존 · 상태(예정 / spec 작성 / 진행 중 / 완료)
- 작업 순서: 다음에 어느 영역을 할지

영역은 이름 · 의도 · 범위 · 의존 · 순서만 적는다. 세부는 각 spec에서 정한다.

## wiki/

`llm-wiki`가 ROADMAP과 `specs/` 전체를 읽어 다시 만든다. 파일마다 맨 위에 "자동 생성 — 직접 고치지 말 것".

| 파일 | 원본 |
|---|---|
| `overview.md` | ROADMAP 비전 · 영역 지도 · 상태 |
| `spec-index.md` | 각 spec의 요구사항 한 줄 목록과 링크 |
| `architecture.md` | 각 plan의 기술 결정. 여러 영역에 걸친 결정은 처음 도입한 영역의 plan이 소유 |
| `data-model.md` | 각 영역의 `data-model.md` · `contracts/` |
| `glossary.md` | 각 spec이 정의한 용어(Key Entities 포함) |

## 스킬

**llm-wiki** — wiki 다시 만들기. 사용자가 부르거나 `living-spec`이 마지막에 부른다.

**living-spec** — spec을 최신으로 유지하는 흐름 관리. 세 가지 모드:
1. 시작: 사용자와 ROADMAP 작성 (영역은 얕게)
2. 변경: 영향받는 영역 찾기 → `spec.md` 먼저 수정(`/speckit-clarify`) → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement` → `/speckit-converge` → spec과 코드를 같은 커밋에 → ROADMAP 상태 갱신 → `llm-wiki`
3. 점검: 코드와 spec이 어긋난 곳을 찾아 보고

## 에이전트가 읽는 범위

| 언제 | 파일 |
|---|---|
| 항상 | constitution · ROADMAP · `wiki/overview.md` |
| 지금 작업 | 해당 영역 spec · plan · tasks |
| 필요할 때만 | 의존 영역 `contracts/` · `data-model.md`, `wiki/` 나머지 |

## 실행 순서

1. `project/docs/mockups/`(git에 없음)를 `harness/docs/mockups/`로 옮긴다. 지우면 복구할 수 없어서 옮겨 둔다.
2. `project/`에서 `.git`을 뺀 모든 파일을 지우고 커밋한다. `node_modules`·`target` 같은 무시된 파일도 지운다.
3. 임시 폴더에서 `specify init`을 먼저 해 보고 `.claude/` 아래 어디에 명령·스킬이 생기는지 확인한다. `project/.claude/skills` → `harness/skills` junction을 유지할지 그 결과로 정한다.
4. `project/`에 `specify init` (AI: claude, 스크립트: PowerShell).
5. constitution 6줄 작성.
6. 스킬 2개 작성, CLAUDE.md 정리, `.gitignore` 작성. 커밋.
7. 메모리 갱신: 옛 specs/phases 규칙 메모리를 새 구조로 바꾼다.
8. 사용자와 ROADMAP 작성 → 첫 영역부터 `/speckit-specify`.

## 완료 기준

- `project/`에 옛 파일이 없고 Spec Kit 구조만 있다. 옛 mockup은 `harness/docs/mockups/`에 있다.
- `/speckit-*` 명령이 이 프로젝트에서 실행된다.
- constitution이 6줄이다.
- `llm-wiki`가 빈 specs에서도 wiki 5개 파일을 만든다(내용은 비어 있음).
- `living-spec` 시작 모드로 ROADMAP을 만들 수 있다.
