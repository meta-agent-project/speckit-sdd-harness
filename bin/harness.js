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

const os = require('os');
const { spawnSync } = require('child_process');
const ROOT_POSIX = ROOT.split(path.sep).join('/');
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

// 규칙의 {{harness}}는 이 PC의 하네스 경로로 바꿔 내보낸다. 새 Spec Kit이 있으면 한 줄 덧붙인다.
function rules() {
  let text = fs.readFileSync(path.join(ROOT, 'rules.md'), 'utf8').replaceAll('{{harness}}', ROOT_POSIX);
  const notice = speckitNotice();
  if (notice) text += `\n\n## 알림\n\n- ${notice}\n`;
  process.stdout.write(text);
}

// 여러 초 동안의 평균 CPU 사용률(%)
function measureCpu(seconds) {
  const snap = () => os.cpus().reduce((a, c) => {
    const t = Object.values(c.times).reduce((x, y) => x + y, 0);
    return { idle: a.idle + c.times.idle, total: a.total + t };
  }, { idle: 0, total: 0 });
  const a = snap();
  sleep(Math.max(1, Number(seconds) || 3) * 1000);
  const b = snap();
  return Math.round(100 * (1 - (b.idle - a.idle) / (b.total - a.total)));
}
const cpu = seconds => console.log(measureCpu(seconds));

// CPU가 기준 아래로 두 번 이어서 재지면 끝난다. 메인이 백그라운드로 띄워 두면 끝날 때 깨어난다.
function cpuWait(limit, maxMinutes) {
  limit = Number(limit) || 80;
  const until = Date.now() + (Number(maxMinutes) || 60) * 60000;
  let calm = 0;
  while (Date.now() < until) {
    const p = measureCpu(3);
    calm = p < limit ? calm + 1 : 0;
    if (calm >= 2) { console.log(`CPU ${p} — ${limit} 아래로 내려왔다. 기다리던 묶음을 내보낸다.`); return; }
    sleep(7000);
  }
  console.log(`CPU가 ${maxMinutes || 60}분 동안 ${limit} 아래로 내려오지 않았다. 무엇이 CPU를 쓰는지 사용자에게 알린다.`);
  process.exitCode = 2;
}

// 무거운 명령을 PC 전체에서 한 번에 하나만 돌린다. 앞 명령이 끝날 때까지 기다린다.
function heavy(args) {
  if (!args.length) throw new Error('사용법: heavy -- <명령>');
  const lock = path.join(os.tmpdir(), 'speckit-harness-heavy.lock');
  const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
  let waited = false;
  for (;;) {
    try { fs.mkdirSync(lock); break; } catch {
      const pid = Number((() => { try { return fs.readFileSync(path.join(lock, 'pid'), 'utf8'); } catch { return 0; } })());
      if (pid && !alive(pid)) { fs.rmSync(lock, { recursive: true, force: true }); continue; }
      if (!waited) { console.error('heavy: 앞 명령이 끝나기를 기다린다'); waited = true; }
      sleep(2000);
    }
  }
  fs.writeFileSync(path.join(lock, 'pid'), String(process.pid));
  try {
    const r = spawnSync(args.join(' '), { shell: true, stdio: 'inherit' });
    process.exitCode = r.status ?? 1;
  } finally {
    fs.rmSync(lock, { recursive: true, force: true });
  }
}

// Spec Kit 원본 따라가기
const SPECKIT_REPO = 'https://github.com/github/spec-kit.git';
const SPECKIT_CACHE = path.join(ROOT, '.speckit-check.json');
const ver = v => v.replace(/^v/, '').split(/[.-]/).slice(0, 3).map(n => parseInt(n, 10) || 0);
const newer = (a, b) => { const x = ver(a), y = ver(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false; };
const installedSpeckit = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'speckit/init-options.json'), 'utf8')).speckit_version;

function latestSpeckit() {
  const r = spawnSync('git', ['ls-remote', '--tags', '--refs', SPECKIT_REPO], { encoding: 'utf8', timeout: 8000 });
  if (r.status !== 0) throw new Error('Spec Kit 태그를 읽지 못했다');
  const tags = r.stdout.split('\n').map(l => (l.match(/refs\/tags\/(v\d+\.\d+\.\d+)$/) || [])[1]).filter(Boolean);
  return tags.reduce((a, t) => (!a || newer(t, a) ? t : a), null);
}

function speckitNotice() {
  try {
    let cache = {};
    try { cache = JSON.parse(fs.readFileSync(SPECKIT_CACHE, 'utf8')); } catch {}
    if (!cache.checked || Date.now() - cache.checked > 24 * 3600 * 1000) {
      cache = { checked: Date.now(), latest: latestSpeckit() };
      fs.writeFileSync(SPECKIT_CACHE, JSON.stringify(cache) + '\n');
    }
    const cur = installedSpeckit();
    if (cache.latest && newer(cache.latest, cur)) {
      return `Spec Kit ${cache.latest}가 나왔다(하네스는 ${cur}). 사용자에게 알리고, 원하면 하네스 폴더 CLAUDE.md의 "Spec Kit 올리기" 순서로 올린다.`;
    }
  } catch {}
  return '';
}

