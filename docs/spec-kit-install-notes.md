# Spec Kit 설치 메모 (2026-10-06)

- 설치: `pip install git+https://github.com/github/spec-kit.git` → specify 1.1.1.dev0 (uv 없음)
- init: `specify init --here --force --non-interactive --integration claude --script ps`
  (옛 옵션 `--ai`는 `--integration`으로 바뀜. 에이전트 환경에서는 `--non-interactive` 필수)
- Claude용 파일: `.claude/skills/speckit-*/SKILL.md` (analyze, checklist, clarify, constitution, converge, implement, plan, specify, tasks, taskstoissues)
- 판정: skills 방식. 명령 표기는 `/speckit-specify` 형태
- CLAUDE.md는 만들지 않음
