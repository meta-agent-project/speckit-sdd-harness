---
name: llm-wiki
description: project/wiki/를 roadmap.md와 specs/ 전체에서 다시 만든다. spec·plan·data-model이 바뀐 뒤, converge 뒤, 또는 "wiki 갱신" 요청 때 사용.
---

# llm-wiki

wiki는 원본에서 만든 결과물이다. 손으로 고치지 않고 매번 통째로 다시 쓴다.

## 읽는 원본
- `roadmap.md`
- `.specify/memory/constitution.md`의 "기술 제약" 절 (architecture.md 맨 위 "공통 기술 제약"으로)
- `specs/*/spec.md` · `plan.md` · `data-model.md` · `contracts/*`
- `specs/design-system.md` · `specs/design/*.md`(토큰 · 부품 정의 · 장면 토큰 — 있으면)

## 만드는 파일 (project/wiki/)

모든 파일 첫 줄: `> 자동 생성 — 직접 고치지 말 것. 원본: roadmap.md, specs/`

| 파일 | 내용 |
|---|---|
| overview.md | roadmap의 비전 · 범위 밖 · 영역 지도(폴더 · 의도 · 상태)를 그대로 요약 |
| spec-index.md | 영역별 절. 절마다 spec 링크, 사용자 스토리 제목, 요구사항을 `003/FR-001 한 줄 요약` 형식으로 모두 나열 |
| architecture.md | 각 plan.md의 기술 맥락·결정을 영역별로 모음. 여러 영역에 걸친 결정은 소유 영역 표시 |
| data-model.md | 각 영역 data-model.md의 엔티티와 contracts/ 목록을 영역별로 모음 |
| screens.md | 영역별 화면 목록(spec의 `## 화면`)과 화면마다 쓰는 부품(plan). plan에 나오는데 부품 정의(`specs/design/components.md`, 없으면 `specs/design-system.md`)에 없는 부품, 부품 정의에 있는데 아무 영역도 안 쓰는 부품을 표 아래 "충돌" 절에 적는다 |
| glossary.md | 각 spec의 Key Entities와 용어 정의를 가나다순 표로: 용어 · 뜻 · 정의한 영역 링크. 같은 용어가 두 영역에서 다르게 정의되면 표 아래 "충돌" 절에 적는다 |

## 규칙
- 원본에 없는 내용을 지어내지 않는다. 원본이 비어 있으면 그 절에 `(아직 없음)`만 쓴다.
- 요약은 한 줄. 상세는 원본 링크로 대신한다.
- 중복을 직접 합치지 않는다. 각 사실의 주인(영역 spec, `specs/design-system.md`)에 링크하고, 서로 다르면 "충돌"로 적어 사람이 원본을 고치게 한다.
- 한국어로 쓴다.
- 다 쓰면 6개 파일 모두 헤더가 있는지 확인한다.
- 커밋은 부른 쪽(사용자 · flow · change · living-spec)이 한다.
