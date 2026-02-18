#!/usr/bin/env node
"use strict";

const {
  normalizeLanguage,
  resolveMode,
  asTaskObjects,
  sortTasks,
  toTimeBlocks,
  bullet,
  table,
  pack,
  guardRequest,
  buildRefusalResponse
} = require("../../shared/runtime/ops-utils");

const SKILL = "executive-assistant";
const DEFAULT_MODE = "execution";

function text(zh, en, language) {
  return language === "zh-TW" ? zh : en;
}

function fallbackTasks(language) {
  if (language === "zh-TW") {
    return [
      { title: "完成最重要專案輸出", priority: "high", estimate: "90 分鐘", due: "today" },
      { title: "回覆關鍵訊息與郵件", priority: "medium", estimate: "45 分鐘", due: "today" },
      { title: "安排本週追蹤會議", priority: "medium", estimate: "30 分鐘", due: "this week" }
    ];
  }
  return [
    { title: "Ship highest-impact deliverable", priority: "high", estimate: "90m", due: "today" },
    { title: "Handle key messages and emails", priority: "medium", estimate: "45m", due: "today" },
    { title: "Schedule weekly follow-up meeting", priority: "medium", estimate: "30m", due: "this week" }
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

  const ranked = sortTasks(tasks);
  const blocks = toTimeBlocks(ranked, language);

  const brief = [
    `# ${text("今日執行指揮", "Daily Command Brief", language)}`,
    bullet([
      `${text("任務總數", "Total tasks", language)}: ${tasks.length}`,
      `${text("優先處理", "Top priority", language)}: ${ranked[0].title}`,
      `${text("執行原則", "Execution principle", language)}: ${text("先高影響，再高緊急", "High impact before reactive urgency", language)}`
    ])
  ].join("\n");

  const scheduleTable = table(
    [text("時間", "Time", language), text("任務", "Task", language), text("預估", "Estimate", language)],
    blocks
  );

  const followUp = bullet(
    ranked.slice(0, 5).map((task, index) => {
      const label = language === "zh-TW" ? `追蹤 ${index + 1}` : `Follow-up ${index + 1}`;
      return `${label}: ${task.title} (${task.due || (language === "zh-TW" ? "未填截止" : "no due")})`;
    })
  );

  const checklist = bullet([
    text("任何寫入行為（行事曆、信件、任務系統）需先獲得明確同意。", "Any write action (calendar/email/task systems) requires explicit approval first.", language),
    text("若深度工作被會議切碎，重新排定保護時段。", "If deep work is fragmented by meetings, re-block protected focus windows.", language),
    text("標記需要他人回覆的依賴事項。", "Flag dependency items that need external responses.", language)
  ]);

  const assumptions = [
    text("未提供完整行事曆，只能先做任務導向排程。", "Calendar context missing; plan is task-prioritized first.", language),
    text("若未提供估時，使用預設時長。", "Default duration applied when estimates are missing.", language)
  ];

  const risks = [
    text("會議臨時增加可能打斷高影響任務。", "Unexpected meetings may disrupt high-impact blocks.", language),
    text("依賴外部回覆的任務可能延遲。", "External dependencies may delay completion.", language)
  ];

  const nextActions = [
    text("確認今天不可移動的會議時段。", "Confirm non-movable meeting windows for today.", language),
    text("確認前三大任務是否可委派部分子任務。", "Confirm whether top three tasks have delegable sub-steps.", language),
    text("對需寫入系統的動作給出明確批准。", "Provide explicit approval before any system write actions.", language)
  ];

  const summary = text(
    `已完成 ${tasks.length} 項任務的排序、時段配置與追蹤清單。`,
    `Built ranking, time blocks, and follow-up queue for ${tasks.length} tasks.`,
    language
  );

  return pack(
    SKILL,
    language,
    mode,
    summary,
    [
      { type: "brief", content: brief },
      { type: "table", content: scheduleTable },
      { type: "plan", content: followUp },
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
