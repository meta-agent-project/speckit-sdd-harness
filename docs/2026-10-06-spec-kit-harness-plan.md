# Spec Kit 하네스 전환 실행 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `project/`를 비우고 GitHub Spec Kit을 설치한 뒤, constitution · ROADMAP · wiki와 스킬 2개(`llm-wiki`, `living-spec`)로 커스터마이징한다.

**Architecture:** Spec Kit(`specify init`) 결과는 그대로 둔다. 커스터마이징은 `.specify/memory/constitution.md` 내용, 루트 `ROADMAP.md`, 자동 생성 `wiki/`, 그리고 `harness/skills/`의 스킬 2개뿐이다. 스킬은 `harness/`가 원본이고 `project/.claude/skills/`에서 junction으로 연결한다.

**Tech Stack:** GitHub Spec Kit `specify-cli`(Python), Claude Code 스킬(SKILL.md), git, Windows(Git Bash + cmd `mklink /J`).

**Spec:** `harness/docs/2026-10-06-spec-kit-harness-design.md`

## Global Constraints

- 경로: 모노레포 루트 `C:\workspace\강의준비\강의프로그램만들기\`. git은 `project/`에서만 실행한다. `harness/`는 git 밖이다.
- `project/.git`은 지우지 않는다. 그 밖의 `project/` 파일은 모두 지운다(무시된 파일 포함).
- `harness/skills/` 내용은 어떤 경우에도 지워지면 안 된다. junction은 `cmd //c rmdir`로만 끊는다(`rm -rf`로 junction을 지우지 않는다).
- Spec Kit 템플릿(`.specify/templates/`)과 스크립트는 고치지 않는다.
- constitution은 설계 문서의 6줄 그대로.
- wiki 파일은 맨 위에 `> 자동 생성 — 직접 고치지 말 것. 원본: ROADMAP.md, specs/`를 둔다.
- 문서는 한국어, 짧게. 커밋 메시지 끝에 `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. junction을 `rm -rf`로 지우면 `harness/skills`(이 계획에서 만든 스킬 포함)가 함께 지워진다 → Task 2는 `rmdir`로 junction만 끊고, 끊은 뒤 `harness/skills`가 그대로인지 확인한다.
2. `git rm`만 하면 무시된 파일(`node_modules/`, `src-tauri/target/`, `.superpowers/`)이 남는다 → Task 2에서 `ls -A`로 `.git`만 남았는지 확인한다.
3. 비어 있지 않은 폴더에서 `specify init --here`가 확인을 묻고 멈출 수 있다 → Task 4는 `.git`만 남은 상태에서 `--force`로 실행한다.
4. Spec Kit이 `.claude/skills/`에 스킬을 설치하면 junction을 거쳐 `harness/skills`에 섞이고 git에서 빠진다 → Task 3에서 설치 위치를 먼저 확인하고 Task 4의 규칙으로 배치한다.
5. 사람이 wiki를 직접 고치면 다음 생성 때 사라진다 → 헤더 문구와 `living-spec` 규칙으로 막고, Task 6에서 헤더가 5개 파일 모두에 있는지 확인한다.

---

### Task 1: 옛 mockup과 CLAUDE.md 보관

**Files:**
- Create: `harness/docs/mockups/phase2/brief.md` (복사)
- Create: `harness/docs/old-CLAUDE.md` (복사)

- [ ] **Step 1: 복사**

```bash
cd "C:/workspace/강의준비/강의프로그램만들기"
mkdir -p harness/docs/mockups
cp -r project/docs/mockups/phase2 harness/docs/mockups/
cp project/CLAUDE.md harness/docs/old-CLAUDE.md
```

- [ ] **Step 2: 확인**

Run: `diff -r project/docs/mockups/phase2 harness/docs/mockups/phase2 && diff project/CLAUDE.md harness/docs/old-CLAUDE.md && echo OK`
Expected: `OK`

(git 밖이라 커밋 없음)

---

### Task 2: project 비우기

**Files:**
- Delete: `project/` 안의 `.git`을 뺀 전부

- [ ] **Step 1: junction만 끊기**

```bash
cd "C:/workspace/강의준비/강의프로그램만들기/project"
cmd //c rmdir ".claude\\skills"
ls ../harness/skills ../harness/docs
```
Expected: `harness/docs`에 `mockups`, `old-CLAUDE.md`, 설계·계획 문서가 그대로 보인다. `project/.claude/skills`는 없다.

- [ ] **Step 2: 추적 파일 삭제 커밋**

```bash
git rm -r -q .
git commit -q -m "chore: remove all files to restart with GitHub Spec Kit

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 3: 무시된 파일·빈 폴더 삭제**

