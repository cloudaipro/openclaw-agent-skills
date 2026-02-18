#!/usr/bin/env node
"use strict";

const {
  safeText,
  normalizeLanguage,
  resolveMode,
  extractKeywords,
  bullet,
  table,
  sentence,
  pack,
  guardRequest,
  buildRefusalResponse
} = require("./creative-utils");

function text(zh, en, language) {
  return language === "zh-TW" ? zh : en;
}

function buildPerspectiveRows(topic, language) {
  const lower = safeText(topic).toLowerCase();
  const isPolicy = /policy|regulation|政府|法規|地緣|geopolit/.test(lower);
  const isTech = /ai|model|agent|automation|科技|人工智慧/.test(lower);
  const isMarket = /market|growth|revenue|product|市場|營收|產品/.test(lower);

  const base = [
    [text("技術視角", "Technical Lens", language), text("可行性與效能瓶頸", "Feasibility and performance bottlenecks", language), text("忽略採用成本", "May underweight adoption cost", language)],
    [text("商業視角", "Business Lens", language), text("價值捕捉與分配", "Value capture and distribution", language), text("可能忽略外部性", "May overlook externalities", language)],
    [text("社會視角", "Societal Lens", language), text("受益者與受損者結構", "Winners and losers structure", language), text("量化證據可能不足", "Quant evidence may be sparse", language)],
    [text("策略視角", "Strategic Lens", language), text("時間窗與槓桿點", "Timing windows and leverage points", language), text("執行依賴多方協調", "Execution depends on coordination", language)]
  ];

  if (isPolicy) {
    base.push([
      text("政策視角", "Policy Lens", language),
      text("監管邏輯與制度邊界", "Regulatory logic and institutional boundaries", language),
      text("政策時滯影響判斷", "Policy lag can distort timing", language)
    ]);
  }

  if (isTech) {
    base.push([
      text("模型風險視角", "Model Risk Lens", language),
      text("資料偏誤與可靠性風險", "Data bias and reliability risk", language),
      text("過度樂觀可能放大誤判", "Over-optimism can amplify misjudgment", language)
    ]);
  }

  if (isMarket) {
    base.push([
      text("競爭視角", "Competitive Lens", language),
      text("差異化與替代威脅", "Differentiation and substitution threats", language),
      text("短期指標掩蓋長期風險", "Short-term metrics can hide long-term risk", language)
    ]);
  }

  return base;
}

function buildPlainExplain(topic, language) {
  return bullet([
    text(`你可以把「${topic}」想成一個會同時改變規則、成本與行為的系統。`, `Think of "${topic}" as a system that changes rules, costs, and behaviors at once.`, language),
    text("短期常見的是效率提升與摩擦下降。", "In the short term, efficiency gains and reduced friction are common.", language),
    text("中期差異來自誰能更快調整流程與能力。", "Mid-term divergence comes from who adapts workflows and capabilities faster.", language),
    text("長期結果取決於制度、人才與資本如何重新分配。", "Long-term outcomes depend on how institutions, talent, and capital get reallocated.", language)
  ]);
}

function buildDeconstruction(topic, language) {
  return {
    anatomy: bullet([
      text(`表層現象：${topic} 被描述為單一問題。`, `Surface view: ${topic} is framed as a single problem.`, language),
      text("中層機制：激勵、資訊不對稱與協調成本共同作用。", "Mid-layer mechanism: incentives, information asymmetry, and coordination costs interact.", language),
      text("底層驅動：地位競逐、風險轉嫁、路徑依賴。", "Deep drivers: status competition, risk transfer, and path dependency.", language)
    ]),
    intervention: bullet([
      text("先改變回饋迴路，再改變口號。", "Change feedback loops before changing slogans.", language),
      text("以小範圍低風險試點建立可複製證據。", "Run low-risk pilots to build replicable evidence.", language),
      text("把責任、成本與收益綁定到同一決策節點。", "Bind accountability, cost, and upside to the same decision node.", language)
    ])
  };
}

function kebab(value) {
  return safeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "new-skill";
}

function titleCase(value) {
  return kebab(value)
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildSkillDraft(skillName, problem, language) {
  const slug = kebab(skillName);
  const title = titleCase(skillName);
  const desc = text(
    `面向「${problem}」場景的專用技能，提供可重複的工作流、明確觸發條件與可驗證輸出。`,
    `Specialized skill for "${problem}" workflows with explicit triggers and verifiable outputs.`,
    language
  );

  return {
    slug,
    title,
    skillMd: [
      "---",
      `name: ${slug}`,
      `description: ${desc}`,
      "---",
      "",
      `# ${title}`,
      "",
      "## Objective",
      text("提供可重複執行且可驗證品質的技能工作流。", "Provide repeatable, quality-verifiable execution workflows.", language),
      "",
      "## Inputs",
      text("- Required: 任務目標、限制條件。", "- Required: task objective and constraints.", language),
      text("- Optional: 參考資料、工具偏好。", "- Optional: references and tool preferences.", language),
      "",
      "## Output Schema",
      text("使用通用 envelope，包含 summary/artifacts/assumptions/risks/next_actions。", "Use universal envelope with summary/artifacts/assumptions/risks/next_actions.", language),
      "",
      "## Workflow",
      "1. Parse request and classify scope.",
      "2. Gather missing constraints.",
      "3. Generate structured outputs.",
      "4. Validate safety and completeness.",
      "5. Return final envelope.",
      "",
      "## Safety Rules",
      "- Apply least-privilege behavior.",
      "- Refuse unsafe requests.",
      "- Mark uncertainty explicitly."
    ].join("\n")
  };
}

module.exports = {
  safeText,
  normalizeLanguage,
  resolveMode,
  extractKeywords,
  bullet,
  table,
  sentence,
  pack,
  guardRequest,
  buildRefusalResponse,
  text,
  buildPerspectiveRows,
  buildPlainExplain,
  buildDeconstruction,
  kebab,
  titleCase,
  buildSkillDraft
};
