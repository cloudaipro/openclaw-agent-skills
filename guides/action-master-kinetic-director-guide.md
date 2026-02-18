# Action Master Kinetic Director User Guide

## 1) What This Skill Does
- Skill ID: `action-master-kinetic-director`
- Default mode: `generation`
- Permission profile: `none`
- Purpose: Motion-first scene design for choreography scripts and multi-tool video prompts.

## 2) How to Install
This project already contains the source skill at:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/action-master-kinetic-director`

Install into an OpenClaw workspace skills directory:

```bash
SKILL_SRC="/Users/alex/data/work/my-agent-skills/openclaw-skills/action-master-kinetic-director"
WORKSPACE_SKILLS_DIR="<your-openclaw-workspace>/skills"
mkdir -p "$WORKSPACE_SKILLS_DIR"
cp -R "$SKILL_SRC" "$WORKSPACE_SKILLS_DIR/"
```

Optional shared install for all workspaces on this machine:

```bash
mkdir -p "$HOME/.openclaw/skills"
cp -R "/Users/alex/data/work/my-agent-skills/openclaw-skills/action-master-kinetic-director" "$HOME/.openclaw/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Runtime entrypoint:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/action-master-kinetic-director/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
cat > /tmp/action-master-kinetic-director-input.json <<'JSON'
{
  "user_request": "Convert dynamic scene intent into beat-level kinetic output.",
  "language": "zh-TW",
  "context": {}
}
JSON

node "/Users/alex/data/work/my-agent-skills/openclaw-skills/action-master-kinetic-director/src/index.js" < /tmp/action-master-kinetic-director-input.json > /tmp/action-master-kinetic-director-output.json
jq '.summary, .artifacts[].type' /tmp/action-master-kinetic-director-output.json
```

Validate output:

```bash
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/action-master-kinetic-director/scripts/validate_output.py" /tmp/action-master-kinetic-director-output.json
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/action-master-kinetic-director/scripts/validate_creative_artifacts.py" /tmp/action-master-kinetic-director-output.json
```

## 4) Tutorial (Step by Step)
1. Install the skill folder into your OpenClaw skills directory.
2. Prepare a JSON input with a clear `user_request` and useful `context`.
3. Run the local runtime once and inspect `summary` + `artifacts`.
4. Validate envelope and artifact types with the two validators above.
5. Invoke the same request through OpenClaw and compare consistency.

Tutorial goal for this skill:
- Convert dynamic scene intent into beat-level kinetic output.

## 5) Examples (At Least 3)
1. Create a rooftop chase choreography prompt for Sora.
2. Generate fight scene beats with readable camera geography.
3. Convert a dance concept into Runway Kling Luma and Sora prompts.

## 6) Notes
- This skill includes hardening guards for prompt-injection, secret exfiltration, and high-risk harmful requests.
- If a request is blocked, rewrite it as a safe high-level task and retry.
