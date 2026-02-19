# OpenClaw Agent Skills (13 Skills)

Production-ready Codex/OpenClaw skill pack with:
- 13 agent skills
- shared runtime helpers
- hardening suite (regression + prompt-injection + red-team)
- per-skill user guides

## Repository Layout

```text
skills/
  <13-skill-folders>/
  shared/
guides/
  README.md
  <13 guide markdown files>
docs-proposal.md
```

## Included Skills

1. ad-director
2. film-director
3. kitchen-commander
4. course-producer
5. executive-assistant
6. eisenhower-priority-ai
7. ai-architect
8. action-master-kinetic-director
9. seedance-screenwriter
10. gemini-visual-director
11. audience-profiler
12. smart-insightful-friend
13. deconstruction-master

## Quick Install (Into Another OpenClaw Project)

```bash
# from this repo root
TARGET_PROJECT="/path/to/your-openclaw-project"
mkdir -p "$TARGET_PROJECT/skills"
cp -R skills/* "$TARGET_PROJECT/skills/"
```

## How to Use These Skills in Codex or Claude

### A) Codex

Install directly into your Codex skills directory:

```bash
python3 /Users/alex/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo cloudaipro/openclaw-agent-skills \
  --path skills/ad-director \
         skills/film-director \
         skills/kitchen-commander \
         skills/course-producer \
         skills/executive-assistant \
         skills/eisenhower-priority-ai \
         skills/ai-architect \
         skills/action-master-kinetic-director \
         skills/seedance-screenwriter \
         skills/gemini-visual-director \
         skills/audience-profiler \
         skills/smart-insightful-friend \
         skills/deconstruction-master
```

Then:
1. Restart Codex so new skills are loaded.
2. Trigger by name in prompt, e.g.:
   - `Use $ad-director. Build a 30-second launch campaign for ...`
   - `Use $eisenhower-priority-ai. Prioritize this backlog ...`
   - `Use $ai-architect. Draft a new SKILL.md for ...`

### B) Claude

Claude does not auto-install Codex `SKILL.md` folders as native skills, so use the same content as project instructions/templates:

1. Open the skill folder you want under `skills/<skill-id>/`.
2. Copy `SKILL.md` into your Claude project/system instruction context.
3. If needed, also provide `references/domain.md` for deeper behavior.
4. Start prompt with explicit role routing, e.g.:
   - `Act as ad-director. Build a 30-second campaign brief with shot list and prompt pack.`
   - `Act as deconstruction-master. Break this issue into root drivers and intervention steps.`

For repeatable Claude workflows, keep each selected `SKILL.md` as a reusable prompt template in your Claude project.

## Run Hardening Suite

```bash
python3 skills/shared/scripts/run_hardening_suite.py
```

Expected report:
- `skills/shared/hardening/reports/latest_hardening_report.json`

## Use a Skill Locally

```bash
cat > /tmp/skill-input.json <<'JSON'
{
  "user_request": "Create a campaign concept for a smart watch launch",
  "language": "en",
  "context": {
    "brand": "PulseX",
    "product": "PulseX Watch Pro",
    "objective": "Increase pre-orders"
  }
}
JSON

node skills/ad-director/src/index.js < /tmp/skill-input.json
```

## User Guides

See `guides/README.md` and the 13 per-skill guides.
