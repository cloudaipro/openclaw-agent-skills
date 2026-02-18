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
