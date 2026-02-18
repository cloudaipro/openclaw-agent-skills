#!/usr/bin/env node
"use strict";

const {
  normalizeLanguage,
  resolveMode,
  asList,
  topKeywords,
  bullet,
  table,
  sentence,
  pack,
  guardRequest,
  buildRefusalResponse
} = require("../../shared/runtime/ops-utils");

const SKILL = "course-producer";
const DEFAULT_MODE = "planning";

function text(zh, en, language) {
  return language === "zh-TW" ? zh : en;
}

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

  const topic = sentence(ctx.topic, text("專業技能主題", "professional skill topic", language));
  const audience = sentence(ctx.audience, text("入門到中階學習者", "beginner-to-intermediate learners", language));
  const outcome = sentence(ctx.outcome, text("在 6 週內完成可展示成果", "ship a demonstrable outcome in 6 weeks", language));
  const format = sentence(ctx.format, text("線上混合式", "online blended", language));
  const launchWindow = sentence(ctx.launch_window, text("8 週", "8 weeks", language));

  const keywords = topKeywords(`${input.user_request || ""} ${topic} ${audience} ${outcome}`);

  const brief = [
    `# ${text("課程產品架構", "Course Product Architecture", language)}`,
    bullet([
      `${text("主題", "Topic", language)}: ${topic}`,
      `${text("目標學員", "Learner profile", language)}: ${audience}`,
      `${text("學習成果", "Outcome", language)}: ${outcome}`,
      `${text("交付形式", "Delivery format", language)}: ${format}`,
      `${text("啟動窗口", "Launch window", language)}: ${launchWindow}`
    ])
  ].join("\n");

  const moduleTable = table(
    [text("模組", "Module", language), text("學習目標", "Goal", language), text("產出", "Artifact", language)],
    [
      ["M1", text("基礎框架與術語", "Foundations and vocabulary", language), text("定位與目標文件", "positioning brief", language)],
      ["M2", text("核心方法拆解", "Core method breakdown", language), text("操作清單", "execution checklist", language)],
      ["M3", text("案例實作", "Guided case implementation", language), text("案例作業", "case assignment", language)],
      ["M4", text("錯誤診斷與優化", "Diagnosis and optimization", language), text("優化報告", "optimization report", language)],
      ["M5", text("實戰專題", "Capstone project", language), text("最終成果包", "final project pack", language)],
      ["M6", text("上線與持續迭代", "Launch and iteration", language), text("90 天行動計畫", "90-day plan", language)]
    ]
  );

  const funnelPlan = bullet([
    text("免費內容：短影片與清單型內容導流。", "Free content: short-form clips and checklist lead-in.", language),
    text("入門課：低門檻快速成果，建立信任。", "Entry product: low-friction fast-win transformation.", language),
    text("核心課：完整方法論與案例落地。", "Core offer: full methodology and implementation.", language),
    text("進階服務：社群、諮詢或顧問方案。", "Advanced offer: community, mentoring, or consulting.", language),
    text("私域經營：電子報與週報持續回流。", "Retention loop: newsletter and weekly nurture cycle.", language)
  ]);

  const checklist = bullet([
    text("每模組至少一個可評估成果。", "Each module must have at least one assessable artifact.", language),
    text("定義轉換指標：名單、出席、完課、升級。", "Define conversion KPIs: leads, attendance, completion, upgrade.", language),
    text("確認內容版權與素材授權。", "Confirm content copyright and asset licensing.", language)
  ]);

  const assumptions = [
    text("未提供既有名單規模，預設從冷啟動設計。", "No existing list size provided; designed for cold-start funnel.", language),
    text("未提供預算，採中等成本內容節奏。", "Budget not provided; using moderate-cost content cadence.", language)
  ];

  const risks = [
    text("主題定位過廣會降低課程完成率。", "Over-broad topic positioning may reduce completion rate.", language),
    text("若缺少回饋機制，學員留存將下降。", "Retention may decline without structured feedback loops.", language)
  ];

  const nextActions = [
    text("確認主打轉換成果與案例形式。", "Confirm flagship transformation promise and case format.", language),
    text("提供目標價位區間與資源上限。", "Provide pricing band and resource constraints.", language),
    text("決定首波獲客渠道優先順序。", "Choose primary acquisition channels for launch wave one.", language)
  ];

  const summary = text(
    `已完成 ${topic} 的課程架構、模組設計與漏斗閉環規劃。`,
    `Completed curriculum architecture, module design, and full-funnel plan for ${topic}.`,
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "brief", content: brief },
      { type: "table", content: moduleTable },
      { type: "plan", content: funnelPlan },
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
