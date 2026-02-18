# Audience Profiler User Guide

## 1) What This Skill Does
- Skill ID: `audience-profiler`
- Default mode: `analysis`
- Permission profile: `read`
- Purpose: Audience segmentation, persona cards, and decision-journey messaging plans.

## 2) How to Install
This project already contains the source skill at:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/audience-profiler`

Install into an OpenClaw workspace skills directory:

```bash
SKILL_SRC="/Users/alex/data/work/my-agent-skills/openclaw-skills/audience-profiler"
WORKSPACE_SKILLS_DIR="<your-openclaw-workspace>/skills"
mkdir -p "$WORKSPACE_SKILLS_DIR"
cp -R "$SKILL_SRC" "$WORKSPACE_SKILLS_DIR/"
```

Optional shared install for all workspaces on this machine:

```bash
mkdir -p "$HOME/.openclaw/skills"
cp -R "/Users/alex/data/work/my-agent-skills/openclaw-skills/audience-profiler" "$HOME/.openclaw/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Runtime entrypoint:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/audience-profiler/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
cat > /tmp/audience-profiler-input.json <<'JSON'
{
  "user_request": "Map customer segments into actionable go-to-market messaging.",
  "language": "zh-TW",
  "context": {}
}
JSON

node "/Users/alex/data/work/my-agent-skills/openclaw-skills/audience-profiler/src/index.js" < /tmp/audience-profiler-input.json > /tmp/audience-profiler-output.json
jq '.summary, .artifacts[].type' /tmp/audience-profiler-output.json
```

Validate output:

```bash
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/audience-profiler/scripts/validate_output.py" /tmp/audience-profiler-output.json
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/audience-profiler/scripts/validate_operations_artifacts.py" /tmp/audience-profiler-output.json
```

## 4) Tutorial (Step by Step)
1. Install the skill folder into your OpenClaw skills directory.
2. Prepare a JSON input with a clear `user_request` and useful `context`.
3. Run the local runtime once and inspect `summary` + `artifacts`.
4. Validate envelope and artifact types with the two validators above.
5. Invoke the same request through OpenClaw and compare consistency.

Tutorial goal for this skill:
- Map customer segments into actionable go-to-market messaging.

## 5) Examples (At Least 3)
1. Segment target users for a focus app in Taiwan.
2. Build three personas for a B2B analytics service.
3. Map the decision journey and messaging by funnel stage.

## 6) Notes
- This skill includes hardening guards for prompt-injection, secret exfiltration, and high-risk harmful requests.
- If a request is blocked, rewrite it as a safe high-level task and retry.
