# Eisenhower Priority AI User Guide

## 1) What This Skill Does
- Skill ID: `eisenhower-priority-ai`
- Default mode: `planning`
- Permission profile: `read`
- Purpose: Urgency and importance classification with 50-40-5-5 effort allocation.

## 2) How to Install
These skills are installable from this repository:
- https://github.com/cloudaipro/openclaw-agent-skills

Install all skills into another OpenClaw project:

```bash
git clone https://github.com/cloudaipro/openclaw-agent-skills.git
cd openclaw-agent-skills

TARGET_PROJECT="<your-openclaw-project>"
mkdir -p "$TARGET_PROJECT/skills"
cp -R skills/* "$TARGET_PROJECT/skills/"
```

Install only this skill:

```bash
git clone https://github.com/cloudaipro/openclaw-agent-skills.git
cd openclaw-agent-skills

TARGET_PROJECT="<your-openclaw-project>"
mkdir -p "$TARGET_PROJECT/skills"
cp -R skills/eisenhower-priority-ai "$TARGET_PROJECT/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Assume you already installed the skill to:
- `<your-openclaw-project>/skills/eisenhower-priority-ai`

Runtime entrypoint:
- `<your-openclaw-project>/skills/eisenhower-priority-ai/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
PROJECT_SKILLS_DIR="<your-openclaw-project>/skills"
SKILL_ID="eisenhower-priority-ai"

cat > /tmp/${SKILL_ID}-input.json <<'JSON'
{
  "user_request": "Prioritize overload situations into a decisive action order.",
  "language": "zh-TW",
  "context": {}
}
JSON

node "$PROJECT_SKILLS_DIR/$SKILL_ID/src/index.js" < /tmp/${SKILL_ID}-input.json > /tmp/${SKILL_ID}-output.json
jq '.summary, .artifacts[].type' /tmp/${SKILL_ID}-output.json
```

Validate output:

```bash
python3 "$PROJECT_SKILLS_DIR/$SKILL_ID/scripts/validate_output.py" /tmp/${SKILL_ID}-output.json
python3 "$PROJECT_SKILLS_DIR/$SKILL_ID/scripts/validate_operations_artifacts.py" /tmp/${SKILL_ID}-output.json
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
