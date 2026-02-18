#!/usr/bin/env python3
"""Validate top-level output envelope fields for film-director."""

import json
import sys

required = [
    "skill",
    "language",
    "mode",
    "summary",
    "artifacts",
    "assumptions",
    "risks",
    "next_actions",
]

if len(sys.argv) != 2:
    print("Usage: validate_output.py <output.json>")
    sys.exit(1)

with open(sys.argv[1], "r", encoding="utf-8") as f:
    payload = json.load(f)

missing = [k for k in required if k not in payload]
if missing:
    print("[FAIL] Missing keys:", ", ".join(missing))
    sys.exit(1)

print("[OK] Envelope fields present")
