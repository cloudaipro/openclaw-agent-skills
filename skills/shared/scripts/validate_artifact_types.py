#!/usr/bin/env python3
"""Validate that required artifact types exist in skill output envelope."""

import json
import sys

if len(sys.argv) < 3:
    print("Usage: validate_artifact_types.py <output.json> <type1> [type2 ...]")
    sys.exit(1)

path = sys.argv[1]
required = sys.argv[2:]

with open(path, "r", encoding="utf-8") as f:
    payload = json.load(f)

artifacts = payload.get("artifacts", [])
seen = [a.get("type") for a in artifacts if isinstance(a, dict)]
missing = [t for t in required if t not in seen]

if missing:
    print("[FAIL] Missing artifact types:", ", ".join(missing))
    print("[INFO] Seen types:", ", ".join(seen) if seen else "(none)")
    sys.exit(1)

print("[OK] Required artifact types present:", ", ".join(required))
