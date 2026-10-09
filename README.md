# speckit-harness

GitHub Spec Kit 중 쓰는 것만 남기고, 그 위에 기능 개발 순서(flow)·HTML 시안 고르기·TDD·living spec을 얹은 개인 개발 하네스. 어느 프로젝트에나 연결해 쓴다. 특정 프로젝트 내용은 여기 두지 않는다.

## 구조

| 경로 | 내용 |
|---|---|
| `rules.md` | 항상 적용되는 규칙. 프로젝트의 SessionStart 훅이 세션마다 주입 |
| `skills/` | 하네스 스킬 `flow` · `change` · `living-spec` · `mockup` · `design-consistency` · `tdd` · `llm-wiki` + Spec Kit 명령 7개(`speckit-*`, 원본 그대로) |
| `agents/` | `technical-researcher` |
| `speckit/` | Spec Kit 템플릿 3개 · bash 스크립트 4개(macOS·Linux·Windows Git Bash) · `init-options.json` · `integration.json` (원본 그대로) |
| `bin/harness.js` | 설치 CLI |

## 설치 (PC마다 한 번)

필요한 것: Git, Node.js 18 이상, Claude Code. Windows에서는 Git Bash(Spec Kit 스크립트 실행용).

```bash
git clone https://github.com/meta-agent-project/speckit-sdd-harness.git <하네스 폴더>
cd <하네스 폴더>
npm link        # 선택: 어디서든 speckit-harness 명령을 쓰게 등록
```

프로젝트는 하네스 폴더를 직접 가리키므로, 하네스 폴더는 지우거나 옮기지 않는 고정된 위치에 둔다(예: `C:/tools/speckit-harness`). 옮겼다면 프로젝트마다 `init`을 다시 실행한다.

`npm link`는 이 폴더의 `bin/harness.js`를 `speckit-harness`라는 전역 명령으로 연결만 한다(복사 아님, npm 사이트에 올리지 않음). 하지 않아도 되고, 그때는 `speckit-harness` 대신 `node <하네스 폴더>/bin/harness.js`로 실행한다.

## 프로젝트에 연결 (프로젝트마다 한 번)

```bash
cd <프로젝트 폴더>
speckit-harness init                         # npm link 한 경우
node <하네스 폴더>/bin/harness.js init       # npm link 안 한 경우
```

연결한 뒤 그 프로젝트에서 Claude Code를 열고 "flow 시작"이라고 말한다.

## 하네스 갱신

```bash
cd <하네스 폴더> && git pull
```

프로젝트는 하네스 폴더를 연결해 쓰므로 연결된 모든 프로젝트에 바로 반영된다. 다시 `init`할 필요는 없다.

## init이 하는 일

하는 일: `.claude/skills` · `.claude/agents` · `.specify/templates` · `.specify/scripts`를 하네스로 연결(Windows junction), `.specify/*.json` 복사, `.claude/settings.local.json`에 하네스 실제 경로로 SessionStart 훅(PC마다 다르므로 git 제외), `.gitignore`에 연결 경로 추가. 하네스 폴더를 옮겼으면 다시 실행하면 훅 경로도 바뀐다. 다시 실행해도 안전하다.

프로젝트 전용 파일(constitution · roadmap · specs · wiki)은 만들지 않는다. Claude Code에서 "flow 시작"이라고 하면 없을 때 `living-spec` start가 사용자와 만든다.

## 기능 개발 순서 (`flow`)

기능 spec → ①승인 → 디자인: 새 화면은 용도 조립 · HTML 시안 3개(`mockup`), 기존 화면 변경은 전/후 캡처 점검(`design-consistency` change) → ②승인·디자인 스펙 갱신 → plan → tasks(`tdd` A) → TDD 구현(`tdd` B) → 전체 테스트(`tdd` C) · 화면 측정과 캡처 자가 점검(`tdd` D) → converge → wiki·커밋

## 디자인은 용도로 조립한다

화면의 모든 요소는 용도 하나(네비게이션 · 검색 · 수정 · 주요 동작 …)에 속하고, 화면은 용도의 조합이다. 디자인 스펙은 네 층: `specs/design/tokens.md`(값) → `components.md`(모양) → `roles.md`(용도 하나 = 부품 · 크기 하나) → `specs/design-system.md`(화면 패턴 · 자리 표 · 승인 기록). 같은 용도는 같은 부품, 여백은 담는 쪽이, 한 줄은 높이 하나. 그려진 화면은 실제 브라우저에서 자리 표로 재고 캡처를 직접 본다.

## Spec Kit 갱신

남긴 파일 내용은 고치지 않는다. 갱신은 연결된 프로젝트에 `진행 중`인 영역이 없을 때만 하고, harness 커밋 하나로 남겨 문제가 생기면 되돌린다. 새 버전을 받을 때는 빈 임시 폴더에서 `specify init --here --force --non-interactive --integration claude --script sh`를 실행하고, 아래만 그대로 덮어쓴다.
- `.claude/skills/speckit-{specify,clarify,plan,tasks,analyze,implement,converge}` → `skills/`
- `.specify/templates/{spec,plan,tasks}-template.md` → `speckit/templates/`
- `.specify/scripts/bash/{common,check-prerequisites,setup-plan,setup-tasks}.sh` → `speckit/scripts/bash/`
