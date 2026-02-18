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

const SKILL = "film-director";
const DEFAULT_MODE = "generation";

const GENRE_CANDIDATES = [
  {
    name: "Psychological Drama",
    keywords: ["drama", "memory", "inner", "心理", "情感", "成長"]
  },
  {
    name: "Neo-Noir Thriller",
    keywords: ["crime", "mystery", "shadow", "懸疑", "犯罪", "黑色"]
  },
  {
    name: "Epic Sci-Fi",
    keywords: ["space", "future", "ai", "sci", "科幻", "宇宙"]
  },
  {
    name: "Intimate Realism",
    keywords: ["family", "daily", "life", "現實", "家庭", "日常"]
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

  const premise = sentence(request, text("一位主角在壓力與選擇間尋找自我。", "A protagonist searches for identity under pressure and choice.", language));
  const genre = sentence(ctx.genre, null);
  const duration = sentence(ctx.duration, text("12-20 分鐘短片", "12-20 minute short film", language));
  const setting = sentence(ctx.setting, text("近未來城市與私密室內空間", "Near-future city with intimate interiors", language));

  const keywords = extractKeywords(`${premise} ${genre || ""} ${setting}`);
  const pickedGenre = genre || chooseStyle(GENRE_CANDIDATES, keywords).name;

  const treatment = [
    `# ${text("電影企劃處理", "Film Treatment", language)}`,
    bullet([
      `${text("類型", "Genre", language)}: ${pickedGenre}`,
      `${text("時長", "Duration", language)}: ${duration}`,
      `${text("場景基調", "Setting", language)}: ${setting}`,
      `${text("核心命題", "Core Theme", language)}: ${text("選擇的代價與自我重建", "The cost of choice and self-reconstruction", language)}`
    ]),
    "",
    `## ${text("一句話故事", "Logline", language)}`,
    premise
  ].join("\n");

  const actTable = table(
    [text("段落", "Act", language), text("敘事功能", "Narrative Role", language), text("關鍵事件", "Key Event", language)],
    [
      [text("第一幕", "Act I", language), text("建立人物與缺口", "Set character and lack", language), text("主角面臨不可忽視的觸發事件", "A triggering incident forces commitment", language)],
      [text("第二幕", "Act II", language), text("升高衝突與錯誤嘗試", "Escalate conflict and failed attempts", language), text("關係與目標同時失衡", "Relationships and goals destabilize", language)],
      [text("第三幕", "Act III", language), text("抉擇與代價", "Choice and consequence", language), text("主角以新認知完成最終行動", "Final action from transformed understanding", language)]
    ]
  );

  const scenePlan = [
    `# ${text("場景與攝影計畫", "Scene and Cinematography Plan", language)}`,
    bullet([
      text("Scene 1: 廣角建立世界規模，主角被環境壓縮。", "Scene 1: Wide establishing scale; environment compresses protagonist.", language),
      text("Scene 2: 中近景對話，節奏延長以累積不安。", "Scene 2: Medium-close dialogue with extended beats to build unease.", language),
      text("Scene 3: 手持鏡追隨失控選擇，光比拉高。", "Scene 3: Handheld pursuit of a reckless choice with harsher contrast.", language),
      text("Scene 4: 靜態長鏡頭收束，留白讓情緒落地。", "Scene 4: Static long take for emotional settling and reflection.", language)
    ]),
    "",
    `## ${text("燈光與色彩弧線", "Lighting and Color Arc", language)}`,
    text(
      "前段偏冷與低飽和，中段增加對比與陰影深度，結尾回到中性但保留暖色記憶點。",
      "Start cool and desaturated, increase contrast and shadow depth mid-film, end in neutral tones with a warm memory accent.",
      language
    )
  ].join("\n");

  const checklist = bullet([
    text("確認每場景都有可觀察的情緒位移。", "Ensure each scene has an observable emotional shift.", language),
    text("確認運鏡不搶戲且服務敘事資訊。", "Ensure camera movement serves story information, not spectacle alone.", language),
    text("確認色彩轉折與角色弧線同步。", "Ensure color transitions align with character arc.", language)
  ]);

  const assumptions = [
    text("未提供完整角色小傳，先採單主角結構。", "Character biographies were not provided; using a single-protagonist structure.", language),
    text("未提供實際場地限制，燈光策略以可落地方案為優先。", "Location constraints are unknown; lighting strategy prioritizes practical setups.", language)
  ];

  const risks = [
    text("若角色動機不明，第二幕會出現推進力不足。", "If motivation remains vague, Act II momentum may weaken.", language),
    text("時長限制過緊時，場景過渡可能壓縮角色弧線。", "Tight runtime may compress character transitions.", language)
  ];

  const nextActions = [
    text("補充角色目標與阻力來源。", "Provide protagonist goal and opposition details.", language),
    text("確認拍攝場景可用時段與光線條件。", "Confirm location schedules and available light conditions.", language),
    text("決定鏡頭語言偏向寫實或風格化。", "Choose whether camera language should lean realistic or stylized.", language)
  ];

  const summary = text(
    `已生成 ${pickedGenre} 方向的電影 treatment、三幕表與場景攝影方案。`,
    `Generated a ${pickedGenre} treatment, act structure, and scene-level cinematography plan.`,
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "brief", content: treatment },
      { type: "table", content: actTable },
      { type: "plan", content: scenePlan },
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
