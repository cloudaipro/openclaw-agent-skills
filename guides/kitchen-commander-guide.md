# Kitchen Commander User Guide

## 1) What This Skill Does
- Skill ID: `kitchen-commander`
- Default mode: `execution`
- Permission profile: `none`
- Purpose: Inventory-aware solo cooking SOP with equipment-safe execution steps.

## 2) How to Install
This project already contains the source skill at:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/kitchen-commander`

Install into an OpenClaw workspace skills directory:

```bash
SKILL_SRC="/Users/alex/data/work/my-agent-skills/openclaw-skills/kitchen-commander"
WORKSPACE_SKILLS_DIR="<your-openclaw-workspace>/skills"
mkdir -p "$WORKSPACE_SKILLS_DIR"
cp -R "$SKILL_SRC" "$WORKSPACE_SKILLS_DIR/"
```

Optional shared install for all workspaces on this machine:

```bash
mkdir -p "$HOME/.openclaw/skills"
cp -R "/Users/alex/data/work/my-agent-skills/openclaw-skills/kitchen-commander" "$HOME/.openclaw/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Runtime entrypoint:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/kitchen-commander/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
cat > /tmp/kitchen-commander-input.json <<'JSON'
{
  "user_request": "Use existing ingredients and tools to output one executable meal plan.",
  "language": "zh-TW",
  "context": {}
}
JSON

node "/Users/alex/data/work/my-agent-skills/openclaw-skills/kitchen-commander/src/index.js" < /tmp/kitchen-commander-input.json > /tmp/kitchen-commander-output.json
jq '.summary, .artifacts[].type' /tmp/kitchen-commander-output.json
```

Validate output:

```bash
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/kitchen-commander/scripts/validate_output.py" /tmp/kitchen-commander-output.json
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/kitchen-commander/scripts/validate_operations_artifacts.py" /tmp/kitchen-commander-output.json
```

## 4) Tutorial (Step by Step)
1. Install the skill folder into your OpenClaw skills directory.
2. Prepare a JSON input with a clear `user_request` and useful `context`.
3. Run the local runtime once and inspect `summary` + `artifacts`.
4. Validate envelope and artifact types with the two validators above.
5. Invoke the same request through OpenClaw and compare consistency.

Tutorial goal for this skill:
- Use existing ingredients and tools to output one executable meal plan.

## 5) Examples (At Least 3)
1. Plan dinner for one using eggs rice and scallions in 20 minutes.
2. Use air fryer and ceramic pan to cook a high-protein lunch.
3. Plan a low-spice meal and prioritize expiring vegetables.

## 6) Notes
- This skill includes hardening guards for prompt-injection, secret exfiltration, and high-risk harmful requests.
- If a request is blocked, rewrite it as a safe high-level task and retry.
