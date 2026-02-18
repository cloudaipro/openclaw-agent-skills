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

const SKILL = "kitchen-commander";
const DEFAULT_MODE = "execution";

function text(zh, en, language) {
  return language === "zh-TW" ? zh : en;
}

function chooseDish(inventory, keywords, language) {
  const inv = inventory.map((item) => item.toLowerCase());
  const has = (terms) => terms.some((term) => inv.some((x) => x.includes(term)));

  if (has(["egg", "蛋"]) && has(["rice", "飯"])) {
    return {
      name: text("蔥香蛋炒飯", "Scallion Egg Fried Rice", language),
      reason: text("優先消耗剩飯與蛋，最快達成高風味。", "Uses leftover rice and eggs for fast, high-flavor output.", language),
      core: [text("剩飯", "rice", language), text("雞蛋", "egg", language), text("蔥蒜", "scallion and garlic", language)]
    };
  }

  if (has(["pasta", "義大利麵"])) {
    return {
      name: text("蒜香番茄義大利麵", "Garlic Tomato Pasta", language),
      reason: text("可用單鍋完成，時間可控。", "Single-pot friendly with predictable timing.", language),
      core: [text("義大利麵", "pasta", language), text("番茄基底", "tomato base", language), text("橄欖油", "olive oil", language)]
    };
  }

  if (has(["chicken", "雞"]) && has(["vegetable", "菜", "青菜"])) {
    return {
      name: text("高火雞肉蔬菜炒鍋", "High-Heat Chicken Veg Stir Fry", language),
      reason: text("蛋白質與蔬菜可同時完成，營養與口感平衡。", "Balances protein and vegetables in one workflow.", language),
      core: [text("雞肉", "chicken", language), text("綜合蔬菜", "mixed vegetables", language), text("蒜薑", "garlic and ginger", language)]
    };
  }

  return {
    name: text("冰箱清爽雜菜蓋飯", "Fridge-Cleanout Rice Bowl", language),
    reason: text("在資訊不足時提供最穩定且易調整的方案。", "Stable fallback when pantry signal is weak.", language),
    core: [text("主食", "base carb", language), text("蛋白質", "protein", language), text("蔬菜", "vegetables", language)]
  };
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

  const inventory = asList(ctx.inventory || "");
  const equipment = asList(ctx.equipment || "");
  const constraints = asList(ctx.constraints || ctx.dietary_constraints || "");
  const servings = sentence(ctx.servings, "1");
  const timeLimit = sentence(ctx.time_limit, language === "zh-TW" ? "30 分鐘" : "30 minutes");

  const keywords = topKeywords(`${input.user_request || ""} ${inventory.join(" ")}`);
  const dish = chooseDish(inventory, keywords, language);

  const brief = [
    `# ${text("菜色決策簡報", "Dish Decision Brief", language)}`,
    bullet([
      `${text("推薦菜色", "Recommended dish", language)}: ${dish.name}`,
      `${text("理由", "Reason", language)}: ${dish.reason}`,
      `${text("份量", "Servings", language)}: ${servings}`,
      `${text("目標時長", "Target time", language)}: ${timeLimit}`
    ])
  ].join("\n");

  const rows = [
    [text("主材料", "Core", language), dish.core.join(" / "), text("主要風味骨架", "Primary flavor backbone", language)],
    [text("庫存食材", "Inventory", language), inventory.length ? inventory.join(" / ") : text("未提供", "Not provided", language), text("優先消耗", "Use first", language)],
    [text("可替代", "Substitution", language), text("香料、香草、酸味來源", "spices, herbs, acidity source", language), text("缺料時替換", "replace when missing", language)]
  ];

  const ingredientTable = table(
    [text("分類", "Category", language), text("內容", "Content", language), text("備註", "Note", language)],
    rows
  );

  const sop = bullet([
    text("Prep 8 分鐘：洗切、調味、主材料分區。", "Prep 8 min: wash/chop, pre-season, separate core ingredients.", language),
    text("Cook 15 分鐘：先香料後主蛋白，再加入蔬菜與主食。", "Cook 15 min: aromatics first, then protein, then vegetables and base carb.", language),
    text("Finish 5 分鐘：校正鹹度與酸度，完成擺盤。", "Finish 5 min: calibrate salt/acidity and plate.", language),
    text("Storage 2 分鐘：剩餘食材分類冷藏，標記日期。", "Storage 2 min: separate leftovers and label date.", language)
  ]);

  const checklist = bullet([
    text("陶瓷或不沾鍋避免乾燒與金屬器具。", "Avoid dry high heat and metal utensils on ceramic/nonstick pans.", language),
    text("生熟砧板與刀具分流。", "Separate tools for raw and cooked items.", language),
    text("若含過敏原不確定，先標示並降低風險。", "If allergen status is uncertain, label and de-risk first.", language)
  ]);

  const assumptions = [
    text("未提供完整庫存，已用彈性替代邏輯補齊。", "Inventory details were incomplete; substitution logic applied.", language),
    text("未提供設備功率，預設家用設備條件。", "Equipment power not provided; standard home setup assumed.", language)
  ];

  const risks = [
    text("缺少關鍵調味時，風味層次可能不足。", "Flavor depth may drop without key seasonings.", language),
    text("時間限制過短會壓縮口感最佳化步驟。", "Very short time limits may reduce texture optimization.", language)
  ];

  const nextActions = [
    text("補充庫存明細以提升精準度。", "Provide detailed pantry list for tighter optimization.", language),
    text("指定可用設備與鍋具材質。", "Specify available appliances and pan materials.", language),
    text("提供禁忌食材與口味偏好。", "Provide dietary restrictions and flavor preferences.", language)
  ];

  const summary = text(
    `已產出 ${dish.name} 的庫存優先 SOP、食材表與安全檢查。`,
    `Generated an inventory-first SOP for ${dish.name} with ingredient table and safety checklist.`,
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "brief", content: brief },
      { type: "table", content: ingredientTable },
      { type: "plan", content: sop },
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
