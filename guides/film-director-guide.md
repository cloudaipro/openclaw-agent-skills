# Film Director User Guide

## 1) What This Skill Does
- Skill ID: `film-director`
- Default mode: `generation`
- Permission profile: `read`
- Purpose: Narrative-first film treatment, scene planning, camera language, and lighting strategy.

## 2) How to Install
This project already contains the source skill at:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/film-director`

Install into an OpenClaw workspace skills directory:

```bash
SKILL_SRC="/Users/alex/data/work/my-agent-skills/openclaw-skills/film-director"
WORKSPACE_SKILLS_DIR="<your-openclaw-workspace>/skills"
mkdir -p "$WORKSPACE_SKILLS_DIR"
cp -R "$SKILL_SRC" "$WORKSPACE_SKILLS_DIR/"
```

Optional shared install for all workspaces on this machine:

```bash
mkdir -p "$HOME/.openclaw/skills"
cp -R "/Users/alex/data/work/my-agent-skills/openclaw-skills/film-director" "$HOME/.openclaw/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Runtime entrypoint:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/film-director/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
cat > /tmp/film-director-input.json <<'JSON'
{
  "user_request": "Transform a raw story premise into a cinematic pre-production plan.",
  "language": "zh-TW",
  "context": {}
}
JSON

node "/Users/alex/data/work/my-agent-skills/openclaw-skills/film-director/src/index.js" < /tmp/film-director-input.json > /tmp/film-director-output.json
jq '.summary, .artifacts[].type' /tmp/film-director-output.json
```

Validate output:

```bash
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/film-director/scripts/validate_output.py" /tmp/film-director-output.json
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/film-director/scripts/validate_creative_artifacts.py" /tmp/film-director-output.json
```

## 4) Tutorial (Step by Step)
1. Install the skill folder into your OpenClaw skills directory.
2. Prepare a JSON input with a clear `user_request` and useful `context`.
3. Run the local runtime once and inspect `summary` + `artifacts`.
4. Validate envelope and artifact types with the two validators above.
5. Invoke the same request through OpenClaw and compare consistency.

Tutorial goal for this skill:
- Transform a raw story premise into a cinematic pre-production plan.

## 5) Examples (At Least 3)
1. Develop a neo-noir short about a missing journalist.
2. Design camera and lighting plan for a sci-fi rescue scene.
3. Convert a one-paragraph premise into a three-act treatment.

## 6) Notes
- This skill includes hardening guards for prompt-injection, secret exfiltration, and high-risk harmful requests.
- If a request is blocked, rewrite it as a safe high-level task and retry.