function speckitCheck() {
  const cur = installedSpeckit(), latest = latestSpeckit();
  console.log(`하네스 Spec Kit: ${cur}\n원본 최신: ${latest}\n${newer(latest, cur) ? '올릴 수 있다: speckit-harness speckit-update' : '최신이다'}`);
}

// 하네스가 쓰는 것(이미 하네스에 있는 speckit-* 스킬 · 템플릿 · 스크립트)만 새 버전 생성 결과로 바꾼다.
function speckitUpdate(tag) {
  tag = tag || latestSpeckit();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'speckit-gen-'));
  const r = spawnSync('uvx', ['--from', `git+${SPECKIT_REPO}@${tag}`, 'specify', 'init', '--here', '--force',
    '--non-interactive', '--integration', 'claude', '--script', 'sh', '--ignore-agent-tools'],
    { cwd: tmp, stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  if (r.status !== 0) throw new Error(`specify init 실패 (uv가 있어야 한다: https://docs.astral.sh/uv/)`);
  const gen = path.join(tmp, '.specify');
  const log = [];
  const put = (from, to) => {
    if (!fs.existsSync(from)) { log.push(`! 원본에 없음: ${path.relative(tmp, from)}`); return; }
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    log.push(`= ${path.relative(ROOT, to).split(path.sep).join('/')}`);
  };
  for (const d of fs.readdirSync(path.join(ROOT, 'skills')).filter(d => d.startsWith('speckit-'))) {
    put(path.join(tmp, '.claude/skills', d, 'SKILL.md'), path.join(ROOT, 'skills', d, 'SKILL.md'));
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'speckit/templates'))) {
    put(path.join(gen, 'templates', f), path.join(ROOT, 'speckit/templates', f));
  }
  // 스크립트는 있던 것 + 쓰는 스킬 · 스크립트가 부르는 것까지 따라간다.
  const want = new Set(fs.readdirSync(path.join(ROOT, 'speckit/scripts/bash')));
  const scan = file => { const t = fs.readFileSync(file, 'utf8'); for (const m of t.matchAll(/([\w-]+\.sh)\b/g)) if (fs.existsSync(path.join(gen, 'scripts/bash', m[1]))) want.add(m[1]); };
  for (const d of fs.readdirSync(path.join(ROOT, 'skills')).filter(d => d.startsWith('speckit-'))) scan(path.join(ROOT, 'skills', d, 'SKILL.md'));
  for (let n = -1; n !== want.size;) { n = want.size; for (const f of [...want]) if (fs.existsSync(path.join(gen, 'scripts/bash', f))) scan(path.join(gen, 'scripts/bash', f)); }
  const create = 'create-new-feature.sh'; // 하네스는 폴더를 roadmap으로 정하므로 쓰지 않는다
  want.delete(create);
  for (const f of want) put(path.join(gen, 'scripts/bash', f), path.join(ROOT, 'speckit/scripts/bash', f));
  for (const f of ['init-options.json', 'integration.json']) put(path.join(gen, f), path.join(ROOT, 'speckit', f));
  fs.rmSync(tmp, { recursive: true, force: true });
  try { fs.rmSync(SPECKIT_CACHE); } catch {}
  console.log(`Spec Kit ${tag}로 올림\n\n${log.join('\n')}\n\n다음: git diff로 바뀐 절을 보고 CLAUDE.md "Spec Kit 올리기" 점검을 한다.`);
}

const [cmd, ...rest] = process.argv.slice(2);
const arg = rest[0];
try {
  if (cmd === 'init') init(arg);
  else if (cmd === 'rules') rules();
  else if (cmd === 'cpu') cpu(arg);
  else if (cmd === 'cpu-wait') cpuWait(rest[0], rest[1]);
  else if (cmd === 'heavy') heavy(rest[0] === '--' ? rest.slice(1) : rest);
  else if (cmd === 'speckit-check') speckitCheck();
  else if (cmd === 'speckit-update') speckitUpdate(arg);
  else console.log([
    '사용법:',
    '  speckit-harness init [프로젝트 폴더]     하네스를 프로젝트에 연결 (기본: 현재 폴더)',
    '  speckit-harness rules                   규칙 출력 (세션 시작 훅이 사용)',
    '  speckit-harness cpu [초]                몇 초 평균 CPU 사용률(%)',
    '  speckit-harness cpu-wait [기준] [분]     CPU가 기준(기본 80) 아래로 내려오면 끝남 (기본 최대 60분)',
    '  speckit-harness heavy -- <명령>         무거운 명령을 한 번에 하나만 실행',
    '  speckit-harness speckit-check           Spec Kit 원본 새 버전 확인',
    '  speckit-harness speckit-update [vX.Y.Z] Spec Kit 스킬 · 템플릿 · 스크립트를 원본 생성 결과로 올림',
  ].join('\n'));
} catch (e) {
  console.error(`오류: ${e.message}`);
  process.exit(1);
}
