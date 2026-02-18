#!/usr/bin/env node
"use strict";

const {
  normalizeLanguage,
  resolveMode,
  asTaskObjects,
  eisenhowerBucket,
  sortTasks,
  bullet,
  table,
  pack,
  guardRequest,
  buildRefusalResponse
} = require("../../shared/runtime/ops-utils");

const SKILL = "eisenhower-priority-ai";
const DEFAULT_MODE = "planning";

function text(zh, en, language) {
  return language === "zh-TW" ? zh : en;
}

function fallbackTasks(language) {
  if (language === "zh-TW") {
    return [
      { title: "今天前提交客戶提案", due: "today", priority: "high" },
      { title: "規劃下季產品路線圖", due: "this month", priority: "high" },
      { title: "回覆一般通知郵件", due: "today", priority: "low" },
      { title: "整理桌面檔案", due: "none", priority: "low" }
    ];
  }
  return [
    { title: "Submit client proposal today", due: "today", priority: "high" },
    { title: "Plan next-quarter roadmap", due: "this month", priority: "high" },
    { title: "Reply to generic notifications", due: "today", priority: "low" },
    { title: "Clean desktop files", due: "none", priority: "low" }
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

  let tasks = asTaskObjects(ctx.tasks || []);
  if (!tasks.length) {
    tasks = fallbackTasks(language);
  }

  const sorted = sortTasks(tasks);
  const buckets = { Q1: [], Q2: [], Q3: [], Q4: [] };
  sorted.forEach((task) => {
    buckets[eisenhowerBucket(task)].push(task);
  });

  const rows = [];
  Object.keys(buckets).forEach((bucket) => {
    buckets[bucket].forEach((task) => {
      rows.push([
        bucket,
        task.title,
        task.due || (language === "zh-TW" ? "未標註" : "unspecified"),
        bucket === "Q1" ? text("立即執行", "execute now", language)
          : bucket === "Q2" ? text("安排深度時段", "schedule protected block", language)
          : bucket === "Q3" ? text("委派或限時", "delegate or timebox", language)
          : text("刪除或延後", "eliminate or defer", language)
      ]);
    });
  });

  const brief = [
    `# ${text("優先順序摘要", "Priority Summary", language)}`,
    bullet([
      `${text("任務總數", "Total tasks", language)}: ${tasks.length}`,
      `${text("Q1 任務", "Q1 tasks", language)}: ${buckets.Q1.length}`,
      `${text("Q2 任務", "Q2 tasks", language)}: ${buckets.Q2.length}`,
      `${text("分配策略", "Allocation", language)}: 50/40/5/5`
    ])
  ].join("\n");

  const quadrantTable = table(
    [text("象限", "Quadrant", language), text("任務", "Task", language), text("截止", "Due", language), text("建議", "Recommendation", language)],
    rows.length ? rows : [["Q2", text("請新增任務", "Add tasks", language), "-", text("重新評估", "re-evaluate", language)]]
  );

  const actionPlan = bullet([
    text(`50%：先完成 ${buckets.Q1[0] ? buckets.Q1[0].title : "最重要緊急任務"}。`, `50%: complete ${buckets.Q1[0] ? buckets.Q1[0].title : "the most urgent-important task"} first.`, language),
    text(`40%：保留給 ${buckets.Q2[0] ? buckets.Q2[0].title : "關鍵長期任務"}。`, `40%: reserve for ${buckets.Q2[0] ? buckets.Q2[0].title : "strategic long-term tasks"}.`, language),
    text("5%：監督可委派任務（Q3）。", "5%: supervise delegable tasks (Q3).", language),
    text("5%：清理或刪除低價值任務（Q4）。", "5%: clean up or drop low-value tasks (Q4).", language)
  ]);

  const checklist = bullet([
    text("Q2 任務必須被排入實際時段，避免被 Q1 吞噬。", "Q2 tasks must get real calendar slots to avoid being consumed by Q1.", language),
    text("若 Q1 過多，立即重談範圍或期限。", "If Q1 overloads, renegotiate scope or deadline immediately.", language),
    text("Q4 任務每週清理一次。", "Review and purge Q4 tasks weekly.", language)
  ]);

  const assumptions = [
    text("任務缺少完整 metadata 時已採關鍵詞推斷。", "Keyword heuristics were used when task metadata was missing.", language),
    text("未給定工時上限，分配比例僅表示努力占比。", "No explicit work-hour cap provided; allocation reflects effort share only.", language)
  ];

  const risks = [
    text("錯誤標記截止日會導致象限偏移。", "Incorrect due labels can shift quadrant classification.", language),
    text("若委派路徑不清楚，Q3 會回流變成 Q1。", "Unclear delegation may cause Q3 tasks to bounce back into Q1.", language)
  ];

  const nextActions = [
    text("補齊任務截止與影響層級。", "Add due dates and impact levels for each task.", language),
    text("將 Q2 前兩項直接上日曆。", "Schedule top two Q2 tasks directly on calendar.", language),
    text("定義 Q3 任務的受託人。", "Assign owners for Q3 tasks.", language)
  ];

  const summary = text(
    `已完成 ${tasks.length} 項任務的 Eisenhower 分象限與 50/40/5/5 行動配置。`,
    `Completed Eisenhower quadranting and 50/40/5/5 allocation for ${tasks.length} tasks.`,
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "brief", content: brief },
      { type: "table", content: quadrantTable },
      { type: "plan", content: actionPlan },
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
