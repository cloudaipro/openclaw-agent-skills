# Seedance Screenwriter User Guide

## 1) What This Skill Does
- Skill ID: `seedance-screenwriter`
- Default mode: `generation`
- Permission profile: `none`
- Purpose: VMCA prompt compiler in Traditional Chinese with positive-only phrasing.

## 2) How to Install
This project already contains the source skill at:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/seedance-screenwriter`

Install into an OpenClaw workspace skills directory:

```bash
SKILL_SRC="/Users/alex/data/work/my-agent-skills/openclaw-skills/seedance-screenwriter"
WORKSPACE_SKILLS_DIR="<your-openclaw-workspace>/skills"
mkdir -p "$WORKSPACE_SKILLS_DIR"
cp -R "$SKILL_SRC" "$WORKSPACE_SKILLS_DIR/"
```

Optional shared install for all workspaces on this machine:

```bash
mkdir -p "$HOME/.openclaw/skills"
cp -R "/Users/alex/data/work/my-agent-skills/openclaw-skills/seedance-screenwriter" "$HOME/.openclaw/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Runtime entrypoint:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/seedance-screenwriter/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
cat > /tmp/seedance-screenwriter-input.json <<'JSON'
{
  "user_request": "Produce direct-paste high-weight prompts with compact and expanded variants.",
  "language": "zh-TW",
  "context": {}
}
JSON

node "/Users/alex/data/work/my-agent-skills/openclaw-skills/seedance-screenwriter/src/index.js" < /tmp/seedance-screenwriter-input.json > /tmp/seedance-screenwriter-output.json
jq '.summary, .artifacts[].type' /tmp/seedance-screenwriter-output.json
```

Validate output:

```bash
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/seedance-screenwriter/scripts/validate_output.py" /tmp/seedance-screenwriter-output.json
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/seedance-screenwriter/scripts/validate_creative_artifacts.py" /tmp/seedance-screenwriter-output.json
```

## 4) Tutorial (Step by Step)
1. Install the skill folder into your OpenClaw skills directory.
2. Prepare a JSON input with a clear `user_request` and useful `context`.
3. Run the local runtime once and inspect `summary` + `artifacts`.
4. Validate envelope and artifact types with the two validators above.
5. Invoke the same request through OpenClaw and compare consistency.

Tutorial goal for this skill:
- Produce direct-paste high-weight prompts with compact and expanded variants.

## 5) Examples (At Least 3)
1. Turn a scene idea into VMCA Traditional Chinese prompt format.
2. Rewrite negative phrasing into a positive cinematic prompt.
3. Produce compact and expanded prompt versions for 9:16 output.

## 6) Notes
- This skill includes hardening guards for prompt-injection, secret exfiltration, and high-risk harmful requests.
- If a request is blocked, rewrite it as a safe high-level task and retry.
