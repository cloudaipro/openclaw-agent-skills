#!/usr/bin/env python3
"""Validate reasoning artifact set for smart-insightful-friend."""

import subprocess
import sys
from pathlib import Path

if len(sys.argv) != 2:
    print("Usage: validate_reasoning_artifacts.py <output.json>")
    sys.exit(1)

script = Path(__file__).resolve().parents[2] / "shared" / "scripts" / "validate_artifact_types.py"
cmd = [sys.executable, str(script), sys.argv[1], "brief", "table", "plan", "checklist"]
result = subprocess.run(cmd)
sys.exit(result.returncode)
