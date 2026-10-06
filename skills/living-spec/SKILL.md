---
name: living-spec
description: Spec Kit 위에서 spec을 항상 최신으로 유지하는 흐름. ROADMAP 처음 작성(start), 요구사항·설계 변경이나 다음 영역 시작(change), 코드와 spec 어긋남 점검(check) 때 사용.
---

# living-spec

원칙: `specs/NNN-영역/spec.md`가 현재 진실이다. 바꿀 때는 spec을 먼저 고친다. 이력은 git이 맡는다. 전체는 얕게, 세부는 실행 직전에 깊게.

## 항상 먼저 읽기
`.specify/memory/constitution.md` · `ROADMAP.md` · `wiki/overview.md`

## start — ROADMAP 처음 작성
사용자와 한 번에 하나씩 묻고 `ROADMAP.md`를 쓴다.

```markdown
# Roadmap

## 비전
(3~5줄: 무엇을 · 누구를 위해 · 왜)

## 범위 밖
- …

## 영역 지도
| 폴더 | 이름 | 의도 (한 줄) | 의존 | 상태 |
|---|---|---|---|---|
| 001-… | … | … | — | 예정 |

## 작업 순서
1. 001-… — 이유
```
- 영역은 이름 · 의도 · 의존 · 순서만. 요구사항·기술은 쓰지 않는다.
- 상태 값: 예정 · spec 작성 · 진행 중 · 완료.
- 끝나면 `llm-wiki` → `ROADMAP.md`와 `wiki/` 커밋.

## change — 변경 또는 다음 영역 시작

1. **대상 폴더 고정.** 영향받는 영역을 ROADMAP에서 고르고, 폴더 이름은 ROADMAP의 "폴더" 값을 그대로 쓴다(Spec Kit이 번호·이름을 새로 짓게 두지 않는다). Spec Kit 명령은 `.specify/feature.json`의 폴더를 대상으로 삼으므로, 명령을 부르기 전에 매번 이 파일을 쓴다:
   ```json
   {"feature_directory":"specs/003-components"}
   ```
   의존 영역은 `contracts/`·`data-model.md`만 읽는다. `backlog.md`에 그 영역 항목이 있으면 plan의 입력으로 쓰고, 쓴 항목은 backlog에서 지운다.
2. **spec 먼저.**
   - 새 영역: `/speckit-specify`를 부를 때 `SPECIFY_FEATURE_DIRECTORY=specs/<ROADMAP 폴더>`를 명시하고, 설명에 ROADMAP의 그 영역 행(이름 · 의도 · 의존)과 관련 "범위 밖" 줄을 함께 넣는다. Spec Kit 명령은 ROADMAP을 읽지 않기 때문이다.
   - 기존 영역: `spec.md`를 직접 고치거나 `/speckit-clarify`.
   - 다른 영역 계약이 바뀌면 그 영역 spec도 같은 변경에서 고친다.
   - ROADMAP 상태를 `spec 작성`으로.
3. **plan · tasks.**
   - `/speckit-plan`: 기존 `plan.md`가 있으면 템플릿을 다시 복사하지 않으므로, 바뀐 spec에 맞춰 **모든 절**(기술 맥락, Constitution Check, 구조)을 다시 검토해 고친다.
   - 기존 영역에서 `/speckit-tasks`는 `tasks.md`를 새로 써서 체크 표시를 지운다. 먼저 커밋하고, 다시 만든 뒤 `/speckit-converge`로 이미 된 일을 다시 표시한 다음 진행한다.
   - `/speckit-analyze`가 지적한 불일치를 고친 뒤 진행.
4. **구현.** ROADMAP 상태를 `진행 중`으로. `/speckit-implement`, 테스트를 먼저 쓴다.
5. **수렴.** `/speckit-converge`. "Converged"가 나올 때까지 implement ↔ converge 반복.
6. **마무리 커밋 하나.** ROADMAP 상태 갱신(`완료` 등) → `llm-wiki` → spec · plan · tasks · 코드 · ROADMAP · wiki를 **같은 커밋**에 넣는다.

## check — 어긋남 점검
영역별로 spec 요구사항과 코드·테스트를 대조해 표로 보고한다: 요구사항 · 상태(구현됨 / 없음 / spec과 다름) · 근거 파일. 고치지 않는다. 고칠지는 사용자가 정하고, 고치면 change로 간다.

## 하지 않는 것
- wiki를 손으로 고치지 않는다.
- spec에 기술 스택을 쓰지 않는다(constitution). 기술 제약은 constitution의 "기술 제약" 절에만 있다.
- 시작 전 영역의 spec을 미리 깊게 쓰지 않는다.
- `/speckit-constitution`을 부르지 않는다. 템플릿 형식으로 덮어써 우리 constitution이 사라진다. 고칠 때는 파일을 직접 고치고 버전을 올린다.

## 새 PC에서
하네스 스킬은 git 밖(`harness/skills`)에 있다. `project/`에서 PowerShell로 다시 잇는다:
```powershell
New-Item -ItemType Junction -Path .claude\skills\living-spec -Target <모노레포>\harness\skills\living-spec
New-Item -ItemType Junction -Path .claude\skills\llm-wiki -Target <모노레포>\harness\skills\llm-wiki
```