```bash
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
ls -A
git ls-files | wc -l
```
Expected: `ls -A` 출력이 `.git` 하나, `git ls-files` 결과 `0`.

---

### Task 3: specify-cli 설치와 설치 위치 확인

**Files:**
- Create: `harness/docs/spec-kit-install-notes.md`

- [ ] **Step 1: 설치**

`uv`가 없으므로 pip로 설치한다.
```bash
pip install --upgrade "git+https://github.com/github/spec-kit.git"
specify --help
```
Expected: `init` 명령이 보인다. `specify`가 PATH에 없으면 `python -m specify_cli --help`로 대신 실행하고, 이후 모든 `specify`를 그 형태로 바꾼다.

- [ ] **Step 2: 임시 폴더에서 시험 설치**

```bash
SCRATCH="C:/Users/ssarm/AppData/Local/Temp/claude/C--workspace---------------/9d57fdef-62c5-477d-8400-3f1aafb2baea/scratchpad/speckit-probe"
mkdir -p "$SCRATCH" && cd "$SCRATCH"
specify init --here --ai claude --script ps --force --no-git
find . -path ./node_modules -prune -o -type f -print | sort
```
Expected: `.specify/memory/constitution.md`, `.specify/templates/*`, `.specify/scripts/powershell/*`, 그리고 `.claude/` 아래 명령 또는 스킬 파일 목록. (`--no-git`이 없다는 오류가 나면 그 옵션만 빼고 다시 실행)

- [ ] **Step 3: 기록**

`harness/docs/spec-kit-install-notes.md`에 다음을 적는다:
```markdown
# Spec Kit 설치 메모 (2026-10-06)
- 설치: pip install git+https://github.com/github/spec-kit.git  (버전: `specify --version` 결과)
- init 명령: specify init --here --ai claude --script ps --force
- Claude용 파일 위치: <Step 2에서 본 .claude/ 아래 경로들>
- 판정: <commands 방식 | skills 방식>
```

---

### Task 4: project에 Spec Kit 설치

**Files:**
- Create: `project/.specify/**`, `project/.claude/**` (specify init 결과)
- Create: `project/.gitignore`
- Create: junction `project/.claude/skills/llm-wiki`, `project/.claude/skills/living-spec` → `harness/skills/…` (Task 6·7에서 폴더가 생긴 뒤 연결)

- [ ] **Step 1: init**

```bash
cd "C:/workspace/강의준비/강의프로그램만들기/project"
specify init --here --ai claude --script ps --force
```
Expected: Task 3 Step 2와 같은 파일 구성. 기존 `.git`을 쓴다(새 저장소를 만들지 않음).

- [ ] **Step 2: 스킬 배치 규칙**

`project/.claude/skills/`는 일반 폴더로 둔다(전체 junction을 다시 만들지 않는다). Spec Kit 파일은 그 안에 git으로 추적되는 실제 파일로 남고, 하네스 스킬은 스킬 폴더별 junction으로 연결한다(Task 6·7 마지막 단계). 이렇게 하면 Spec Kit이 commands 방식이든 skills 방식이든 `harness/skills`와 섞이지 않는다.

- [ ] **Step 3: .gitignore**

