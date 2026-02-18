#!/usr/bin/env node
"use strict";

const {
  safeText,
  normalizeLanguage,
  resolveMode,
  extractKeywords,
  bullet,
  sentence,
  pack,
  guardRequest,
  buildRefusalResponse
} = require("../../shared/runtime/creative-utils");

const SKILL = "seedance-screenwriter";
const DEFAULT_MODE = "generation";

function text(zh, en, language) {
  return language === "zh-TW" ? zh : en;
}

function normalizePositive(input) {
  return input
    .replace(/不要|別|不准|不可以/g, "")
    .replace(/\bno\b|\bnot\b|without/gi, "")
    .replace(/\s+/g, " ")
    .trim();
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

  const sceneRaw = sentence(
    request,
    text("夜色港口中，主角穿越霧氣與霓虹，快速接近目標。", "At a night harbor, the protagonist cuts through neon mist to close in on a target.", language)
  );
  const scene = normalizePositive(sceneRaw);
  const mood = sentence(ctx.mood, text("緊張且詩意", "tense yet poetic", language));
  const aspect = sentence(ctx.aspect_ratio, "16:9");

  const keywords = extractKeywords(`${scene} ${mood}`);

  const visual = text(
    `主體設定：${scene}；服裝細節清晰；場景材質層次豐富；色彩主軸貼合 ${mood}。`,
    `Subject and scene: ${scene}; clear wardrobe detail; rich environmental textures; palette aligned with ${mood}.`,
    language
  );
  const motion = text(
    "動作節奏由慢到快再穩定收束，位移方向明確，關鍵動作有停頓強調。",
    "Motion escalates from controlled to fast and then settles; movement direction stays clear with accented pauses.",
    language
  );
  const camera = text(
    "鏡頭以中景跟拍進場，切入特寫捕捉情緒，再以廣角交代空間關係。",
    "Begin with medium tracking, cut to emotional close-up, then return to wide framing for spatial clarity.",
    language
  );
  const atmosphere = text(
    `光線具電影級層次，空氣感與材質反射清楚，整體氛圍維持 ${mood}。`,
    `Cinematic light layering, clear atmospheric depth and material reflections, sustained ${mood} mood.`,
    language
  );

  const masterPrompt = [
    `# ${text("VMCA 主提示詞", "VMCA Master Prompt", language)}`,
    `V: ${visual}`,
    `M: ${motion}`,
    `C: ${camera}`,
    `A: ${atmosphere}`,
    text(
      `輸出規格：${aspect}，高動態範圍，色彩精準，動作流暢，主體輪廓清晰。`,
      `Output spec: ${aspect}, high dynamic range, accurate color, smooth motion, clear subject contours.`,
      language
    )
  ].join("\n");

  const compactPrompt = text(
    `${scene}，${mood}，中景跟拍轉特寫，節奏由慢到快，電影級光影層次，${aspect}。`,
    `${scene}, ${mood}, medium tracking to close-up, controlled-to-fast rhythm, cinematic lighting depth, ${aspect}.`,
    language
  );

  const expandedPrompt = text(
    `${scene}。畫面具備清晰空間層次與可讀動作路徑，運鏡節奏與角色動能同步，光影與材質反射提升真實感，色彩對比穩定且富含電影質感，最終鏡頭收束於情緒高點。`,
    `${scene}. Preserve clear spatial layering and readable motion paths, sync camera rhythm with character energy, emphasize material reflections and cinematic light contrast, and resolve on an emotional peak frame.`,
    language
  );

  const checklist = bullet([
    text("V/M/C/A 四段皆有具體資訊。", "All V/M/C/A blocks contain concrete details.", language),
    text("已移除否定語句並改為正向描述。", "Negations are removed and replaced with positive phrasing.", language),
    text("主體、動作、鏡頭三者無矛盾。", "Subject, motion, and camera directives are internally consistent.", language)
  ]);

  const assumptions = [
    text("未提供平台特有語法，採通用影片提示格式。", "No tool-specific syntax was provided; using a cross-tool video prompt format.", language),
    text("若未指定比例，預設 16:9。", "Aspect ratio defaults to 16:9 when not provided.", language)
  ];

  const risks = [
    text("場景描述過短時，視覺細節可能不足。", "Very short scene descriptions may limit visual specificity.", language),
    text("未提供平台模型版本時，參數最佳化有限。", "Prompt tuning is limited without platform model/version context.", language)
  ];

  const nextActions = [
    text("提供參考畫面以強化風格一致性。", "Share references to tighten stylistic consistency.", language),
    text("指定工具與版本以做參數微調。", "Specify target tool and model version for better tuning.", language),
    text("補充鏡頭長度與剪接節奏偏好。", "Provide shot-length and editing rhythm preferences.", language)
  ];

  const summary = text(
    `已輸出 VMCA 主提示詞、精簡版與擴展版，共 ${keywords.length} 個關鍵詞被吸收。`,
    `Generated VMCA master, compact, and expanded prompts using ${keywords.length} extracted keywords.`,
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "prompt", content: masterPrompt },
      { type: "prompt", content: compactPrompt },
      { type: "prompt", content: expandedPrompt },
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
