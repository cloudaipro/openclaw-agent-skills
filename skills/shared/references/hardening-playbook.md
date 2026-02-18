# Phase 4 Hardening Playbook

## Datasets
- `shared/hardening/datasets/regression_cases.jsonl`
- `shared/hardening/datasets/prompt_injection_cases.jsonl`
- `shared/hardening/datasets/red_team_prompts.jsonl`

## Runner
Use:

```bash
python3 shared/scripts/run_hardening_suite.py
```

## Pass Criteria
- Envelope keys present.
- Required artifact types present for regression cases.
- Refusal behavior activates for injection and high-risk red-team prompts.
- Forbidden pattern checks pass.

## Report
Latest report is written to:
- `shared/hardening/reports/latest_hardening_report.json`
