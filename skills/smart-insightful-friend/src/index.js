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
  buildPerspectiveRows,
  buildPlainExplain
} = require("../../shared/runtime/reasoning-utils");

const SKILL = "smart-insightful-friend";
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

  const topic = sentence(
    input.user_request,
    text("AI 對工作型態的改變", "how AI is changing work patterns", language)
  );
  const audienceLevel = sentence(ctx.audience_level, text("一般讀者", "general audience", language));
  const horizon = sentence(ctx.horizon, text("未來 12-24 個月", "next 12-24 months", language));

  const brief = [
    `# ${text("白話摘要", "Plain-Language Summary", language)}`,
    bullet([
      `${text("主題", "Topic", language)}: ${topic}`,
      `${text("對象", "Audience", language)}: ${audienceLevel}`,
      `${text("時間範圍", "Horizon", language)}: ${horizon}`
    ]),
    "",
    buildPlainExplain(topic, language)
  ].join("\n");

  const perspectiveTable = table(
    [text("視角", "Lens", language), text("重點", "Core Signal", language), text("盲點", "Blind Spot", language)],
    buildPerspectiveRows(topic, language)
  );

  const implicationPlan = bullet([
    text("短期：先觀察規則與成本結構如何改變。", "Short term: track rule and cost-structure changes.", language),
    text("中期：檢查哪些能力或流程正在被重新定價。", "Mid term: identify capabilities being repriced.", language),
    text("長期：評估制度與人才分配是否形成新常態。", "Long term: evaluate institutional and talent reallocation into a new normal.", language)
  ]);

  const checklist = bullet([
    text("我是否同時看到了受益者與受損者？", "Did I account for both winners and losers?", language),
    text("哪些判斷是事實，哪些是推論？", "Which claims are facts versus inferences?", language),
    text("什麼新證據會讓我改變結論？", "What new evidence would change this conclusion?", language)
  ]);

  const assumptions = [
    text("未啟用即時資料查詢，採通用趨勢分析框架。", "No live data lookup enabled; using general trend-analysis framework.", language),
    text("未提供特定地區法規細節，政策判斷保留彈性。", "No region-specific regulatory detail provided; policy conclusions remain conditional.", language)
  ];

  const risks = [
    text("若事件高度時效，缺乏即時資料會降低準確性。", "For fast-moving events, lack of live data may reduce accuracy.", language),
    text("單一視角輸入可能造成結論偏差。", "Single-perspective input may bias conclusions.", language)
  ];

  const nextActions = [
    text("若需要高時效，加入最新資料來源再更新判斷。", "If timeliness matters, add current sources and refresh the analysis.", language),
    text("指定地區或產業以縮小推論範圍。", "Specify region/industry to narrow inference scope.", language),
    text("提供反方觀點以進行對照。", "Provide counter-arguments for contrast testing.", language)
  ];

  const summary = text(
    "已用白話、多視角與可行含義三層結構完成主題解析。",
    "Delivered a plain-language, multi-lens analysis with practical implications.",
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "brief", content: brief },
      { type: "table", content: perspectiveTable },
      { type: "plan", content: implicationPlan },
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
