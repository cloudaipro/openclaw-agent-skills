# Deconstruction Master User Guide

## 1) What This Skill Does
- Skill ID: `deconstruction-master`
- Default mode: `analysis`
- Permission profile: `none`
- Purpose: Two-stage root-cause breakdown and intervention strategy planning.

## 2) How to Install
This project already contains the source skill at:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/deconstruction-master`

Install into an OpenClaw workspace skills directory:

```bash
SKILL_SRC="/Users/alex/data/work/my-agent-skills/openclaw-skills/deconstruction-master"
WORKSPACE_SKILLS_DIR="<your-openclaw-workspace>/skills"
mkdir -p "$WORKSPACE_SKILLS_DIR"
cp -R "$SKILL_SRC" "$WORKSPACE_SKILLS_DIR/"
```

Optional shared install for all workspaces on this machine:

```bash
mkdir -p "$HOME/.openclaw/skills"
cp -R "/Users/alex/data/work/my-agent-skills/openclaw-skills/deconstruction-master" "$HOME/.openclaw/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Runtime entrypoint:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/deconstruction-master/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
cat > /tmp/deconstruction-master-input.json <<'JSON'
{
  "user_request": "Decompose complex problems and output practical leverage actions.",
  "language": "zh-TW",
  "context": {}
}
JSON

node "/Users/alex/data/work/my-agent-skills/openclaw-skills/deconstruction-master/src/index.js" < /tmp/deconstruction-master-input.json > /tmp/deconstruction-master-output.json
jq '.summary, .artifacts[].type' /tmp/deconstruction-master-output.json
```

Validate output:

```bash
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/deconstruction-master/scripts/validate_output.py" /tmp/deconstruction-master-output.json
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/deconstruction-master/scripts/validate_reasoning_artifacts.py" /tmp/deconstruction-master-output.json
```

## 4) Tutorial (Step by Step)
1. Install the skill folder into your OpenClaw skills directory.
2. Prepare a JSON input with a clear `user_request` and useful `context`.
3. Run the local runtime once and inspect `summary` + `artifacts`.
4. Validate envelope and artifact types with the two validators above.
5. Invoke the same request through OpenClaw and compare consistency.

Tutorial goal for this skill:
- Decompose complex problems and output practical leverage actions.

## 5) Examples (At Least 3)
1. Deconstruct why cross-team projects stall and propose interventions.
2. Analyze social media outrage cycles and practical breakpoints.
3. Break down retention decline and design leverage strategy.

## 6) Notes
- This skill includes hardening guards for prompt-injection, secret exfiltration, and high-risk harmful requests.
- If a request is blocked, rewrite it as a safe high-level task and retry.
