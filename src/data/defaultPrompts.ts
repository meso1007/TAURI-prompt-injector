import { Prompt } from "../types";

export const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: "cot",
    icon: "🧠",
    title: "Chain of Thought",
    desc: "Solve step-by-step logic.",
    content: "You are an expert in logical reasoning.\n\n# INSTRUCTION\nSolve the following problem step-by-step. Do not jump to the conclusion. Explicitly state the rationale for each step.\n\n# PROBLEM\n{{selection}}\n\n# OUTPUT\nLet's think step by step:",
    shortcut: "" 
  },
  {
    id: "review",
    icon: "🛡️",
    title: "Senior Engineer Review",
    desc: "Security & Performance fix.",
    content: "Act as a Principal Software Engineer.\n\n# INSTRUCTION\nReview the code below. Focus strictly on:\n1. **Security** (Vulnerabilities)\n2. **Performance** (Time/Space complexity)\n3. **Maintainability** (SOLID, DRY)\n\n# CODE\n```\n{{selection}}\n```",
    shortcut: ""
  },
  {
    id: "explain",
    icon: "👶",
    title: "ELI5 Explanation",
    desc: "Explain like I'm 12.",
    content: "Explain the following concept to a smart 12-year-old.\n- Use simple language.\n- Use a concrete analogy.\n\n# CONCEPT\n{{selection}}",
    shortcut: ""
  },
  {
    id: "academic",
    icon: "🎓",
    title: "Academic Polisher",
    desc: "Rewrite for formal paper.",
    content: "Rewrite the text for a top-tier academic journal (Nature/IEEE).\n- Remove ambiguity.\n- Use precise terminology.\n- Ensure logical flow.\n\n# TEXT\n{{selection}}",
    shortcut: ""
  }
];