# Gemini Visual Director User Guide

## 1) What This Skill Does
- Skill ID: `gemini-visual-director`
- Default mode: `generation`
- Permission profile: `none`
- Purpose: Gemini and Imagen prompt specialist for narrative visual generation.

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
cp -R skills/gemini-visual-director "$TARGET_PROJECT/skills/"
```

After install, restart or reload OpenClaw so the skill registry refreshes.

## 3) Usage
Assume you already installed the skill to:
- `<your-openclaw-project>/skills/gemini-visual-director`

Runtime entrypoint:
- `<your-openclaw-project>/skills/gemini-visual-director/src/index.js`

Expected input envelope:
- `user_request` (required)
- `language` (optional: `zh-TW` or `en`)
- `context` (optional object)

Run locally:

```bash
PROJECT_SKILLS_DIR="<your-openclaw-project>/skills"
SKILL_ID="gemini-visual-director"

cat > /tmp/${SKILL_ID}-input.json <<'JSON'
{
  "user_request": "Generate Google-optimized prompt sets with baseline and stylized variants.",
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
python3 "$PROJECT_SKILLS_DIR/$SKILL_ID/scripts/validate_creative_artifacts.py" /tmp/${SKILL_ID}-output.json
```

## 4) Tutorial (Step by Step)
1. Install the skill folder into your OpenClaw skills directory.
2. Prepare a JSON input with a clear `user_request` and useful `context`.
3. Run the local runtime once and inspect `summary` + `artifacts`.
4. Validate envelope and artifact types with the two validators above.
5. Invoke the same request through OpenClaw and compare consistency.

Tutorial goal for this skill:
- Generate Google-optimized prompt sets with baseline and stylized variants.

## 5) Examples (At Least 3)
1. Write Gemini and Imagen prompts for a futuristic portrait poster.
2. Generate baseline and stylized variants for product concept art.
3. Refine a rough moodboard description into a structured visual prompt.

## 6) Notes
- This skill includes hardening guards for prompt-injection, secret exfiltration, and high-risk harmful requests.
- If a request is blocked, rewrite it as a safe high-level task and retry.
