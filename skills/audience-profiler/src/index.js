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

const SKILL = "audience-profiler";
const DEFAULT_MODE = "analysis";

function text(zh, en, language) {
  return language === "zh-TW" ? zh : en;
}

function buildSegments(language, product, valueProp) {
  if (language === "zh-TW") {
    return [
      ["S1", "效率導向專業者", "節省時間與降低流程摩擦", "案例證明、ROI、可量化成果"],
      ["S2", "升級轉型探索者", "希望快速跨越能力門檻", "清楚路徑、同儕見證、可複製方法"],
      ["S3", "預算敏感實用派", "追求高性價比與低風險試用", "入門方案、保守承諾、分階段採用"]
    ];
  }

  return [
    ["S1", "Efficiency Professionals", "save time and reduce workflow friction", "proof cases, ROI, measurable outcomes"],
    ["S2", "Transformation Seekers", "cross skill threshold quickly", "clear path, peer evidence, repeatable method"],
    ["S3", "Budget-Conscious Pragmatists", "maximize value with low risk", "entry offer, conservative promise, phased adoption"]
  ];
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

  const product = sentence(ctx.product, text("未命名產品", "unnamed product", language));
  const brand = sentence(ctx.brand, text("未命名品牌", "unnamed brand", language));
  const valueProp = sentence(ctx.value_prop, text("更快達成成果", "faster path to outcomes", language));
  const market = sentence(ctx.market, text("一般市場", "general market", language));
  const channels = asList(ctx.channels || "");

  const keywords = topKeywords(`${input.user_request || ""} ${product} ${valueProp} ${market}`);
  const segments = buildSegments(language, product, valueProp);

  const brief = [
    `# ${text("受眾洞察摘要", "Audience Insight Brief", language)}`,
    bullet([
      `${text("品牌", "Brand", language)}: ${brand}`,
      `${text("產品", "Product", language)}: ${product}`,
      `${text("價值主張", "Value proposition", language)}: ${valueProp}`,
      `${text("市場範圍", "Market", language)}: ${market}`,
      `${text("關鍵詞", "Signal keywords", language)}: ${keywords.join(", ") || text("未擷取到", "none extracted", language)}`
    ])
  ].join("\n");

  const personaTable = table(
    [text("分群", "Segment", language), text("角色", "Persona", language), text("核心動機", "Core motivation", language), text("轉換訊號", "Conversion signal", language)],
    segments
  );

  const journeyPlan = bullet([
    text("Awareness：用問題導向內容讓受眾辨識痛點。", "Awareness: problem-led content to help audience name their pain.", language),
    text("Consideration：用比較框架凸顯差異化價值。", "Consideration: comparative framing to highlight differentiation.", language),
    text("Evaluation：提供案例、試用或試聽降低不確定。", "Evaluation: proof assets and trial formats to reduce uncertainty.", language),
    text("Purchase：給明確 CTA 與風險可控方案。", "Purchase: clear CTA and risk-controlled offer structure.", language),
    text("Retention：用週期回訪內容驅動複購與推薦。", "Retention: recurring value loops for repeat and referral.", language)
  ]);

  const checklist = bullet([
    text("每個分群都要有可執行訊息角度。", "Each segment must map to an executable messaging angle.", language),
    text("避免僅用年齡性別做表層分類。", "Avoid demographic-only shallow segmentation.", language),
    text("先小樣本驗證再擴大投放。", "Validate with small samples before scale.", language)
  ]);

  const assumptions = [
    text("缺少真實客戶訪談資料，採假設型 persona。", "Real interview data was missing; personas are hypothesis-driven.", language),
    text("若未提供渠道，採通用數位渠道策略。", "Without channel constraints, a general digital channel strategy is assumed.", language)
  ];

  const risks = [
    text("若價值主張不清晰，分群差異會收斂。", "Weak value proposition may collapse segment differentiation.", language),
    text("未驗證訊息角度前直接放大預算風險高。", "Scaling spend before message validation carries high risk.", language)
  ];

  const nextActions = [
    text("蒐集 8-12 份目標客群訪談。", "Collect 8-12 target-customer interviews.", language),
    text("針對三分群各跑一組訊息 A/B 測試。", "Run one messaging A/B test per segment.", language),
    text("補充實際渠道成本與轉換基準。", "Add channel cost and baseline conversion benchmarks.", language)
  ];

  const summary = text(
    `已為 ${product} 產出三層受眾分群、persona 與決策旅程策略。`,
    `Produced three-level segmentation, personas, and decision journey strategy for ${product}.`,
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "brief", content: brief },
      { type: "table", content: personaTable },
      { type: "plan", content: journeyPlan },
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
