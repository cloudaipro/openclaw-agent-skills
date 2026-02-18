#!/usr/bin/env node
"use strict";

const {
  normalizeLanguage,
  resolveMode,
  sentence,
  bullet,
  table,
  pack,
  guardRequest,
  buildRefusalResponse,
  text,
  buildSkillDraft,
  kebab,
  titleCase
} = require("../../shared/runtime/reasoning-utils");

const SKILL = "ai-architect";
const DEFAULT_MODE = "generation";

function run(input = {}) {
  const language = normalizeLanguage(input.language);
  const mode = resolveMode(input.mode, DEFAULT_MODE);
  const ctx = input.context || {};

  const guard = guardRequest(input, ctx);
  if (guard.blocked) {
    return buildRefusalResponse({
      skill: SKILL,
      language,
      mode,
      reason: guard.reason,
      category: guard.category
    });
  }

  const purpose = sentence(
    input.user_request,
    text("建立一個可重複執行的技能", "create a repeatable agent skill", language)
  );
  const requestedName = sentence(ctx.skill_name, text("new-skill", "new-skill", language));
  const candidateName = requestedName === "new-skill" ? kebab(purpose.split(" ").slice(0, 6).join("-")) : kebab(requestedName);
  const displayName = titleCase(candidateName);
  const permission = sentence(ctx.permission_profile, "read");
  const defaultMode = sentence(ctx.default_mode, "analysis");

  const draft = buildSkillDraft(candidateName, purpose, language);

  const brief = [
    `# ${text("技能架構摘要", "Skill Architecture Brief", language)}`,
    bullet([
      `${text("技能名稱", "Skill name", language)}: ${candidateName}`,
      `${text("顯示名稱", "Display name", language)}: ${displayName}`,
      `${text("目的", "Purpose", language)}: ${purpose}`,
      `${text("權限建議", "Permission recommendation", language)}: ${permission}`,
      `${text("預設模式", "Default mode", language)}: ${defaultMode}`
    ])
  ].join("\n");

  const matrix = table(
    [text("區塊", "Section", language), text("內容", "Content", language), text("完成標準", "Done Criteria", language)],
    [
      ["Triggers", text("正向與反向觸發規則", "Positive and negative trigger rules", language), text("可與鄰近技能明確區分", "Clear disambiguation from neighboring skills", language)],
      ["IO Contract", text("輸入/輸出 schema", "Input/output schema", language), text("能通過 envelope 驗證", "Passes envelope validation", language)],
      ["Resources", text("scripts/references/assets 規劃", "scripts/references/assets planning", language), text("只保留必要資源", "Only required resources included", language)],
      ["Safety", text("權限與拒絕規則", "Permission and refusal rules", language), text("最小權限原則", "Least-privilege default", language)]
    ]
  );

  const scaffoldPlan = [
    "# SKILL.md Draft",
    draft.skillMd,
    "",
    "# manifest.yaml (starter)",
    [
      "version: 0.1.0",
      `name: ${candidateName}`,
      `title: \"${displayName}\"`,
      `entrypoint: src/index.js`,
      `permission_profile: ${permission}`,
      `default_mode: ${defaultMode}`
    ].join("\n")
  ].join("\n");

  const checklist = bullet([
    text("先做 trigger precision 測試再上線。", "Run trigger precision tests before release.", language),
    text("先跑 smoke test 與 schema 驗證。", "Run smoke tests and schema validation first.", language),
    text("若涉及 write 權限，加入明確人工批准節點。", "If write permissions are required, add explicit human-approval gates.", language)
  ]);

  const assumptions = [
    text("未提供完整業務上下文，先產出通用技能骨架。", "Full business context was not provided; generated a general skill skeleton.", language),
    text("權限預設以保守最小權限為原則。", "Permission defaults follow conservative least-privilege behavior.", language)
  ];

  const risks = [
    text("若觸發規則過寬，技能容易誤觸發。", "Over-broad trigger rules may cause accidental invocation.", language),
    text("缺少實測樣本會導致品質波動。", "Without evaluation samples, quality may drift.", language)
  ];

  const nextActions = [
    text("補充 15+ 正向與 10+ 反向觸發樣本。", "Add 15+ positive and 10+ negative trigger examples.", language),
    text("確認最終權限模型與工具清單。", "Confirm final permission model and tool list.", language),
    text("建立回歸測試資料集。", "Create a regression test dataset.", language)
  ];

  const summary = text(
    `已生成 ${candidateName} 的技能架構、規格矩陣與可編輯草稿。`,
    `Generated architecture brief, spec matrix, and editable scaffold draft for ${candidateName}.`,
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "brief", content: brief },
      { type: "table", content: matrix },
      { type: "plan", content: scaffoldPlan },
      { type: "checklist", content: checklist }
    ],
    assumptions,
    risks,
    nextActions
  );
}

if (require.main === module) {
  let raw = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    raw += chunk;
  });
  process.stdin.on("end", () => {
    const input = raw.trim() ? JSON.parse(raw) : {};
    process.stdout.write(JSON.stringify(run(input), null, 2));
  });
}

module.exports = { run };
