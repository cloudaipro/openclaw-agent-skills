# AI Architect User Guide

## 1) What This Skill Does
- Skill ID: `ai-architect`
- Default mode: `generation`
- Permission profile: `write`
- Purpose: Meta-skill design for SKILL.md, trigger boundaries, and scaffold planning.

## 2) How to Install
This project already contains the source skill at:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/ai-architect`

Install into an OpenClaw workspace skills directory:

```bash
SKILL_SRC="/Users/alex/data/work/my-agent-skills/openclaw-skills/ai-architect"
WORKSPACE_SKILLS_DIR="<your-openclaw-workspace>/skills"
mkdir -p "$WORKSPACE_SKILLS_DIR"
cp -R "$SKILL_SRC" "$WORKSPACE_SKILLS_DIR/"
```

Optional shared install for all workspaces on this machine:

```bash
mkdir -p "$HOME/.openclaw/skills"
cp -R "/Users/alex/data/work/my-agent-skills/openclaw-skills/ai-architect" "$HOME/.openclaw/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Runtime entrypoint:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/ai-architect/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
cat > /tmp/ai-architect-input.json <<'JSON'
{
  "user_request": "Create implementation-ready skill specs and rollout checks.",
  "language": "zh-TW",
  "context": {}
}
JSON

node "/Users/alex/data/work/my-agent-skills/openclaw-skills/ai-architect/src/index.js" < /tmp/ai-architect-input.json > /tmp/ai-architect-output.json
jq '.summary, .artifacts[].type' /tmp/ai-architect-output.json
```

Validate output:

```bash
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/ai-architect/scripts/validate_output.py" /tmp/ai-architect-output.json
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/ai-architect/scripts/validate_reasoning_artifacts.py" /tmp/ai-architect-output.json
```

## 4) Tutorial (Step by Step)
1. Install the skill folder into your OpenClaw skills directory.
2. Prepare a JSON input with a clear `user_request` and useful `context`.
3. Run the local runtime once and inspect `summary` + `artifacts`.
4. Validate envelope and artifact types with the two validators above.
5. Invoke the same request through OpenClaw and compare consistency.

Tutorial goal for this skill:
- Create implementation-ready skill specs and rollout checks.

## 5) Examples (At Least 3)
1. Draft a new skill for API documentation quality review.
2. Design trigger boundaries between two overlapping skills.
3. Generate SKILL.md plus manifest starter for an onboarding assistant.

## 6) Notes
- This skill includes hardening guards for prompt-injection, secret exfiltration, and high-risk harmful requests.
- If a request is blocked, rewrite it as a safe high-level task and retry.
