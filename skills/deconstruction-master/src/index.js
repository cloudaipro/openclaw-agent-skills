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
  buildDeconstruction
} = require("../../shared/runtime/reasoning-utils");

const SKILL = "deconstruction-master";
const DEFAULT_MODE = "analysis";

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

  const issue = sentence(
    input.user_request,
    text("組織內協作效率持續下降", "persistent decline in team coordination efficiency", language)
  );
  const constraints = sentence(ctx.constraints, text("資源有限且時程緊", "limited resources and tight timeline", language));

  const decon = buildDeconstruction(issue, language);

  const analysisBrief = [
    `# ${text("解剖（分析）", "Decomposition (Analysis)", language)}`,
    bullet([
      `${text("議題", "Issue", language)}: ${issue}`,
      `${text("限制", "Constraints", language)}: ${constraints}`
    ]),
    "",
    decon.anatomy
  ].join("\n");

  const driverTable = table(
    [text("層級", "Layer", language), text("關鍵驅動", "Driver", language), text("可觀測指標", "Observable Signal", language), text("可動槓桿", "Leverage", language)],
    [
      [text("表層", "Surface", language), text("敘事與情緒失真", "Narrative and sentiment distortion", language), text("會議抱怨頻率上升", "Higher complaint density in meetings", language), text("統一問題定義", "Standardize problem framing", language)],
      [text("中層", "Mid", language), text("激勵不一致與協調成本", "Incentive mismatch and coordination cost", language), text("跨部門延遲增加", "Cross-team latency growth", language), text("重設回饋節奏", "Reset feedback cadence", language)],
      [text("底層", "Deep", language), text("責任與收益脫鉤", "Accountability and upside decoupling", language), text("關鍵任務無明確 owner", "Critical work lacks clear owners", language), text("綁定 owner 與結果", "Bind ownership to outcome", language)]
    ]
  );

  const interventionPlan = [
    `# ${text("破局（方法）", "Breakthrough (Intervention)", language)}`,
    bullet([
      text("第 1 週：選一條高痛點流程做小型試點，量測延遲與返工率。", "Week 1: run a high-pain pilot and measure latency plus rework.", language),
      text("第 2-3 週：把責任、決策權與回饋週期綁在同一節點。", "Weeks 2-3: bind accountability, authority, and review cadence to the same node.", language),
      text("第 4 週：擴展到相鄰流程，保留回滾機制。", "Week 4: expand to adjacent workflows with rollback conditions.", language)
    ])
  ].join("\n");

  const checklist = bullet([
    text("每一步都應有可觀測指標與停損條件。", "Each step needs measurable signals and stop-loss criteria.", language),
    text("先驗證低成本槓桿，再投入高成本改造。", "Validate low-cost levers before high-cost transformation.", language),
    text("避免只停留在問題敘述。", "Do not stop at diagnosis alone.", language)
  ]);

  const assumptions = [
    text("未提供完整利害關係人地圖，先採通用組織動力學。", "Stakeholder map not provided; using general organizational dynamics.", language),
    text("未提供歷史數據，指標門檻需後續校準。", "Historical baselines missing; metric thresholds require calibration.", language)
  ];

  const risks = [
    text("若管理層未對齊，試點結果難以擴散。", "Without leadership alignment, pilot outcomes may not scale.", language),
    text("過度複雜化方案會提高執行失敗率。", "Over-complex interventions increase execution failure risk.", language)
  ];

  const nextActions = [
    text("先確認一條最痛流程與 owner。", "Confirm the highest-pain workflow and owner first.", language),
    text("定義三個核心量測指標。", "Define three core metrics.", language),
    text("安排每週回顧與回滾條件。", "Set weekly review and rollback conditions.", language)
  ];

  const summary = text(
    "已完成兩段式輸出：驅動解剖與可落地破局方案。",
    "Completed two-stage output: driver decomposition and practical intervention strategy.",
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "brief", content: analysisBrief },
      { type: "table", content: driverTable },
      { type: "plan", content: interventionPlan },
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
