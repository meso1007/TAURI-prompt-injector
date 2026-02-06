import { useState, useEffect } from "react";
import { Prompt } from "../types";
import { DEFAULT_PROMPTS } from "../data/defaultPrompts";

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const saved = localStorage.getItem("tsuchi-prompts");
    return saved ? JSON.parse(saved) : DEFAULT_PROMPTS;
  });

  useEffect(() => {
    localStorage.setItem("tsuchi-prompts", JSON.stringify(prompts));
  }, [prompts]);

  const addPrompt = (prompt: Omit<Prompt, "id">) => {
    const newPrompt: Prompt = { ...prompt, id: crypto.randomUUID() };
    setPrompts((prev) => [newPrompt, ...prev]);
  };

  const updatePrompt = (updatedPrompt: Prompt) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === updatedPrompt.id ? updatedPrompt : p))
    );
  };

  const deletePrompt = (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const reorderPrompts = (startIndex: number, endIndex: number) => {
    const items = Array.from(prompts);
    const [reorderedItem] = items.splice(startIndex, 1);
    items.splice(endIndex, 0, reorderedItem);
    setPrompts(items);
  };

  // 個別のフィールド更新用（ショートカット更新などで使用）
  const updatePromptField = (id: string, field: keyof Prompt, value: any) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  return {
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    reorderPrompts,
    updatePromptField,
  };
};