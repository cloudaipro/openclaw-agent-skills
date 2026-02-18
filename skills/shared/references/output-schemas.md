# Universal Skill Output Schema

All skills return the same envelope to keep OpenClaw orchestration simple.

```json
{
  "skill": "string",
  "language": "zh-TW|en",
  "mode": "analysis|generation|planning|execution",
  "summary": "string",
  "artifacts": [
    {
      "type": "brief|prompt|plan|table|checklist",
      "content": "string"
    }
  ],
  "assumptions": ["string"],
  "risks": ["string"],
  "next_actions": ["string"]
}
```

Rules:
- Always include all top-level fields.
- Keep `summary` under 120 words.
- Keep `artifacts` order stable by importance.
- Put unknowns in `assumptions`, not in fabricated facts.
