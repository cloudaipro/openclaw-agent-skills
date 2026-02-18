#!/usr/bin/env node
"use strict";

const {
  safeText,
  normalizeLanguage,
  resolveMode,
  extractKeywords,
  chooseStyle,
  bullet,
  table,
  sentence,
  pack,
  guardRequest,
  buildRefusalResponse
} = require("../../shared/runtime/creative-utils");

const SKILL = "action-master-kinetic-director";
const DEFAULT_MODE = "generation";

const STYLE_ENGINES = [
  {
    name: "Eastern Blade",
    keywords: ["武俠", "刀", "劍", "martial", "samurai", "choreography"]
  },
  {
    name: "Grit Realism",
    keywords: ["street", "grit", "realism", "追逐", "硬派", "近戰"]
  },
  {
    name: "Grand Sci-Fi",
    keywords: ["sci", "future", "space", "科幻", "機甲", "飛行"]
  },
  {
    name: "Geometric Dance",
    keywords: ["dance", "rhythm", "geometry", "舞蹈", "節奏", "編舞"]
  }
];

function text(zh, en, language) {
  return language === "zh-TW" ? zh : en;
}

function makeToolPrompt(tool, scene, style) {
  return `${tool}: ${scene}. Style: ${style}. Emphasize readable action geography, coherent momentum arc, and cinematic camera path with clean motion continuity.`;
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

  const scenario = sentence(
    request,
    text("一名主角在高樓間追擊目標，節奏由試探升級到正面交鋒。", "A protagonist pursues a target across rooftops, escalating from probing movement to direct clash.", language)
  );
  const energy = sentence(ctx.energy, text("高張力", "high tension", language));

  const keywords = extractKeywords(`${scenario} ${energy}`);
  const style = chooseStyle(STYLE_ENGINES, keywords).name;

  const scriptZh = [
    "# 動態腳本（繁中）",
    bullet([
      `風格引擎：${style}`,
      `節奏設定：${energy}`,
      "Phase 1（定位）：快速交代場景幾何與角色相對位置。",
      "Phase 2（升壓）：加入位移、阻擋、反制，速度與鏡頭同時加快。",
      "Phase 3（峰值）：主衝突發生，動作密度最高但空間關係仍清晰。",
      "Phase 4（收束）：動能外溢後收斂，留下下一段行動鉤子。"
    ])
  ].join("\n");

  const beatTable = table(
    ["Beat", "Action", "Camera", "Tempo"],
    [
      ["1", text("建立地形與追逐方向", "Establish terrain and chase vector", language), text("高位廣角", "High wide", language), "60%"],
      ["2", text("第一次近身交錯", "First close exchange", language), text("中景跟拍", "Medium tracking", language), "75%"],
      ["3", text("障礙與反制", "Obstacle and counter", language), text("手持切換", "Handheld switch", language), "85%"],
      ["4", text("高峰衝突", "Peak collision", language), text("環繞+推進", "Orbit + push-in", language), "100%"],
      ["5", text("殘響與收束", "Residual motion and resolve", language), text("定鏡留白", "Locked frame", language), "55%"]
    ]
  );

  const promptPack = [
    "# English Prompt Pack",
    makeToolPrompt("Runway", scenario, style),
    makeToolPrompt("Kling", scenario, style),
    makeToolPrompt("Luma", scenario, style),
    makeToolPrompt("Sora", scenario, style)
  ].join("\n\n");

  const checklist = bullet([
    text("確認打鬥或追逐方向在每個 beat 都可辨識。", "Ensure direction of action is readable in every beat.", language),
    text("確認運鏡與動作速度同步，不互相打架。", "Ensure camera rhythm aligns with movement speed.", language),
    text("確認峰值段落前有足夠鋪陳。", "Ensure enough setup precedes the peak segment.", language)
  ]);

  const assumptions = [
    text("未提供演員或場景限制，採中等可執行難度。", "No cast/location constraints were provided; using moderate production complexity.", language),
    text("未指定工具時同時輸出四平台版本。", "When no tool is specified, prompts are generated for all four target platforms.", language)
  ];

  const risks = [
    text("若鏡頭切換過密，可能降低動作可讀性。", "Overly dense cuts can reduce action readability.", language),
    text("未定義安全邊界時，動作強度可能不符平台規範。", "Without safety constraints, motion intensity may not fit platform policy.", language)
  ];

  const nextActions = [
    text("提供角色數量與場景尺寸以精修動作走位。", "Provide character count and stage scale for refined blocking.", language),
    text("指定主輸出平台以優化語法。", "Specify primary output platform for syntax optimization.", language),
    text("補充禁忌鏡頭或內容限制。", "Provide disallowed shots or content constraints.", language)
  ];

  const summary = text(
    `已產出 ${style} 風格的動態腳本、節奏分鏡與四平台英文提示詞。`,
    `Produced a ${style} kinetic script, beat-level action plan, and four-platform English prompt pack.`,
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "brief", content: scriptZh },
      { type: "table", content: beatTable },
      { type: "prompt", content: promptPack },
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