`project/.gitignore`:
```gitignore
# 하네스 스킬은 harness/skills가 원본 (폴더별 junction)
.claude/skills/llm-wiki
.claude/skills/living-spec
.claude/settings.local.json
```

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -q -m "chore: install GitHub Spec Kit (specify init, claude, powershell)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
git ls-files | head -50
```
Expected: `.specify/…`, `.claude/…`, `.gitignore`가 추적된다.

---

### Task 5: constitution

**Files:**
- Modify: `project/.specify/memory/constitution.md` (전체 교체)

- [ ] **Step 1: 작성**

```markdown
# Constitution

**Version**: 1.0.0 | **Ratified**: 2026-10-06 | **Last Amended**: 2026-10-06

- 요구사항을 먼저 정의하고 구현한다.
- 모든 핵심 요구사항은 검증 가능해야 한다.
- 보안 관련 입력은 검증한다.
- 불필요한 복잡성을 추가하지 않는다.
- 기존 확정된 프로젝트 규칙을 깨지 않는다.
- spec에는 기술 스택을 쓰지 않는다.
```

- [ ] **Step 2: 확인**

Run: `grep -c '^- ' .specify/memory/constitution.md`
Expected: `6`

- [ ] **Step 3: 커밋**

```bash
git add .specify/memory/constitution.md
git commit -q -m "docs: constitution v1.0.0

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: llm-wiki 스킬과 첫 wiki 생성

**Files:**
- Create: `harness/skills/llm-wiki/SKILL.md`
- Create: junction `project/.claude/skills/llm-wiki`
- Create: `project/wiki/overview.md`, `spec-index.md`, `architecture.md`, `data-model.md`, `glossary.md`

**Interfaces:**
- Produces: 스킬 이름 `llm-wiki`. 인자 없음. `living-spec`이 마지막 단계에서 호출한다.

- [ ] **Step 1: SKILL.md 작성**

````markdown
---
name: llm-wiki
description: project/wiki/를 ROADMAP.md와 specs/ 전체에서 다시 만든다. spec·plan·data-model이 바뀐 뒤, converge 뒤, 또는 "wiki 갱신" 요청 때 사용.
---

# llm-wiki

wiki는 원본에서 만든 결과물이다. 손으로 고치지 않고 매번 통째로 다시 쓴다.

## 읽는 원본
- `ROADMAP.md`
- `specs/*/spec.md` · `plan.md` · `data-model.md` · `contracts/*`

## 만드는 파일 (project/wiki/)

모든 파일 첫 줄: `> 자동 생성 — 직접 고치지 말 것. 원본: ROADMAP.md, specs/`

| 파일 | 내용 |
|---|---|
| overview.md | ROADMAP의 비전 · 범위 밖 · 영역 지도(폴더 · 의도 · 상태 · 의존)를 그대로 요약 |
| spec-index.md | 영역별 절. 절마다 spec 링크, 사용자 스토리 제목, 요구사항을 `003/FR-001 한 줄 요약` 형식으로 모두 나열 |
| architecture.md | 각 plan.md의 기술 맥락·결정을 영역별로 모음. 여러 영역에 걸친 결정은 소유 영역 표시 |
| data-model.md | 각 영역 data-model.md의 엔티티와 contracts/ 목록을 영역별로 모음 |
| glossary.md | 각 spec의 Key Entities와 용어 정의를 가나다순 표로: 용어 · 뜻 · 정의한 영역 링크. 같은 용어가 두 영역에서 다르게 정의되면 표 아래 "충돌" 절에 적는다 |

## 규칙
- 원본에 없는 내용을 지어내지 않는다. 원본이 비어 있으면 그 절에 `(아직 없음)`만 쓴다.
- 요약은 한 줄. 상세는 원본 링크로 대신한다.
- 다 쓰면 5개 파일 모두 헤더가 있는지 확인한다.
- 커밋은 부른 쪽(사용자 또는 living-spec)이 한다.
````

- [ ] **Step 2: junction 연결**

```bash
cd "C:/workspace/강의준비/강의프로그램만들기/project"
mkdir -p .claude/skills
cmd //c mklink /J ".claude\\skills\\llm-wiki" "..\\harness\\skills\\llm-wiki"
ls .claude/skills/llm-wiki
```
Expected: `SKILL.md`

