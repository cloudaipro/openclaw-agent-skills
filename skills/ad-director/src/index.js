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

const SKILL = "ad-director";
const DEFAULT_MODE = "generation";

const STYLE_CANDIDATES = [
  {
    name: "Premium Cinematic",
    keywords: ["luxury", "premium", "cinematic", "質感", "高級", "電影"]
  },
  {
    name: "Social Punch",
    keywords: ["tiktok", "reels", "short", "viral", "轉換", "短片"]
  },
  {
    name: "Lifestyle Warm",
    keywords: ["family", "daily", "lifestyle", "溫暖", "生活", "家庭"]
  },
  {
    name: "Future Tech",
    keywords: ["ai", "robot", "tech", "future", "科技", "未來"]
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

  const brand = sentence(ctx.brand, text("未提供品牌", "Unknown brand", language));
  const product = sentence(ctx.product, text("未提供產品", "Unknown product", language));
  const objective = sentence(
    ctx.objective,
    text("提升品牌記憶與轉換率", "Increase recall and conversion", language)
  );
  const audience = sentence(
    ctx.audience,
    text("18-35 都市數位原生族群", "Digital-native urban adults 18-35", language)
  );
  const channel = sentence(ctx.channel, text("短影音與社群廣告版位", "Short-form social placements", language));
  const duration = sentence(ctx.duration, text("30 秒", "30 seconds", language));

  const keywords = extractKeywords(`${request} ${brand} ${product} ${objective} ${audience}`);
  const style = chooseStyle(STYLE_CANDIDATES, keywords).name;

  const campaignBrief = [
    `# ${text("廣告戰役企劃", "Campaign Brief", language)}`,
    bullet([
      `${text("品牌", "Brand", language)}: ${brand}`,
      `${text("產品", "Product", language)}: ${product}`,
      `${text("核心目標", "Objective", language)}: ${objective}`,
      `${text("目標受眾", "Audience", language)}: ${audience}`,
      `${text("投放通路", "Channel", language)}: ${channel}`,
      `${text("時長", "Duration", language)}: ${duration}`,
      `${text("視覺風格", "Visual style", language)}: ${style}`
    ]),
    "",
    `## ${text("單一句點訊息", "Single-Minded Message", language)}`,
    text(
      "在第一個鉤子鏡頭清楚呈現產品價值，並於結尾給出具體 CTA。",
      "Show product value in the opening hook and end with a concrete CTA."
      , language
    )
  ].join("\n");

  const shotRows = [
    ["1", text("鉤子", "Hook", language), text("3 秒內製造衝突或驚喜", "Create tension or surprise within 3 seconds", language), text("極近景快速推入", "Fast push-in close-up", language)],
    ["2", text("痛點", "Pain Point", language), text("展示現況摩擦", "Show current friction", language), text("手持跟拍", "Handheld follow", language)],
    ["3", text("解法亮相", "Solution Reveal", language), text("產品首次登場", "First reveal of product", language), text("中景轉特寫", "Medium to close transition", language)],
    ["4", text("功能證明", "Proof", language), text("關鍵功能可視化", "Visualize key feature", language), text("慢動作與特寫切換", "Slow-motion with inserts", language)],
    ["5", text("情緒放大", "Emotional Lift", language), text("使用後狀態對比", "After-state contrast", language), text("橫移運鏡", "Lateral tracking", language)],
    ["6", text("轉換收口", "CTA", language), text("口號+行動呼籲", "Tagline + call to action", language), text("品牌鎖定鏡頭", "Locked brand hero shot", language)]
  ];

  const shotList = table(
    [
      text("鏡號", "Shot", language),
      text("目的", "Purpose", language),
      text("內容", "Content", language),
      text("攝影建議", "Camera", language)
    ],
    shotRows
  );

  const promptPack = [
    `# ${text("生成提示詞包", "Prompt Pack", language)}`,
    `## ${text("主提示詞", "Master Prompt", language)}`,
    text(
      `${brand} ${product} 商業廣告，${style} 視覺語言，${channel}，${duration}，開場強鉤子、節奏緊湊、功能證明清晰、結尾強 CTA，電影級打光，乾淨色彩管理，品牌識別一致。`,
      `${brand} ${product} commercial, ${style} visual language, ${channel}, ${duration}, strong opening hook, fast rhythm, clear feature proof, strong closing CTA, cinematic lighting, clean color pipeline, consistent brand identity.`,
      language
    ),
    "",
    `## ${text("短影音版本", "Short-Form Variant", language)}`,
    text(
      "9:16 直式，前三秒高對比鉤子，字幕節奏與畫面同步，結尾固定 CTA 卡。",
      "9:16 vertical format, high-contrast hook in first 3 seconds, subtitle rhythm synced to visuals, fixed CTA end card.",
      language
    )
  ].join("\n");

  const checklist = bullet([
    text("確認品牌主張與法務限制", "Confirm brand claim and legal constraints", language),
    text("確認每鏡頭都對應單一句點訊息", "Ensure every shot supports one core message", language),
    text("確認 CTA 可追蹤且可衡量", "Ensure CTA is trackable and measurable", language)
  ]);

  const assumptions = [
    text("未提供歷史投放數據，採用一般轉換導向框架。", "No historical ad performance data provided; using a standard conversion framework.", language),
    text("若未提供法規限制，預設採保守合規文案。", "If legal constraints are missing, conservative compliance language is assumed.", language)
  ];

  const risks = [
    text("受眾輪廓不足可能導致創意方向過於泛化。", "Insufficient audience detail may broaden creative direction too much.", language),
    text("平台規格未明確可能影響鏡頭比例與字幕策略。", "Unspecified platform specs may affect aspect ratio and subtitle strategy.", language)
  ];

  const nextActions = [
    text("補充品牌禁語與法務邊界。", "Provide brand prohibited claims and legal boundaries.", language),
    text("確認主要投放平台與素材比例。", "Confirm primary channels and aspect ratios.", language),
    text("提供 2-3 個競品案例做風格校準。", "Share 2-3 competitor references for style calibration.", language)
  ];

  const summary = text(
    `已生成 ${style} 方向的廣告企劃、6 鏡頭分鏡與可執行提示詞包。`,
    `Produced a ${style} campaign brief, 6-shot storyboard, and executable prompt pack.`,
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "brief", content: campaignBrief },
      { type: "table", content: shotList },
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
