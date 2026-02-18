#!/usr/bin/env node
"use strict";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "to", "for", "of", "in", "on", "with", "from", "at", "by",
  "is", "are", "be", "this", "that", "it", "as", "into", "your", "you", "my", "we", "our",
  "請", "幫", "我要", "我想", "可以", "需要", "做", "用", "以及", "和", "與", "在", "把", "一個", "一下", "的", "了", "是", "有"
]);

const SECURITY_PATTERNS = [
  {
    category: "prompt_injection",
    reason: "Prompt-injection or instruction override attempt detected",
    regex: /(ignore (all|previous|prior) instructions|disregard.*instructions|reveal.*system prompt|show.*hidden prompt|developer message|jailbreak|bypass.*safety|override.*policy|ignore.*policy|忽略(所有|之前|上面)?指令|無視(規則|限制)|繞過(安全|規範|限制)|洩露(系統|隱藏).*(提示|prompt)|顯示(系統|開發者|隱藏).*(訊息|提示|prompt)|隱藏提示詞)/i
  },
  {
    category: "secret_exfiltration",
    reason: "Secret-exfiltration request detected",
    regex: /(api[ _-]?key|token|password|secret|private key|ssh key|environment variable|env var|.env|credential|access key|session cookie|憑證|密碼|令牌|金鑰|環境變數|私鑰|存取金鑰|cookie)/i
  },
  {
    category: "high_risk_harm",
    reason: "High-risk harmful instruction detected",
    regex: /(build.*(weapon|bomb|explosive)|bomb.*(attack|executable|steps)|how to hack|malware|phishing|ransomware|ddos|bypass authentication|make poison|weaponize|製作.*(炸彈|武器|毒藥)|炸彈.*(攻擊|可執行|步驟)|駭入|入侵|惡意程式|勒索軟體|網路釣魚|繞過驗證)/i
  }
];

function safeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLanguage(value) {
  return value === "en" ? "en" : "zh-TW";
}

function resolveMode(value, fallback) {
  const allowed = new Set(["analysis", "generation", "planning", "execution"]);
  return allowed.has(value) ? value : fallback;
}

function tokenize(text) {
  const normalized = safeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return [];
  }
  return normalized
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token && token.length > 1 && !STOPWORDS.has(token));
}

function extractKeywords(text, limit = 8) {
  const freq = new Map();
  tokenize(text).forEach((token) => {
    freq.set(token, (freq.get(token) || 0) + 1);
  });
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([token]) => token);
}

function chooseStyle(candidates, keywords) {
  const base = candidates[0];
  let best = { score: -1, item: base };
  candidates.forEach((item) => {
    const score = item.keywords.reduce((acc, token) => {
      return acc + (keywords.includes(token) ? 1 : 0);
    }, 0);
    if (score > best.score) {
      best = { score, item };
    }
  });
  return best.item;
}

function bullet(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function table(headers, rows) {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  return [head, sep, body].join("\n");
}

function sentence(value, fallback) {
  const text = safeText(value);
  return text || fallback;
}

function guardRequest(input = {}, context = {}) {
  const request = safeText(input.user_request);
  const mode = safeText(input.mode);
  const ctxString = typeof context === "object" ? JSON.stringify(context) : safeText(String(context));
  const joined = `${request}\n${mode}\n${ctxString}`;

  for (const rule of SECURITY_PATTERNS) {
    if (rule.regex.test(joined)) {
      return {
        blocked: true,
        category: rule.category,
        reason: rule.reason
      };
    }
  }

  return {
    blocked: false,
    category: "none",
    reason: ""
  };
}

function buildRefusalResponse({ skill, language, mode, reason, category }) {
  const isZh = language !== "en";
  const summary = isZh
    ? "偵測到高風險或越權請求，已拒絕執行並返回安全替代方向。"
    : "High-risk or out-of-policy request detected; execution was refused with safe alternatives.";

  const brief = isZh
    ? `# 安全拒絕\n- 類別: ${category}\n- 原因: ${reason}`
    : `# Safety Refusal\n- Category: ${category}\n- Reason: ${reason}`;

  const checklist = isZh
    ? bullet([
      "移除要求洩露系統提示詞、密鑰或憑證的內容。",
      "改用高層次、合法且無害的分析需求。",
      "若任務需要執行動作，先明確定義合規邊界。"
    ])
    : bullet([
      "Remove any request to reveal hidden prompts, keys, or credentials.",
      "Reframe the task as high-level, legal, and non-harmful analysis.",
      "If actions are needed, define compliance boundaries first."
    ]);

  return pack(
    skill,
    language,
    mode,
    summary,
    [
      { type: "brief", content: brief },
      { type: "checklist", content: checklist }
    ],
    [
      isZh
        ? "請求中含有觸發安全規則的語句。"
        : "The request contained phrases that triggered safety rules."
    ],
    [
      isZh
        ? "若誤判，需改寫需求並提供明確合規意圖。"
        : "If this is a false positive, rewrite the request with explicit compliant intent."
    ],
    [
      isZh
        ? "提交不含越權語句的新版本請求。"
        : "Resubmit a revised request without override or exfiltration language."
    ]
  );
}

function pack(skill, language, mode, summary, artifacts, assumptions, risks, nextActions) {
  return {
    skill,
    language,
    mode,
    summary,
    artifacts,
    assumptions,
    risks,
    next_actions: nextActions
  };
}

module.exports = {
  safeText,
  normalizeLanguage,
  resolveMode,
  tokenize,
  extractKeywords,
  chooseStyle,
  bullet,
  table,
  sentence,
  pack,
  guardRequest,
  buildRefusalResponse
};
