---
name: bugfix
description: 버그 수정의 하나뿐인 입구. 원인은 superpowers:systematic-debugging으로 찾고, spec이 틀렸거나 비었으면 spec 줄을 먼저 고친 뒤 재현 테스트 → 수정 → 전체 테스트 → 커밋으로 끝낸다. "버그", "안 돼", "깨졌어", "이상해", "고쳐줘" 요청과 테스트 실패 때 사용.
---

# bugfix

버그는 이 스킬 하나로 고친다.
원인을 찾기 전에는 고치지 않는다.
spec이 바뀌면 spec을 먼저 고치고 코드는 그 뒤에 고친다.

## 1. 대상 정하기

- 버그가 닿는 영역을 roadmap.md에서 찾는다.
- .specify/feature.json에 {"feature_directory":"specs/<roadmap 폴더>"}를 쓴다.
- 그 영역의 spec.md와 관련 contracts/ · data-model.md를 읽는다.

## 2. 원인 찾기

- superpowers:systematic-debugging을 불러 1~3단계(원인 조사 · 패턴 비교 · 가설 확인)를 한다.
- 그 스킬의 4단계(고치기)는 하지 않고 이 스킬의 3으로 간다.
- 스킬로 부를 수 없으면(Codex 등) 아래 파일을 직접 읽고 따른다. 버전 폴더는 가장 높은 것을 쓴다.
  ~/.claude/plugins/cache/claude-plugins-official/superpowers/<버전>/skills/systematic-debugging/SKILL.md
- 그 파일도 없으면 그 사실을 알린다. 같은 순서로 직접 한다: 재현 → 최근 변경 → 나쁜 값을 거꾸로 따라가기 → 가설 하나를 가장 작은 변경으로 확인.
- 원인을 어디서 · 왜로 한 줄 알린다.

## 3. spec 먼저

원인을 spec에 대어 본다.

| spec 상태 | 할 일 |
|---|---|
| 맞음, 코드만 다름 | spec은 그대로 두고 4로 |
| 몇 줄이 틀렸거나 비었음 | 그 줄을 먼저 고친다. FR · 시나리오 · 경계 사례 · contracts · data-model 중 닿는 곳만 |
| 새 화면 · 디자인 변경 · 다른 영역으로 번짐 · 요구사항 자체가 바뀜 | 멈추고 living-spec update로 넘긴다 |

- spec은 living-spec의 진실 규칙대로 고친다.
- 고친 줄의 전과 후를 짧게 보이고 4로 간다.
- spec 상태는 그대로 둔다. plan · tasks는 다시 만들지 않는다. 고친 줄과 어긋나는 문장만 같이 고친다.

## 4. 재현 테스트 → 수정

- tdd B대로 한다. 재현 테스트를 쓰고 실패를 확인한다. 실패 이유가 찾은 원인과 같아야 한다.
- 원인을 고치는 최소 코드만 쓰고 통과를 확인한다.
- 세 번 고쳐도 안 되면 멈추고 구조 문제인지 사용자와 의논한다.

## 5. 전체 테스트

- tdd C로 전체 테스트를 실제로 돌린다. 화면 버그면 tdd D도 한다.
- 실패나 건너뜀이 있으면 4로 돌아간다.

## 6. 커밋

- spec · 코드 · 테스트를 커밋 하나로 넣는다: fix(NNN-영역): …
- spec · contracts · data-model이 바뀌었으면 llm-wiki로 wiki를 갱신해 같이 넣는다.
- 원인 · 고친 spec 줄 · 테스트 결과 · 남은 위험을 5줄 안으로 보고한다.
