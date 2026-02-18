#!/usr/bin/env python3
"""Basic metadata linter for OpenClaw skill scaffolds."""

from pathlib import Path
import re
import sys

BASE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
skill_dirs = [p for p in BASE.iterdir() if p.is_dir() and p.name != "shared"]
ok = True

for skill in sorted(skill_dirs):
    skill_md = skill / "SKILL.md"
    manifest = skill / "manifest.yaml"
    if not skill_md.exists() or not manifest.exists():
        print(f"[ERROR] Missing required files in {skill}")
        ok = False
        continue
    text = skill_md.read_text(encoding="utf-8")
    if not re.search(r"^---\nname:\s+[a-z0-9-]+\ndescription:\s+.+\n---", text, re.M):
        print(f"[ERROR] Invalid frontmatter in {skill_md}")
        ok = False

print("[OK] Metadata lint passed" if ok else "[FAIL] Metadata lint failed")
sys.exit(0 if ok else 1)
