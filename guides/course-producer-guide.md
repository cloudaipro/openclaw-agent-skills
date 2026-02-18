# Course Producer User Guide

## 1) What This Skill Does
- Skill ID: `course-producer`
- Default mode: `planning`
- Permission profile: `read`
- Purpose: Course product design including curriculum, offer ladder, and funnel planning.

## 2) How to Install
This project already contains the source skill at:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/course-producer`

Install into an OpenClaw workspace skills directory:

```bash
SKILL_SRC="/Users/alex/data/work/my-agent-skills/openclaw-skills/course-producer"
WORKSPACE_SKILLS_DIR="<your-openclaw-workspace>/skills"
mkdir -p "$WORKSPACE_SKILLS_DIR"
cp -R "$SKILL_SRC" "$WORKSPACE_SKILLS_DIR/"
```

Optional shared install for all workspaces on this machine:

```bash
mkdir -p "$HOME/.openclaw/skills"
cp -R "/Users/alex/data/work/my-agent-skills/openclaw-skills/course-producer" "$HOME/.openclaw/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Runtime entrypoint:
- `/Users/alex/data/work/my-agent-skills/openclaw-skills/course-producer/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
cat > /tmp/course-producer-input.json <<'JSON'
{
  "user_request": "Design a sellable learning product from topic to launch plan.",
  "language": "zh-TW",
  "context": {}
}
JSON

node "/Users/alex/data/work/my-agent-skills/openclaw-skills/course-producer/src/index.js" < /tmp/course-producer-input.json > /tmp/course-producer-output.json
jq '.summary, .artifacts[].type' /tmp/course-producer-output.json
```

Validate output:

```bash
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/course-producer/scripts/validate_output.py" /tmp/course-producer-output.json
python3 "/Users/alex/data/work/my-agent-skills/openclaw-skills/course-producer/scripts/validate_operations_artifacts.py" /tmp/course-producer-output.json
```

## 4) Tutorial (Step by Step)
1. Install the skill folder into your OpenClaw skills directory.
2. Prepare a JSON input with a clear `user_request` and useful `context`.
3. Run the local runtime once and inspect `summary` + `artifacts`.
4. Validate envelope and artifact types with the two validators above.
5. Invoke the same request through OpenClaw and compare consistency.

Tutorial goal for this skill:
- Design a sellable learning product from topic to launch plan.

## 5) Examples (At Least 3)
1. Design a 6-week AI content course for beginners.
2. Build an offer ladder from free workshop to premium cohort.
3. Create a launch checklist for a hybrid online and offline cohort.

## 6) Notes
- This skill includes hardening guards for prompt-injection, secret exfiltration, and high-risk harmful requests.
- If a request is blocked, rewrite it as a safe high-level task and retry.