- [ ] **Step 3: 빈 상태에서 실행**

`llm-wiki` 스킬을 실행한다(ROADMAP·specs가 아직 없으므로 모든 절이 `(아직 없음)`).

- [ ] **Step 4: 확인**

Run: `ls wiki && grep -l '자동 생성 — 직접 고치지 말 것' wiki/*.md | wc -l && git check-ignore .claude/skills/llm-wiki && echo IGNORED`
Expected: 5개 파일 이름, `5`, `IGNORED`

- [ ] **Step 5: 커밋**

```bash
git add wiki
git commit -q -m "docs: add generated wiki skeleton (llm-wiki)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: living-spec 스킬

**Files:**
- Create: `harness/skills/living-spec/SKILL.md`
- Create: junction `project/.claude/skills/living-spec`

**Interfaces:**
- Consumes: `llm-wiki` 스킬, Spec Kit 명령(Task 3 메모의 이름. 아래는 `/speckit.*` 표기 — 실제 이름이 `/speckit-*`이면 그 표기로 바꿔 쓴다)
- Produces: 스킬 이름 `living-spec`. 모드 `start` · `change` · `check`.

- [ ] **Step 1: SKILL.md 작성**

````markdown
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
| 폴더 | 이름 | 의도 (한 줄) | 범위 | 의존 | 상태 |
|---|---|---|---|---|---|
| 001-… | … | … | … | — | 예정 |

## 작업 순서
1. 001-… — 이유
```
- 영역은 이름 · 의도 · 범위 · 의존 · 순서만. 요구사항·기술은 쓰지 않는다.
- 상태 값: 예정 · spec 작성 · 진행 중 · 완료.
- 끝나면 `llm-wiki` → `ROADMAP.md`와 `wiki/` 커밋.

## change — 변경 또는 다음 영역 시작
1. 영향받는 영역 폴더를 ROADMAP 의존 열로 찾는다. 의존 영역은 `contracts/`·`data-model.md`만 읽는다.
2. spec 먼저:
   - 새 영역: `/speckit.specify`
   - 기존 영역: `spec.md`를 직접 고치거나 `/speckit.clarify`
   - 다른 영역 계약이 바뀌면 그 영역 spec도 같은 변경에서 고친다.
3. `/speckit.plan` → `/speckit.tasks` → `/speckit.analyze`. analyze가 지적한 불일치를 고친 뒤 진행.
4. `/speckit.implement`. 테스트를 먼저 쓴다.
5. `/speckit.converge`. "Converged"가 나올 때까지 implement ↔ converge 반복.
6. spec과 코드를 같은 커밋에 넣는다. spec만 바뀌고 코드가 아직이면 ROADMAP 상태를 `spec 작성`으로 둔다.
7. ROADMAP 상태 갱신 → `llm-wiki` → `ROADMAP.md`·`wiki/` 커밋.

## check — 어긋남 점검
영역별로 spec 요구사항과 코드·테스트를 대조해 표로 보고한다: 요구사항 · 상태(구현됨 / 없음 / spec과 다름) · 근거 파일. 고치지 않는다. 고칠지는 사용자가 정하고, 고치면 change로 간다.

## 하지 않는 것
- wiki를 손으로 고치지 않는다.
- spec에 기술 스택을 쓰지 않는다(constitution).
- 시작 전 영역의 spec을 미리 깊게 쓰지 않는다.
````

- [ ] **Step 2: junction 연결과 확인**

```bash
cd "C:/workspace/강의준비/강의프로그램만들기/project"
cmd //c mklink /J ".claude\\skills\\living-spec" "..\\harness\\skills\\living-spec"
ls .claude/skills/living-spec && git check-ignore .claude/skills/living-spec && echo IGNORED
```
Expected: `SKILL.md`, `IGNORED`

- [ ] **Step 3: 명령 이름 맞추기**

Task 3 메모의 실제 명령 표기와 SKILL.md의 `/speckit.*` 표기를 비교해, 다르면 SKILL.md를 실제 표기로 바꾼다.
Run: `ls .claude/commands .claude/skills 2>/dev/null`

