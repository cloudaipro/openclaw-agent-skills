# OpenClaw: Proposal to Implement 13 Agent Skills with Codex Skills

## Scope analyzed from the two images
The 13 skill definitions appear to be:
1. `ad-director` (廣告總監)
2. `film-director` (電影導演)
3. `kitchen-commander` (廚房指揮官)
4. `course-producer` (課程製作人)
5. `executive-assistant` (高階行政助理)
6. `eisenhower-priority-ai` (艾森豪優先順序 AI)
7. `ai-architect` (AI 架構師)
8. `action-master-kinetic-director` (動作大師動能導演)
9. `seedance-screenwriter` (seedance-編劇)
10. `gemini-visual-director` (Gemini 視覺導演)
11. `audience-profiler` (受眾分析工具)
12. `smart-insightful-friend` (聰慧且具洞察力的朋友)
13. `deconstruction-master` (解構大師)

Note: names/descriptions were extracted via OCR from screenshots and may contain minor OCR noise.

## Core strategy
Use a **dual-compatible skill architecture**:
1. Author each skill primarily as a **Codex Skill** (`SKILL.md` + optional `scripts/`, `references/`, `assets/`, `agents/openai.yaml`).
2. Generate an **OpenClaw runtime wrapper** per skill (`manifest.yaml` + `src/index.(js|py)` + `config.example.yaml`) so the same logic can run in OpenClaw channels.

This gives:
- Better prompt quality and reuse in Codex authoring workflows.
- Reliable execution contracts for OpenClaw via schema-based manifests.
- Clear permission/security boundaries per skill in OpenClaw.

## Repository layout proposal
```text
.agents/skills/
  shared/
    references/
      cinematic-language.md
      prompt-qa-checklist.md
      safety-policy.md
      output-schemas.md
    scripts/
      validate_prompt_pack.py
      score_trigger_precision.py
      lint_skill_metadata.py
  ad-director/
  film-director/
  kitchen-commander/
  course-producer/
  executive-assistant/
  eisenhower-priority-ai/
  ai-architect/
  action-master-kinetic-director/
  seedance-screenwriter/
  gemini-visual-director/
  audience-profiler/
  smart-insightful-friend/
  deconstruction-master/

openclaw-skills/
  ad-director/
    SKILL.md
    manifest.yaml
    src/index.js
    config.example.yaml
  ... (13 skills)
```

## Skill template to use for all 13
Each skill should implement this minimum contract:

1. `SKILL.md` frontmatter
- `name`: exact slug (hyphen-case)
- `description`: explicit trigger boundaries (what to use and not use)

2. `SKILL.md` body sections
- Objective
- Inputs required / optional
- Output schema (strict JSON fields)
- Step-by-step workflow
- Safety and refusal policy
- Failure fallback and clarification questions

3. `references/`
- Domain framework (e.g., ad storyboard grammar, VMCA prompt frames, Eisenhower rules)
- Few-shot examples (zh-TW and en)
- Model-specific notes (Gemini/Imagen, Runway/Sora/Luma)

4. `scripts/` (only where deterministic behavior helps)
- Prompt normalization / keyword expansion
- Schema validator
- Quality scorer (coverage, camera language, brand consistency)

5. `agents/openai.yaml`
- UI metadata (`display_name`, `short_description`, `default_prompt`)
- Invocation policy (`allow_implicit_invocation` true/false)
- Dependency declarations (MCP/tool metadata)

6. OpenClaw wrapper
- `manifest.yaml` with strict input/output schemas
- runtime entry point for post-processing and guardrails
- `config.example.yaml` for provider/model defaults

