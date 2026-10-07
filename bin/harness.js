#!/usr/bin/env node
// 하네스 CLI. 사용법: speckit-harness init [프로젝트 폴더] | speckit-harness rules
const fs = require('fs');
const path = require('path');

const ROOT = fs.realpathSync(path.join(__dirname, '..'));

// 프로젝트 경로 → 하네스 경로. 하네스가 원본이고 프로젝트는 연결만 한다.
const LINKS = [
  ['.claude/skills', 'skills'],
  ['.claude/agents', 'agents'],
  ['.specify/templates', 'speckit/templates'],
  ['.specify/scripts', 'speckit/scripts'],
];
const COPIES = [
  ['.specify/init-options.json', 'speckit/init-options.json'],
  ['.specify/integration.json', 'speckit/integration.json'],
];
// 훅은 PC마다 다른 하네스 실제 경로를 쓰므로 git에 올리지 않는 settings.local.json에 둔다.
const HOOK_CMD = `node "${path.join(ROOT, 'bin', 'harness.js').split(path.sep).join('/')}" rules`;
const isHarnessHook = h => (h.command || '').endsWith('/bin/harness.js" rules');
const IGNORE_START = '# harness (연결 — 원본은 하네스 폴더)';

function isLink(p) {
  try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; }
}

function link(project, rel, target) {
  const dest = path.join(project, rel);
  const src = path.join(ROOT, target);
  if (isLink(dest)) {
    if (fs.realpathSync(dest) === fs.realpathSync(src)) return `= ${rel}`;
    fs.unlinkSync(dest);
  } else if (fs.existsSync(dest)) {
    throw new Error(`${rel} 이(가) 실제 폴더로 있습니다. 옮기거나 지운 뒤 다시 실행하세요.`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.symlinkSync(src, dest, process.platform === 'win32' ? 'junction' : 'dir');
  return `+ ${rel} → ${target}`;
}

function copy(project, rel, target) {
  const dest = path.join(project, rel);
  if (fs.existsSync(dest)) return `= ${rel}`;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(ROOT, target), dest);
  return `+ ${rel}`;
}

function addHook(project) {
  const file = path.join(project, '.claude/settings.local.json');
  const settings = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const hooks = (settings.hooks ??= {});
  const groups = hooks.SessionStart ?? [];
  if (groups.some(g => (g.hooks || []).some(h => h.command === HOOK_CMD))) return '= SessionStart 훅';
  // 하네스 위치가 바뀌었으면 옛 경로의 훅을 빼고 새로 단다.
  hooks.SessionStart = groups
    .map(g => ({ ...g, hooks: (g.hooks || []).filter(h => !isHarnessHook(h)) }))
    .filter(g => g.hooks.length);
  hooks.SessionStart.push({ hooks: [{ type: 'command', command: HOOK_CMD }] });
  fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n');
  return '+ SessionStart 훅 (.claude/settings.local.json)';
}

function addIgnore(project) {
  const file = path.join(project, '.gitignore');
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (text.includes(IGNORE_START)) return '= .gitignore';
  const block = [IGNORE_START, ...LINKS.map(([rel]) => rel), '.claude/settings.local.json', '.specify/feature.json'].join('\n');
  fs.writeFileSync(file, (text && !text.endsWith('\n') ? text + '\n' : text) + (text ? '\n' : '') + block + '\n');
  return '+ .gitignore';
}

function init(dir) {
  const project = path.resolve(dir || '.');
  if (project === ROOT || project.startsWith(ROOT + path.sep)) throw new Error('하네스 폴더 안에는 설치할 수 없습니다.');
  const log = [
    ...LINKS.map(([rel, t]) => link(project, rel, t)),
    ...COPIES.map(([rel, t]) => copy(project, rel, t)),
    addHook(project),
    addIgnore(project),
  ];
  console.log(`하네스 연결: ${project}\n하네스 원본: ${ROOT}\n\n${log.join('\n')}\n\n다음: 이 폴더에서 Claude Code를 열고 "flow 시작"이라고 말하세요.`);
}

const [cmd, arg] = process.argv.slice(2);
try {
  if (cmd === 'init') init(arg);
  else if (cmd === 'rules') process.stdout.write(fs.readFileSync(path.join(ROOT, 'rules.md'), 'utf8'));
  else console.log('사용법:\n  speckit-harness init [프로젝트 폴더]   하네스를 프로젝트에 연결 (기본: 현재 폴더)\n  speckit-harness rules                 규칙 출력 (세션 시작 훅이 사용)');
} catch (e) {
  console.error(`오류: ${e.message}`);
  process.exit(1);
}
