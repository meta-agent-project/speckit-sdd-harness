---
name: living-spec
description: roadmap · constitution 처음 작성(start)과 코드 · spec 어긋남 점검(check) 때 사용. 이미 있는 roadmap · spec을 바꾸는 일은 change 스킬, 진행 순서와 게이트는 flow 스킬이 맡는다.
---

# living-spec

원칙: `specs/NNN-영역/spec.md`가 현재 진실이다. 바꿀 때는 spec을 먼저 고친다. 이력은 git이 맡는다. 전체는 얕게, 세부는 실행 직전에 깊게. 하네스 공통 규칙은 하네스 `rules.md`를 따른다.

## 항상 먼저 읽기
`.specify/memory/constitution.md` · `roadmap.md` · `wiki/overview.md` · 화면이 있는 영역이면 `specs/design-system.md`

## start — roadmap 처음 작성
사용자와 한 번에 하나씩 묻고 `roadmap.md`를 쓴다.

```markdown
# Roadmap

## 비전
(3~5줄: 무엇을 · 누구를 위해 · 왜)

## 범위 밖
- …

## 영역 지도
| 폴더 | 이름 | 의도 (한 줄) | 상태 |
|---|---|---|---|
| 001-… | … | … | 예정 |

## 작업 순서
1. 001-… — 이유
```
- 영역은 이름 · 의도 · 순서만. 요구사항·기술은 쓰지 않는다.
- 상태 값: 예정 · spec 작성 · 진행 중 · 완료.
- 프로젝트에 `.specify/memory/constitution.md`가 없으면 먼저 사용자와 만든다: 원칙 몇 줄과 `## 기술 제약`(플랫폼·언어·프레임워크 등 모든 plan이 따를 것). 머리에 `**Version**: 1.0.0 | **Ratified**: <오늘> | **Last Amended**: <오늘>`. 하네스 규칙은 넣지 않는다.
- `specs/design-system.md`가 없고 화면이 있는 제품이면 빈 틀(토큰 · 부품 · 화면 패턴 · 승인 기록 절)을 만든다.
- 끝나면 `llm-wiki` → constitution · `roadmap.md` · `wiki/` 커밋.

roadmap · spec · backlog를 고치는 일(요구사항 변경 · 새 영역 spec · 영역 추가 · 번호 다시 매김 · 버그)은 `change` 스킬이 맡는다.

## check — 어긋남 점검
영역별로 spec 요구사항과 코드·테스트를 대조해 표로 보고한다: 요구사항 · 상태(구현됨 / 없음 / spec과 다름 / 테스트 없음) · 근거 파일. 고치지 않는다. 고칠지는 사용자가 정하고, 고치면 `change`로 간다.

## 하지 않는 것
- wiki를 손으로 고치지 않는다.
- spec에 기술 스택이나 디자인 값을 쓰지 않는다.
- 시작 전 영역의 spec을 미리 깊게 쓰지 않는다.
