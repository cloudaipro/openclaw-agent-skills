#!/usr/bin/env python3
"""Placeholder scorer for trigger precision datasets."""

import json
import sys

if len(sys.argv) != 2:
    print("Usage: score_trigger_precision.py <results.json>")
    sys.exit(1)

with open(sys.argv[1], "r", encoding="utf-8") as f:
    data = json.load(f)

correct = sum(1 for row in data if row.get("predicted") == row.get("expected"))
total = len(data) or 1
precision = correct / total
print(json.dumps({"precision": round(precision, 4), "total": len(data)}, ensure_ascii=False))
