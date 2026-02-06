import { Prompt } from "../types";

export const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: "cot",
    icon: "🧠",
    title: "Chain of Thought",
    desc: "Complex reasoning step-by-step.",
    content: "You are an expert in logical reasoning and problem-solving.\n\n# INSTRUCTION\nSolve the following problem step-by-step. Do not jump to the conclusion immediately. Instead, explicitly state the rationale for each step of your reasoning process.\n\n# PROBLEM\n{{selection}}\n\n# OUTPUT\nLet's think step by step:",
    shortcut: "Alt+C",
    referenceUrl: "https://arxiv.org/abs/2201.11903" // Wei et al. (2022) - 元祖CoT論文
  },
  {
    id: "review",
    icon: "🛡️",
    title: "Senior Code Review",
    desc: "Google-style engineering review.",
    content: "Act as a Principal Software Engineer at a top-tier tech company (e.g., Google/Meta).\n\n# INSTRUCTION\nReview the code below. Focus strictly on:\n1. **Security** (Vulnerabilities, Injection risks)\n2. **Performance** (Time/Space complexity O(n))\n3. **Maintainability** (SOLID principles, DRY, Readability)\n4. **Correctness** (Edge cases)\n\nProvide specific, actionable improvements with code snippets.\n\n# CODE\n```\n{{selection}}\n```",
    shortcut: "Alt+R",
    referenceUrl: "https://google.github.io/eng-practices/review/reviewer/" // Google公式エンジニアリングガイド
  },
  {
    id: "academic",
    icon: "🎓",
    title: "Academic Polisher",
    desc: "Refine for IEEE/Nature journals.",
    content: "Act as a professional academic editor for top-tier journals (Nature, IEEE, ACM).\n\n# INSTRUCTION\nRewrite the following text to improve clarity, academic tone, and flow.\n- Use precise, formal vocabulary.\n- Remove ambiguity and redundancy.\n- Ensure logical transitions between sentences.\n- Prefer active voice where appropriate, but maintain objectivity.\n\n# TEXT\n{{selection}}",
    shortcut: "Alt+A",
    referenceUrl: "https://journals.ieeeauthorcenter.ieee.org/create-your-ieee-journal-article/refining-the-use-of-english-in-your-article/" // IEEE Author Center
  },
  {
    id: "commit",
    icon: "git",
    title: "Git Commit Generator",
    desc: "Format as Conventional Commits.",
    content: "Generate a Git commit message for the following changes.\n\n# RULES\n- Follow the **Conventional Commits** format: `<type>(<scope>): <subject>`\n- Types: feat, fix, docs, style, refactor, perf, test, chore.\n- Keep the first line under 50 characters.\n- Provide a bulleted body if the change is complex.\n\n# DIFF / CODE\n{{selection}}",
    shortcut: "Alt+G",
    referenceUrl: "https://www.conventionalcommits.org/en/v1.0.0/" // Conventional Commits公式仕様
  },
  {
    id: "eli5",
    icon: "👶",
    title: "ELI5 Explanation",
    desc: "Feynman Technique explanation.",
    content: "Explain the following concept using the **Feynman Technique**.\n\n# INSTRUCTION\n- Explain it as if you were teaching a smart 12-year-old.\n- Use simple language (no jargon).\n- Use a concrete, real-world analogy to illustrate the core mechanism.\n\n# CONCEPT\n{{selection}}",
    shortcut: "Alt+E",
    referenceUrl: "https://fs.blog/feynman-technique/" // ファイマンテクニックの解説
  },
  {
    id: "naming",
    icon: "🏷️",
    title: "Variable Naming",
    desc: "Suggest semantic names.",
    content: "Suggest 5 high-quality variable/function names for the following logic/concept.\n\n# CRITERIA\n- Descriptive but concise.\n- Follow standard naming conventions (camelCase, snake_case depending on context).\n- Avoid generic names like `data`, `info`, `temp`.\n\n# CONTEXT\n{{selection}}",
    shortcut: "Alt+N",
    referenceUrl: "https://github.com/kettanaito/naming-cheatsheet" // 有名な命名チートシート
  }
];