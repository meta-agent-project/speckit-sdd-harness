---
name: living-spec
description: spec을 항상 현재 진실로 유지한다. roadmap 처음 작성(start), 요구사항·설계 변경이나 새 영역 spec 작성(change), 코드와 spec 어긋남 점검(check) 때 사용. 진행 순서와 게이트는 flow 스킬이 맡는다.
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

## change — spec 변경 또는 새 영역 spec

1. **대상 폴더 고정.** 영향받는 영역을 roadmap에서 고르고, 폴더 이름은 roadmap의 "폴더" 값을 그대로 쓴다(Spec Kit이 번호·이름을 새로 짓게 두지 않는다). Spec Kit 명령은 `.specify/feature.json`의 폴더를 대상으로 삼으므로 명령을 부르기 전에 매번 이 파일을 쓴다:
   ```json
   {"feature_directory":"specs/003-components"}
   ```
2. **새 영역:** `/speckit-specify`를 부를 때 `SPECIFY_FEATURE_DIRECTORY=specs/<roadmap 폴더>`를 명시하고, 설명에 roadmap의 그 영역 행(이름 · 의도)과 관련 "범위 밖" 줄을 함께 넣는다. Spec Kit 명령은 roadmap을 읽지 않기 때문이다.
3. **기존 영역:** `spec.md`를 직접 고치거나 `/speckit-clarify`. 상태가 `승인됨`이었으면 `초안`으로 되돌린다(flow 게이트①을 다시 거친다).
4. **다른 영역 계약이 바뀌면** 그 영역 spec도 같은 변경에서 고친다.
5. **화면이 있으면** `## 화면` 절에 화면마다 보여 줄 것·할 수 있는 일만 쓴다. 색·크기·배치 값은 쓰지 않는다.
6. 이후 진행은 `flow`가 이어 간다.

## check — 어긋남 점검
영역별로 spec 요구사항과 코드·테스트를 대조해 표로 보고한다: 요구사항 · 상태(구현됨 / 없음 / spec과 다름 / 테스트 없음) · 근거 파일. 고치지 않는다. 고칠지는 사용자가 정하고, 고치면 change로 간다.

## 하지 않는 것
- wiki를 손으로 고치지 않는다.
- spec에 기술 스택이나 디자인 값을 쓰지 않는다.
- 시작 전 영역의 spec을 미리 깊게 쓰지 않는다.
