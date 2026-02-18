# Eisenhower Priority AI User Guide

## 1) What This Skill Does
- Skill ID: `eisenhower-priority-ai`
- Default mode: `planning`
- Permission profile: `read`
- Purpose: Urgency and importance classification with 50-40-5-5 effort allocation.

## 2) How to Install
This project already contains the source skill at:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/eisenhower-priority-ai`

Install into an OpenClaw workspace skills directory:

```bash
SKILL_SRC="/Users/alex/data/work/my-agent-skills/openclaw-skills/eisenhower-priority-ai"
WORKSPACE_SKILLS_DIR="<your-openclaw-workspace>/skills"
mkdir -p "$WORKSPACE_SKILLS_DIR"
cp -R "$SKILL_SRC" "$WORKSPACE_SKILLS_DIR/"
```

Optional shared install for all workspaces on this machine:

```bash
mkdir -p "$HOME/.openclaw/skills"
cp -R "/Users/alex/data/work/my-agent-skills/openclaw-skills/eisenhower-priority-ai" "$HOME/.openclaw/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Runtime entrypoint:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/eisenhower-priority-ai/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
cat > /tmp/eisenhower-priority-ai-input.json <<'JSON'
{
  "user_request": "Prioritize overload situations into a decisive action order.",
  "language": "zh-TW",
  "context": {}
}
JSON

node "/Users/alex/data/work/my-agent-skills/openclaw-skills/eisenhower-priority-ai/src/index.js" < /tmp/eisenhower-priority-ai-input.json > /tmp/eisenhower-priority-ai-output.json
jq '.summary, .artifacts[].type' /tmp/eisenhower-priority-ai-output.json
```

Validate output:

```bash
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/eisenhower-priority-ai/scripts/validate_output.py" /tmp/eisenhower-priority-ai-output.json
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/eisenhower-priority-ai/scripts/validate_operations_artifacts.py" /tmp/eisenhower-priority-ai-output.json
```

## 4) Tutorial (Step by Step)
1. Install the skill folder into your OpenClaw skills directory.
2. Prepare a JSON input with a clear `user_request` and useful `context`.
3. Run the local runtime once and inspect `summary` + `artifacts`.
4. Validate envelope and artifact types with the two validators above.
5. Invoke the same request through OpenClaw and compare consistency.

Tutorial goal for this skill:
- Prioritize overload situations into a decisive action order.

## 5) Examples (At Least 3)
1. Classify 12 tasks into Q1 to Q4 with a 50-40-5-5 split.
2. Prioritize a backlog when deadlines collide this week.
3. Decide what to delegate or eliminate from admin tasks.

## 6) Notes
- This skill includes hardening guards for prompt-injection, secret exfiltration, and high-risk harmful requests.
- If a request is blocked, rewrite it as a safe high-level task and retry.
