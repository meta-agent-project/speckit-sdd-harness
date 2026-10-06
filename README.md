# spec-harness

GitHub Spec Kit 중 쓰는 것만 남기고, 그 위에 기능 개발 순서(flow)·HTML 시안 고르기·TDD·living spec을 얹은 개인 개발 하네스. 어느 프로젝트에나 연결해 쓴다. 특정 프로젝트 내용은 여기 두지 않는다.

## 구조

| 경로 | 내용 |
|---|---|
| `rules.md` | 항상 적용되는 규칙. 프로젝트의 SessionStart 훅이 세션마다 주입 |
| `skills/` | 하네스 스킬 `flow` · `living-spec` · `mockup` · `tdd` · `llm-wiki` + Spec Kit 명령 7개(`speckit-*`, 원본 그대로) |
| `agents/` | `technical-researcher` |
| `speckit/` | Spec Kit 템플릿 3개 · bash 스크립트 4개(macOS·Linux·Windows Git Bash) · `init-options.json` · `integration.json` (원본 그대로) |
| `bin/harness.js` | 설치 CLI |

## 프로젝트에 연결

```bash
npx <하네스 폴더 경로> init [프로젝트 폴더]     # 기본: 현재 폴더
# 또는 한 번 npm link 해 두고
cd <하네스 폴더> && npm link
harness init [프로젝트 폴더]
```

하는 일: `.claude/skills` · `.claude/agents` · `.specify/templates` · `.specify/scripts`를 하네스로 연결(Windows junction), `.specify/*.json` 복사, `.claude/settings.local.json`에 하네스 실제 경로로 SessionStart 훅(PC마다 다르므로 git 제외), `.gitignore`에 연결 경로 추가. 하네스 폴더를 옮겼으면 다시 실행하면 훅 경로도 바뀐다. 다시 실행해도 안전하다. 새 PC에서는 하네스를 받은 뒤 프로젝트마다 한 번 실행한다.

프로젝트 전용 파일(constitution · ROADMAP · specs · wiki)은 만들지 않는다. Claude Code에서 "flow 시작"이라고 하면 없을 때 `living-spec` start가 사용자와 만든다.

## 기능 개발 순서 (`flow`)

기능 spec → ①승인 → HTML 시안 3개(`mockup`) → ②승인·`specs/design-system.md` 갱신 → plan → tasks(`tdd` A) → TDD 구현(`tdd` B) → 전체 테스트(`tdd` C) → converge → wiki·커밋

## Spec Kit 갱신

남긴 파일 내용은 고치지 않는다. 갱신은 연결된 프로젝트에 `진행 중`인 영역이 없을 때만 하고, harness 커밋 하나로 남겨 문제가 생기면 되돌린다. 새 버전을 받을 때는 빈 임시 폴더에서 `specify init --here --force --non-interactive --integration claude --script sh`를 실행하고, 아래만 그대로 덮어쓴다.
- `.claude/skills/speckit-{specify,clarify,plan,tasks,analyze,implement,converge}` → `skills/`
- `.specify/templates/{spec,plan,tasks}-template.md` → `speckit/templates/`
- `.specify/scripts/bash/{common,check-prerequisites,setup-plan,setup-tasks}.sh` → `speckit/scripts/bash/`
