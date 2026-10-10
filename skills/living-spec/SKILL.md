---
name: living-spec
description: spec을 현재 진실로 유지한다. roadmap · constitution 처음 작성(start), spec 쓰기와 고치기(update), 코드 · spec 어긋남 점검(check) 때 사용. 어느 문서까지 바뀌는지 판정과 roadmap · backlog 고치기는 change 스킬, 진행 순서와 게이트는 flow 스킬이 맡는다.
---

# living-spec

원칙: `specs/NNN-영역/spec.md`는 이 프로그램이 지금 무엇인지만 담는다. 바꿀 때는 spec을 먼저 고친다. 이력은 git이 맡는다. 전체는 얕게, 세부는 실행 직전에 깊게. 하네스 공통 규칙은 하네스 `rules.md`를 따른다.

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

## update — spec 쓰기와 고치기

change가 spec이 바뀐다고 판정했을 때, flow 1단계에서 부른다.

1. 대상 폴더를 고정한다. 폴더 이름은 roadmap의 폴더 값을 그대로 쓴다. Spec Kit 명령을 부르기 전에 매번 .specify/feature.json에 {"feature_directory":"specs/<roadmap 폴더>"}를 쓴다.
2. 새 영역이면 /speckit-specify를 부른다. SPECIFY_FEATURE_DIRECTORY=specs/<roadmap 폴더>를 명시하고, 설명에 roadmap의 그 영역 행(이름 · 의도) · 관련 범위 밖 줄 · backlog의 그 영역 항목을 넣는다. Spec Kit 명령은 roadmap · backlog를 읽지 않고, 번호 · 이름을 새로 짓게 두면 안 되기 때문이다.
3. 기존 영역이면 spec.md 본문을 직접 고친다. 상태가 승인됨이었으면 초안으로 되돌린다. roadmap 상태가 완료였으면 spec 작성으로 바꾼다. flow 게이트①을 다시 거친다.
4. 다른 영역 계약이 바뀌면 그 영역 spec도 같은 변경에서 고친다.
5. 화면이 바뀌면 ## 화면에 화면마다 보여 줄 것과 할 수 있는 일을 쓴다. 하는 일이 드러나게 쓴다(예: 폴더를 골라 볼 범위를 바꾼다). mockup이 이 말로 용도를 고른다. 색 · 크기 · 배치 값은 디자인 스펙 파일에 둔다.
6. 아래 진실 규칙으로 점검한다.

### 진실 규칙

| 규칙 | 내용 |
|---|---|
| 본문만 | 화면 · 시나리오 · 경계 상황 · FR · 핵심 개체 · SC · 가정만 고친다 |
| 옛 줄 없음 | 바뀐 결정은 그 줄을 고쳐 쓴다. 옛 결정을 함께 남기지 않는다 |
| 경위 없음 | 확인 사항 절, 세션 기록, 세션 N 꼬리, 바뀐 경위, 문제 · 근본 원인 서술을 쓰지 않는다. 경위는 커밋 메시지, 긴 논의는 docs/discussions에 둔다 |
| 한 곳 | 한 규칙은 FR 한 곳에 둔다. 화면 · 시나리오는 짧게 쓰고 FR 번호로 가리킨다 |
| 번호 유지 | FR · SC 번호는 바꾸지 않는다. tasks와 테스트가 참조한다. 지운 번호는 다시 쓰지 않는다 |
| clarify 뒤 | /speckit-clarify를 썼으면 답마다 본문에 들어갔는지 보고 확인 사항 절을 지운다 |
| 점검 | 고친 뒤 spec.md에서 확인 사항, 세션 숫자를 grep해 0건이다 |

## check — 어긋남 점검
영역별로 spec 요구사항과 코드·테스트를 대조해 표로 보고한다: 요구사항 · 상태(구현됨 / 없음 / spec과 다름 / 테스트 없음) · 근거 파일. 진실 규칙을 어긴 곳도 함께 보고한다. 고치지 않는다. 고칠지는 사용자가 정하고, 고치면 `change`로 간다.

## 하지 않는 것
- wiki를 손으로 고치지 않는다.
- spec에 기술 스택이나 디자인 값을 쓰지 않는다.
- 시작 전 영역의 spec을 미리 깊게 쓰지 않는다. 뒤 영역 상세는 change가 backlog에 적는다.
