"""디자인 값 검사: 토큰(CSS 변수)이 아닌 날 값과, 같거나 가까운 토큰을 찾는다.

쓰는 법: python scan.py <파일 또는 폴더>... [--near-px 2] [--near-color 12]
- 읽는 파일: .css · .html · .htm (폴더면 그 안을 모두)
- 토큰 정의(`--이름: 값`)는 토큰으로 모으고, 그 밖의 선언에서 px · rem · em · #색 · rgb()/hsl() 값을 날 값으로 본다.
- 0 · 0px · 100% 같은 값과 var(...) 안의 값은 날 값으로 보지 않는다.
결과는 마크다운 표로 표준 출력에 낸다. 아무것도 고치지 않는다.
"""
import argparse
import re
import sys
from pathlib import Path

DECL = re.compile(r"([a-zA-Z-]+)\s*:\s*([^;{}]+);")
TOKEN = re.compile(r"(--[a-zA-Z0-9-]+)\s*:\s*([^;{}]+);")
VALUE = re.compile(r"#[0-9a-fA-F]{3,8}\b|(?:rgb|rgba|hsl|hsla)\([^)]*\)|-?\d*\.?\d+(?:px|rem|em)\b")
VAR = re.compile(r"var\([^()]*(?:\([^()]*\)[^()]*)*\)")


def files(paths):
    for p in map(Path, paths):
        if p.is_dir():
            for ext in ("*.css", "*.html", "*.htm"):
                yield from sorted(p.rglob(ext))
        elif p.suffix.lower() in (".css", ".html", ".htm"):
            yield p


def line_of(text, pos):
    return text.count("\n", 0, pos) + 1


def hex_rgb(v):
    v = v.lstrip("#")
    if len(v) in (3, 4):
        v = "".join(c * 2 for c in v[:3])
    try:
        return tuple(int(v[i : i + 2], 16) for i in (0, 2, 4))
    except ValueError:
        return None


def family(name):
    """같은 종류끼리만 비교: --font-size-sm → font-size, --space-4 → space, --color-line → color"""
    m = re.match(r"--([a-z]+(?:-size|-weight)?)", name)
    return m.group(1) if m else name


def px(v):
    m = re.fullmatch(r"(-?\d*\.?\d+)px", v.strip())
    return float(m.group(1)) if m else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="+")
    ap.add_argument("--near-px", type=float, default=2)
    ap.add_argument("--near-color", type=float, default=12)
    a = ap.parse_args()

    tokens = {}  # 이름 -> (값, 위치)
    raw = []  # (위치, 속성, 값)
    for f in files(a.paths):
        text = f.read_text(encoding="utf-8", errors="replace")
        for m in TOKEN.finditer(text):
            tokens.setdefault(m.group(1), (m.group(2).strip(), f"{f}:{line_of(text, m.start())}"))
        for m in DECL.finditer(text):
            prop, val = m.group(1), m.group(2)
            if prop.startswith("--") or text[max(0, m.start() - 2) : m.start()].endswith("-"):
                continue
            bare = VAR.sub("", val)
            for v in VALUE.findall(bare):
                if re.fullmatch(r"-?0*\.?0+(px|rem|em)?", v):
                    continue
                raw.append((f"{f}:{line_of(text, m.start())}", prop, v))

    out = sys.stdout
    out.write("### 토큰에 없는 값\n| 위치 | 속성 | 값 | 같은 값 토큰 |\n|---|---|---|---|\n")
    by_value = {}
    for name, (v, _) in tokens.items():
        by_value.setdefault(v.lower(), []).append(name)
    for where, prop, v in raw:
        same = ", ".join(by_value.get(v.lower(), [])) or "-"
        out.write(f"| {where} | {prop} | `{v}` | {same} |\n")

    out.write("\n### 같은 값 토큰\n| 값 | 토큰들 |\n|---|---|\n")
    for v, names in by_value.items():
        if len(names) > 1:
            out.write(f"| `{v}` | {', '.join(names)} |\n")

    out.write(f"\n### 가까운 토큰 (같은 종류끼리, px {a.near_px} 이하 · 색 거리 {a.near_color} 이하)\n| 토큰 A | 값 | 토큰 B | 값 |\n|---|---|---|---|\n")
    items = list(tokens.items())
    for i, (n1, (v1, _)) in enumerate(items):
        for n2, (v2, _) in items[i + 1 :]:
            if v1.lower() == v2.lower() or family(n1) != family(n2):
                continue
            p1, p2 = px(v1), px(v2)
            c1 = hex_rgb(v1.strip()) if v1.strip().startswith("#") else None
            c2 = hex_rgb(v2.strip()) if v2.strip().startswith("#") else None
            near = (p1 is not None and p2 is not None and abs(p1 - p2) <= a.near_px) or (
                c1 and c2 and sum((x - y) ** 2 for x, y in zip(c1, c2)) ** 0.5 <= a.near_color
            )
            if near:
                out.write(f"| {n1} | `{v1}` | {n2} | `{v2}` |\n")

    out.write(f"\n요약: 토큰 {len(tokens)}개 · 토큰에 없는 값 {len(raw)}곳\n")


if __name__ == "__main__":
    main()
