#!/usr/bin/env python3
"""Validate presence of minimum prompt-pack sections."""

from pathlib import Path
import sys

required = ["Objective", "Inputs", "Output Schema", "Workflow", "Safety Rules"]
path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
missing = [section for section in required if f"## {section}" not in text]

if missing:
    print("[FAIL] Missing sections:", ", ".join(missing))
    sys.exit(1)

print("[OK] Prompt-pack structure valid")
