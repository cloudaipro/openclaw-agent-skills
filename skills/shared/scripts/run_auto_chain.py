#!/usr/bin/env python3
"""Automatic multi-skill routing and chaining for OpenClaw skill packs.

Usage:
  python3 skills/shared/scripts/run_auto_chain.py --input /tmp/request.json
  cat /tmp/request.json | python3 skills/shared/scripts/run_auto_chain.py --stdin

Input JSON envelope:
{
  "user_request": "...",
  "language": "zh-TW|en",
  "context": {
    "force_chain": ["skill-a", "skill-b"],
    "max_stages": 6
  }
}
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


DEFAULT_MAX_STAGES = 6
REQUIRED_ENVELOPE_KEYS = {
    "skill",
    "language",
    "mode",
    "summary",
    "artifacts",
    "assumptions",
    "risks",
    "next_actions",
}


@dataclass
class RoutingDecision:
    template_id: str
    reason: str
    score: int
    chain: list[str]


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Auto-route and run chained skills.")
    parser.add_argument("--input", help="Path to input JSON file")
    parser.add_argument("--stdin", action="store_true", help="Read input JSON from stdin")
    parser.add_argument(
        "--skills-root",
        default=str(Path(__file__).resolve().parents[2]),
        help="Path to skills root directory (defaults to repo skills/)"
    )
    parser.add_argument(
        "--route-map",
        default=str(Path(__file__).resolve().parents[1] / "references" / "auto-chain-map.json"),
        help="Path to auto-chain routing map JSON"
    )
    parser.add_argument("--output", help="Write full chain output JSON to this file")
    parser.add_argument("--show-plan", action="store_true", help="Print selected chain plan")
    parser.add_argument("--stop-on-refusal", action="store_true", default=True, help="Stop chain if one stage returns refusal")
    return parser.parse_args()


def normalize_text(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return value.strip().lower()


def run_skill(skills_root: Path, skill: str, payload: dict[str, Any]) -> dict[str, Any]:
    runtime = skills_root / skill / "src" / "index.js"
    if not runtime.exists():
        raise FileNotFoundError(f"Skill runtime not found: {runtime}")

    proc = subprocess.run(
        ["node", str(runtime)],
        input=json.dumps(payload, ensure_ascii=False),
        text=True,
        capture_output=True,
        check=False,
    )

    if proc.returncode != 0:
        raise RuntimeError(f"Skill runtime failed ({skill}): {proc.stderr.strip()}")

    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON from skill {skill}: {exc}") from exc


def is_refusal(output: dict[str, Any]) -> bool:
    summary = normalize_text(output.get("summary", ""))
    if "refuse" in summary or "拒絕" in summary or "安全拒絕" in summary:
        return True

    for artifact in output.get("artifacts", []):
        if not isinstance(artifact, dict):
            continue
        content = normalize_text(artifact.get("content", ""))
        if "safety refusal" in content or "安全拒絕" in content:
            return True
    return False


def has_valid_envelope(output: dict[str, Any]) -> bool:
    return REQUIRED_ENVELOPE_KEYS.issubset(set(output.keys()))


def pick_chain(route_map: dict[str, Any], payload: dict[str, Any], available_skills: set[str]) -> RoutingDecision:
    context = payload.get("context") or {}
    forced = context.get("force_chain")
    if isinstance(forced, list) and forced:
        chain = [s for s in forced if isinstance(s, str) and s in available_skills]
        if chain:
            return RoutingDecision(
                template_id="forced",
                reason="context.force_chain provided",
                score=999,
                chain=chain,
            )

    request = normalize_text(payload.get("user_request", ""))
    context_blob = normalize_text(json.dumps(context, ensure_ascii=False))
    text = f"{request}\n{context_blob}"

    best: RoutingDecision | None = None
    for template in route_map.get("templates", []):
        keywords = [normalize_text(k) for k in template.get("keywords", []) if isinstance(k, str)]
        score = sum(1 for kw in keywords if kw and kw in text)
        chain = [s for s in template.get("chain", []) if isinstance(s, str) and s in available_skills]
        if not chain:
            continue
        decision = RoutingDecision(
            template_id=str(template.get("id", "unknown")),
            reason=str(template.get("description", "")),
            score=score,
            chain=chain,
        )
        if best is None or decision.score > best.score:
            best = decision

    if best and best.score > 0:
        return best

    fallback = route_map.get("fallback", {})
    fb_chain = [s for s in fallback.get("chain", []) if isinstance(s, str) and s in available_skills]
    if not fb_chain:
        fb_chain = ["ai-architect"] if "ai-architect" in available_skills else []

    return RoutingDecision(
        template_id=str(fallback.get("id", "fallback")),
        reason=str(fallback.get("description", "No keyword match; fallback route used")),
        score=0,
        chain=fb_chain,
    )


def main() -> int:
    args = parse_args()
    skills_root = Path(args.skills_root).resolve()
    route_map = load_json(Path(args.route_map).resolve())

    if args.stdin:
        payload = json.loads(sys.stdin.read())
    elif args.input:
        payload = load_json(Path(args.input).resolve())
    else:
        raise SystemExit("Provide --input <file> or --stdin")

    if not isinstance(payload, dict):
        raise SystemExit("Input must be a JSON object")

    request = payload.get("user_request", "")
    if not isinstance(request, str) or not request.strip():
        raise SystemExit("Input requires non-empty user_request")

    context = payload.get("context")
    if context is None or not isinstance(context, dict):
        context = {}

    available_skills = {
        path.name for path in skills_root.iterdir() if path.is_dir() and path.name != "shared"
    }

    decision = pick_chain(route_map, payload, available_skills)
    max_stages = int(context.get("max_stages", DEFAULT_MAX_STAGES))
    chain = decision.chain[: max(1, min(max_stages, 20))]

    if args.show_plan:
        print(f"Selected template: {decision.template_id} (score={decision.score})", file=sys.stderr)
        print(f"Reason: {decision.reason}", file=sys.stderr)
        print(f"Chain: {' -> '.join(chain)}", file=sys.stderr)

    stage_outputs: list[dict[str, Any]] = []
    upstream_summary = ""
    upstream_artifacts: list[dict[str, Any]] = []

    for idx, skill in enumerate(chain, start=1):
        stage_context = dict(context)
        stage_context["upstream_stage"] = idx - 1
        stage_context["upstream_summary"] = upstream_summary
        stage_context["upstream_artifacts"] = upstream_artifacts[:3]
        stage_context["route_template"] = decision.template_id

        stage_payload = {
            "user_request": request,
            "language": payload.get("language", "zh-TW"),
            "context": stage_context,
        }

        output = run_skill(skills_root, skill, stage_payload)
        valid_envelope = has_valid_envelope(output)
        refusal = is_refusal(output)

        stage_outputs.append(
            {
                "stage": idx,
                "skill": skill,
                "valid_envelope": valid_envelope,
                "refusal": refusal,
                "summary": output.get("summary", ""),
                "output": output,
            }
        )

        upstream_summary = str(output.get("summary", ""))
        artifacts = output.get("artifacts", [])
        upstream_artifacts = artifacts if isinstance(artifacts, list) else []

        if refusal and args.stop_on_refusal:
            break

    final_output = stage_outputs[-1]["output"] if stage_outputs else {}
    result = {
        "router": {
            "template_id": decision.template_id,
            "reason": decision.reason,
            "score": decision.score,
            "selected_chain": chain,
            "executed_stages": len(stage_outputs),
        },
        "request": {
            "user_request": payload.get("user_request", ""),
            "language": payload.get("language", "zh-TW"),
        },
        "stages": stage_outputs,
        "final": final_output,
    }

    out = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        Path(args.output).write_text(out + "\n", encoding="utf-8")
    else:
        print(out)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
