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

function asList(value) {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\n|,|;|、|，/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function asTaskObjects(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return { title: item.trim() };
        }
        if (item && typeof item === "object") {
          return {
            title: safeText(item.title),
            priority: safeText(item.priority),
            due: safeText(item.due),
            estimate: safeText(item.estimate),
            context: safeText(item.context)
          };
        }
        return null;
      })
      .filter((task) => task && task.title);
  }

  return asList(value).map((title) => ({ title }));
}

function containsAny(text, terms) {
  const lower = safeText(text).toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function scoreUrgency(task) {
  const text = `${task.title || ""} ${task.due || ""} ${task.priority || ""}`;
  let score = 0;
  if (containsAny(text, ["today", "asap", "urgent", "deadline", "incident", "blocker", "今天", "緊急", "截止", "卡住", "故障"])) {
    score += 3;
  }
  if (containsAny(text, ["tomorrow", "this week", "明天", "本週"])) {
    score += 1;
  }
  return score;
}

function scoreImportance(task) {
  const text = `${task.title || ""} ${task.context || ""} ${task.priority || ""}`;
  let score = 0;
  if (containsAny(text, ["strategy", "revenue", "customer", "security", "health", "key", "關鍵", "策略", "營收", "客戶", "安全", "健康"])) {
    score += 3;
  }
  if (containsAny(text, ["high", "p1", "重要", "高"] )) {
    score += 1;
  }
  return score;
}

function eisenhowerBucket(task) {
  const u = scoreUrgency(task);
  const i = scoreImportance(task);
  if (u >= 3 && i >= 3) {
    return "Q1";
  }
  if (u < 3 && i >= 3) {
    return "Q2";
  }
  if (u >= 3 && i < 3) {
    return "Q3";
  }
  return "Q4";
}

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const sa = scoreUrgency(a) * 2 + scoreImportance(a);
    const sb = scoreUrgency(b) * 2 + scoreImportance(b);
    return sb - sa || a.title.localeCompare(b.title);
  });
}

function toTimeBlocks(tasks, language) {
  const fallback = language === "zh-TW" ? "30 分鐘" : "30m";
  const startTimes = ["09:00", "10:00", "11:00", "13:30", "14:30", "15:30", "16:30", "17:30"];
  return tasks.slice(0, startTimes.length).map((task, idx) => {
    const estimate = task.estimate || fallback;
    return [startTimes[idx], task.title, estimate];
  });
}

function topKeywords(text, limit = 6) {
  return extractKeywords(text, limit);
}

module.exports = {
  safeText,
  normalizeLanguage,
  resolveMode,
  bullet,
  table,
  sentence,
  pack,
  guardRequest,
  buildRefusalResponse,
  asList,
  asTaskObjects,
  containsAny,
  scoreUrgency,
  scoreImportance,
  eisenhowerBucket,
  sortTasks,
  toTimeBlocks,
  topKeywords
};
