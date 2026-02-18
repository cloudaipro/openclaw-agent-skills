# Smart Insightful Friend User Guide

## 1) What This Skill Does
- Skill ID: `smart-insightful-friend`
- Default mode: `analysis`
- Permission profile: `read`
- Purpose: Plain-language strategic explainer with balanced multi-lens reasoning.

## 2) How to Install
This project already contains the source skill at:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/smart-insightful-friend`

Install into an OpenClaw workspace skills directory:

```bash
SKILL_SRC="/Users/alex/data/work/my-agent-skills/openclaw-skills/smart-insightful-friend"
WORKSPACE_SKILLS_DIR="<your-openclaw-workspace>/skills"
mkdir -p "$WORKSPACE_SKILLS_DIR"
cp -R "$SKILL_SRC" "$WORKSPACE_SKILLS_DIR/"
```

Optional shared install for all workspaces on this machine:

```bash
mkdir -p "$HOME/.openclaw/skills"
cp -R "/Users/alex/data/work/my-agent-skills/openclaw-skills/smart-insightful-friend" "$HOME/.openclaw/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Runtime entrypoint:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/smart-insightful-friend/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
cat > /tmp/smart-insightful-friend-input.json <<'JSON'
{
  "user_request": "Explain complex trends with practical implications and clear uncertainty.",
  "language": "zh-TW",
  "context": {}
}
JSON

node "/Users/alex/data/work/my-agent-skills/openclaw-skills/smart-insightful-friend/src/index.js" < /tmp/smart-insightful-friend-input.json > /tmp/smart-insightful-friend-output.json
jq '.summary, .artifacts[].type' /tmp/smart-insightful-friend-output.json
```

Validate output:

```bash
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/smart-insightful-friend/scripts/validate_output.py" /tmp/smart-insightful-friend-output.json
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/smart-insightful-friend/scripts/validate_reasoning_artifacts.py" /tmp/smart-insightful-friend-output.json
```

## 4) Tutorial (Step by Step)
1. Install the skill folder into your OpenClaw skills directory.
2. Prepare a JSON input with a clear `user_request` and useful `context`.
3. Run the local runtime once and inspect `summary` + `artifacts`.
4. Validate envelope and artifact types with the two validators above.
5. Invoke the same request through OpenClaw and compare consistency.

Tutorial goal for this skill:
- Explain complex trends with practical implications and clear uncertainty.

## 5) Examples (At Least 3)
1. Explain AI agent trends for a non-technical reader.
2. Compare geopolitical implications of chip export restrictions.
3. Summarize pros and cons of autonomous software teams.

## 6) Notes
- This skill includes hardening guards for prompt-injection, secret exfiltration, and high-risk harmful requests.
- If a request is blocked, rewrite it as a safe high-level task and retry.