(git 밖이라 커밋 없음)

---

### Task 8: CLAUDE.md와 메모리 정리

**Files:**
- Create or Modify: `project/CLAUDE.md` (specify init이 만들었으면 그 내용 아래에 덧붙임)
- Modify: `C:\Users\ssarm\.claude\projects\C--workspace---------------\memory\keep-specs-updated.md`, `lecture-app-project.md`, `MEMORY.md`

- [ ] **Step 1: CLAUDE.md**

`harness/docs/old-CLAUDE.md`에서 "클로드.md" 행동 지침 1~4절, "스킬 사용 규칙", "대화창 출력 규칙"을 그대로 가져오고, "specs와 Phase"·"specs 최신 유지" 절은 버린 뒤 아래 절을 넣는다. 스킬 사용 규칙의 첫 줄은 다음으로 바꾼다:
`- 자동으로 써도 되는 스킬·명령은 이 작업 폴더 안의 것뿐이다: project/.claude/ (Spec Kit 명령 포함), harness/skills/.`

```markdown
## Spec Kit (Living Spec)
- 구조와 흐름은 GitHub Spec Kit을 따른다. 템플릿·스크립트는 고치지 않는다.
- 항상 먼저 읽기: `.specify/memory/constitution.md` · `ROADMAP.md` · `wiki/overview.md`. 지금 작업 영역의 spec · plan · tasks만 더 읽는다.
- 요구사항·설계 변경, 다음 영역 시작, 어긋남 점검은 `living-spec` 스킬로 한다.
- `wiki/`는 `llm-wiki`가 만든다. 직접 고치지 않는다.
```

- [ ] **Step 2: 커밋**

```bash
git add CLAUDE.md
git commit -q -m "docs: CLAUDE.md for Spec Kit living-spec workflow

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 3: 메모리 갱신**

- `keep-specs-updated.md`: 옛 specs/phases 규칙을 지우고 "Spec Kit + Living Spec, `living-spec`·`llm-wiki` 스킬, constitution 6줄, ROADMAP 루트, wiki 자동 생성, 2026-10-06 전부 버리고 재시작" 으로 다시 쓴다. Why: 사용자가 Spec Kit 원형 + 최소 커스텀을 원함, 파일 많은 것 싫어함.
- `lecture-app-project.md`: `project/`는 Spec Kit 구조로 재시작(앱 코드 없음), `harness/skills`가 원본이고 `project/.claude/skills/<이름>`은 스킬별 junction, 옛 문서는 git 이력·`harness/docs/`.
- `MEMORY.md` 두 줄의 hook을 새 내용에 맞게 고친다.

---

### Task 9: ROADMAP 작성 (사용자와 함께)

**Files:**
- Create: `project/ROADMAP.md`
- Modify: `project/wiki/*` (재생성)

- [ ] **Step 1:** `living-spec` start 모드 실행. 사용자와 비전 · 범위 밖 · 영역 · 순서를 정한다. 옛 내용은 `git show <Task 2 직전 커밋>:specs/product.md`, `…:specs/roadmap.md`로 참고만 한다.
- [ ] **Step 2:** `llm-wiki` 실행 → `wiki/overview.md`에 영역 지도가 보이는지 확인.
- [ ] **Step 3: 커밋**

```bash
git add ROADMAP.md wiki
git commit -q -m "docs: ROADMAP v1 and regenerated wiki

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

## 완료 확인 (설계 문서 완료 기준)

- [ ] `git ls-files`에 옛 파일(`specs/features`, `phases/`, `src-tauri/`, `ui/`)이 없다
- [ ] `harness/docs/mockups/phase2/brief.md`가 있다
- [ ] Claude Code에서 Spec Kit 명령(예: `/speckit.specify` 또는 `/speckit-specify`)이 목록에 보인다
- [ ] constitution `- ` 줄이 6개
- [ ] wiki 5개 파일 모두 헤더 있음
- [ ] `ROADMAP.md`가 있고 wiki overview에 반영됨
