#!/usr/bin/env node
"use strict";

const {
  safeText,
  normalizeLanguage,
  resolveMode,
  extractKeywords,
  chooseStyle,
  bullet,
  sentence,
  pack,
  guardRequest,
  buildRefusalResponse
} = require("../../shared/runtime/creative-utils");

const SKILL = "gemini-visual-director";
const DEFAULT_MODE = "generation";

const STYLE_SET = [
  {
    name: "Documentary Naturalism",
    keywords: ["documentary", "natural", "real", "紀實", "自然", "真實"]
  },
  {
    name: "Cinematic Surreal",
    keywords: ["dream", "surreal", "poetic", "超現實", "夢境", "詩意"]
  },
  {
    name: "Commercial Minimal",
    keywords: ["clean", "minimal", "product", "極簡", "產品", "俐落"]
  },
  {
    name: "Future Editorial",
    keywords: ["future", "tech", "editorial", "未來", "科技", "時尚"]
  }
];

function text(zh, en, language) {
  return language === "zh-TW" ? zh : en;
}

function run(input = {}) {
  const language = normalizeLanguage(input.language);
  const mode = resolveMode(input.mode, DEFAULT_MODE);
  const request = safeText(input.user_request);
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

  const concept = sentence(
    request,
    text("一個能量場中的角色與城市互動，呈現未來感與情感張力。", "A character interacts with a citywide energy field, balancing futurism and emotional tension.", language)
  );
  const subject = sentence(ctx.subject, text("單一主角", "single protagonist", language));
  const scene = sentence(ctx.scene, text("多層次城市空間", "multi-layered urban environment", language));
  const outputType = sentence(ctx.output_type, text("圖像與短片皆可", "compatible with both image and video", language));

  const keywords = extractKeywords(`${concept} ${subject} ${scene}`);
  const style = chooseStyle(STYLE_SET, keywords).name;

  const brief = [
    `# ${text("視覺導演摘要", "Visual Direction Brief", language)}`,
    bullet([
      `${text("核心概念", "Core concept", language)}: ${concept}`,
      `${text("主體", "Subject", language)}: ${subject}`,
      `${text("場景", "Scene", language)}: ${scene}`,
      `${text("風格", "Style", language)}: ${style}`,
      `${text("輸出型態", "Output type", language)}: ${outputType}`
    ])
  ].join("\n");

  const geminiPrompt = [
    "# Gemini Prompt",
    text(
      `請扮演視覺導演，將以下概念延展為具有清楚主體、空間、光線與情緒層次的畫面敘事：${concept}。請分別給出 baseline 與 stylized 兩版，並保持描述可直接轉成圖像或短片生成提示詞。`,
      `Act as a visual director and expand this concept into a scene narrative with explicit subject, spatial layout, lighting logic, and emotional arc: ${concept}. Provide both baseline and stylized versions, each directly transferable to image or short-video generation prompts.`,
      language
    )
  ].join("\n");

  const imagenPrompt = [
    "# Imagen Prompt",
    text(
      `${subject} in ${scene}, ${style} style, precise composition, foreground-midground-background separation, cinematic key light with controlled fill, material texture fidelity, intentional color contrast, expressive but realistic motion cues, high detail, clean subject silhouette, no conflicting objects, production-grade render quality.`,
      `${subject} in ${scene}, ${style} style, precise composition, foreground-midground-background separation, cinematic key light with controlled fill, material texture fidelity, intentional color contrast, expressive yet realistic motion cues, high detail, clean subject silhouette, no conflicting objects, production-grade render quality.`,
      language
    )
  ].join("\n");

  const variants = bullet([
    text("Baseline 版本：降低風格強度，提高跨模型穩定性。", "Baseline: lower style intensity for higher cross-model stability.", language),
    text("Stylized 版本：提高色彩與光影張力，強化辨識度。", "Stylized: increase color and lighting tension for stronger signature.", language)
  ]);

  const assumptions = [
    text("未提供明確模型版本，採 Gemini/Imagen 通用語義策略。", "No specific model version provided; using Gemini/Imagen-compatible semantic strategy.", language),
    text("未指定輸出比例，預設中性構圖可轉換多比例。", "No fixed aspect ratio provided; using composition adaptable to multiple ratios.", language)
  ];

  const risks = [
    text("若概念抽象度過高，可能需一輪補充細節才能穩定輸出。", "Highly abstract concepts may require one refinement pass for stable outputs.", language),
    text("過多風格詞彙會增加模型衝突風險。", "Excessive style adjectives may increase model conflict risk.", language)
  ];

  const nextActions = [
    text("提供 1-2 張參考圖作為構圖對齊。", "Provide 1-2 reference images for composition alignment.", language),
    text("確認輸出比例與最終用途。", "Confirm target aspect ratio and final use case.", language),
    text("指定要優先優化的模型端。", "Specify which model endpoint to prioritize.", language)
  ];

  const summary = text(
    `已完成 ${style} 方向的 Gemini/Imagen 雙格式提示詞與變體策略。`,
    `Completed ${style}-oriented Gemini and Imagen prompt formats with variant strategy.`,
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "brief", content: brief },
      { type: "prompt", content: geminiPrompt },
      { type: "prompt", content: imagenPrompt },
      { type: "checklist", content: variants }
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
