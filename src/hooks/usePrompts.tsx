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

  // ショートカットの文字列などを更新する関数
  const updatePromptShortcut = (id: string, shortcut: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, shortcut } : p));
  };

  // 並び替え関数
  const reorderPrompts = (startIndex: number, endIndex: number) => {
    const items = Array.from(prompts);
    const [reorderedItem] = items.splice(startIndex, 1);
    items.splice(endIndex, 0, reorderedItem);
    setPrompts(items);
  };

  return { prompts, setPrompts, updatePromptShortcut, reorderPrompts };
};