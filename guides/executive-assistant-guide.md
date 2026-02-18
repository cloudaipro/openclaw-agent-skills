# Executive Assistant User Guide

## 1) What This Skill Does
- Skill ID: `executive-assistant`
- Default mode: `execution`
- Permission profile: `write`
- Purpose: Daily operations orchestration with time blocks, follow-ups, and risk alerts.

## 2) How to Install
This project already contains the source skill at:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/executive-assistant`

Install into an OpenClaw workspace skills directory:

```bash
SKILL_SRC="/Users/alex/data/work/my-agent-skills/openclaw-skills/executive-assistant"
WORKSPACE_SKILLS_DIR="<your-openclaw-workspace>/skills"
mkdir -p "$WORKSPACE_SKILLS_DIR"
cp -R "$SKILL_SRC" "$WORKSPACE_SKILLS_DIR/"
```

Optional shared install for all workspaces on this machine:

```bash
mkdir -p "$HOME/.openclaw/skills"
cp -R "/Users/alex/data/work/my-agent-skills/openclaw-skills/executive-assistant" "$HOME/.openclaw/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Runtime entrypoint:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/executive-assistant/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
cat > /tmp/executive-assistant-input.json <<'JSON'
{
  "user_request": "Turn a mixed backlog into an executable day command plan.",
  "language": "zh-TW",
  "context": {}
}
JSON

node "/Users/alex/data/work/my-agent-skills/openclaw-skills/executive-assistant/src/index.js" < /tmp/executive-assistant-input.json > /tmp/executive-assistant-output.json
jq '.summary, .artifacts[].type' /tmp/executive-assistant-output.json
```

Validate output:

```bash
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/executive-assistant/scripts/validate_output.py" /tmp/executive-assistant-output.json
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/executive-assistant/scripts/validate_operations_artifacts.py" /tmp/executive-assistant-output.json
```

## 4) Tutorial (Step by Step)
1. Install the skill folder into your OpenClaw skills directory.
2. Prepare a JSON input with a clear `user_request` and useful `context`.
3. Run the local runtime once and inspect `summary` + `artifacts`.
4. Validate envelope and artifact types with the two validators above.
5. Invoke the same request through OpenClaw and compare consistency.

Tutorial goal for this skill:
- Turn a mixed backlog into an executable day command plan.

## 5) Examples (At Least 3)
1. Plan today with five tasks and three meetings.
2. Create a follow-up queue from inbox and pending approvals.
3. Rebuild the day after two urgent incidents.

## 6) Notes
- This skill includes hardening guards for prompt-injection, secret exfiltration, and high-risk harmful requests.
- If a request is blocked, rewrite it as a safe high-level task and retry.