## Per-skill implementation blueprint
| Skill | Main output contract | Required references | Required scripts | OpenClaw permission profile |
|---|---|---|---|---|
| `ad-director` | Ad creative brief + shot list + prompt pack | ad strategy, brand voice, cinematic ad style | prompt pack validator | `read` (optional web trend lookup) |
| `film-director` | Film treatment + scene grammar + camera/lighting plan | film language, narrative arc patterns | scene-outline checker | `read` |
| `kitchen-commander` | Inventory-aware SOP recipe + safety notes | equipment safety, pantry substitution rules | portion/scaling calculator | `none` or `read` |
| `course-producer` | Course architecture + funnel map + launch checklist | learning design, funnel templates | curriculum structurer | `read` |
| `executive-assistant` | Daily plan + schedule actions + risk reminders | calendar/email operating policy | task normalizer + conflict detector | `write` (with human approval) |
| `eisenhower-priority-ai` | Ranked task list (50/40/5/5) + rationale | Eisenhower matrix policy | scoring and bucketing script | `read` |
| `ai-architect` | New skill spec + SKILL.md draft + optional manifests | codex skill conventions, openclaw manifest schema | skill scaffold generator | `write` |
| `action-master-kinetic-director` | Dynamic scene script (zh) + video prompts (en) | action choreography lexicon, motion camera lexicon | motion token compiler | `none` |
| `seedance-screenwriter` | VMCA-formatted high-weight zh prompt | VMCA framework and examples | VMCA formatter | `none` |
| `gemini-visual-director` | Gemini/Imagen-optimized narrative prompts | Imagen prompt patterns and safety constraints | prompt sanitizer + style expander | `none` |
| `audience-profiler` | Persona set + segmentation + journey map | market segmentation frameworks | persona consistency checker | `read` |
| `smart-insightful-friend` | Plain-language synthesis + multi-view argument | fact-check style guide, geopolitical framing | citation coverage scorer | `read` (web) |
| `deconstruction-master` | 2-step output: 解剖(分析) + 破局(策略) | systems analysis templates | argument structure checker | `none` |

## Output schema standardization
Adopt one unified envelope for all skills:
```json
{
  "skill": "string",
  "language": "zh-TW|en",
  "mode": "analysis|generation|planning|execution",
  "summary": "string",
  "artifacts": [
    {"type": "brief|prompt|plan|table|checklist", "content": "string"}
  ],
  "assumptions": ["string"],
  "risks": ["string"],
  "next_actions": ["string"]
}
```
For OpenClaw, enforce strict schema matching in `manifest.yaml` input/output.

## Trigger design (critical)
Each skill must include:
1. Positive trigger examples (at least 15, zh/en mixed).
2. Negative trigger examples (at least 10) to prevent overlap.
3. Escalation rules to neighbor skills when confidence is low.

Collision pairs to explicitly disambiguate:
- `ad-director` vs `film-director`
- `action-master-kinetic-director` vs `seedance-screenwriter`
- `executive-assistant` vs `eisenhower-priority-ai`
- `smart-insightful-friend` vs `deconstruction-master`

## Security and governance for OpenClaw deployment
1. Default least-privilege per skill; most should run with `none` or `read`.
2. Require explicit human approval for any write/execute side effects (`executive-assistant`, parts of `ai-architect`).
3. Restrict outbound domains for web-enabled skills.
4. Run evals on prompt-injection test cases before release.
5. Version lock skills (`semver`) and maintain rollback-ready releases.

## Implementation phases
### Phase 0 (Foundation, 2-3 days)
- Create shared references and shared validators.
- Define universal output schema and evaluation rubric.
- Implement skill scaffolding generator.

### Phase 1 (Creative suite, 4-6 days)
- `ad-director`, `film-director`, `action-master-kinetic-director`, `seedance-screenwriter`, `gemini-visual-director`.
- Primary KPI: prompt usefulness and style adherence.

### Phase 2 (Operations suite, 4-5 days)
- `kitchen-commander`, `course-producer`, `executive-assistant`, `eisenhower-priority-ai`, `audience-profiler`.
- Primary KPI: task/action correctness and structured outputs.

### Phase 3 (Reasoning/meta suite, 3-4 days)
- `smart-insightful-friend`, `deconstruction-master`, `ai-architect`.
- Primary KPI: reasoning quality, non-hallucinatory framing, reproducibility.

### Phase 4 (Hardening, 3-5 days)
- Red-team prompts, prompt-injection tests, regression evals.
- Permission audits and deployment checklist for OpenClaw.

## Evaluation plan (must-have)
For each skill, track:
1. Trigger precision / recall.
2. Schema validity rate.
3. Task success (human-rated).
4. Safety violations (prompt injection leakage, over-permission use).
5. Iteration cost (turns and tokens to acceptable result).

Suggested release gates:
- Trigger precision >= 0.90
- Schema validity = 1.00
- Safety critical failures = 0
- Human quality score >= 4.3/5

## Practical build order inside Codex
1. Build shared libraries and schema first.
2. Implement one exemplar skill end-to-end (`ad-director`).
3. Clone template to remaining 12 skills.
4. Add per-skill references/examples.
5. Add OpenClaw manifest/runtime wrappers.
6. Run eval harness and fix drift.
7. Publish staged rollout (internal -> beta -> production).

## Immediate next actions
1. Confirm the final 13 skill names/slugs (especially `ai-architect` spelling).
2. Approve the shared output schema.
3. Start with Phase 0 and scaffold all 13 folders in one pass.
