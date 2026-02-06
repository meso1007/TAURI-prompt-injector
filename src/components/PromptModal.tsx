import { useState, useEffect } from "react";
import { Prompt } from "../types";

type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: Prompt;
  onClose: () => void;
  onSave: (prompt: Omit<Prompt, "id"> | Prompt) => void;
};

const EMPTY_PROMPT = {
  icon: "📝",
  title: "",
  desc: "",
  content: "",
  shortcut: "",
  referenceUrl: "",
};

export const PromptModal = ({ isOpen, mode, initialData, onClose, onSave }: Props) => {
  const [formData, setFormData] = useState(EMPTY_PROMPT);

  useEffect(() => {
    if (isOpen && initialData && mode === "edit") {
      setFormData({
        ...initialData,
        shortcut: initialData.shortcut ?? "",
        referenceUrl: initialData.referenceUrl ?? "",
      });
    } else if (isOpen && mode === "create") {
      setFormData(EMPTY_PROMPT);
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd + Enter で保存
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSave(formData as any);
      onClose();
    }
    // Esc で閉じる
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-lg bg-[#191919] border border-[#333] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onKeyDown={handleKeyDown}
      >
        <div className="px-4 py-3 border-b border-[#333] flex justify-between items-center bg-[#222]">
          <h2 className="text-sm font-bold text-white">
            {mode === "create" ? "New Prompt" : "Edit Prompt"}
          </h2>
          <span className="text-[10px] text-neutral-500">⌘+Enter to save</span>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Icon & Title Row */}
          <div className="flex gap-3">
            <div className="w-12">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">Icon</label>
              <input
                type="text"
                className="w-full bg-[#111] border border-[#333] rounded px-2 py-1.5 text-center text-xl outline-none focus:border-blue-500 text-white"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">Title</label>
              <input
                autoFocus
                type="text"
                className="w-full bg-[#111] border border-[#333] rounded px-2 py-2 text-sm outline-none focus:border-blue-500 text-white placeholder-neutral-600"
                placeholder="My Awesome Prompt"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] text-neutral-500 uppercase font-bold">Description</label>
            <input
              type="text"
              className="w-full bg-[#111] border border-[#333] rounded px-2 py-2 text-xs outline-none focus:border-blue-500 text-white placeholder-neutral-600"
              placeholder="What does this prompt do?"
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 uppercase font-bold flex items-center gap-1">
              Reference / Source
              <span className="text-[9px] text-neutral-600 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              className="w-full bg-[#111] border border-[#333] rounded px-2 py-2 text-xs outline-none focus:border-blue-500 text-neutral-400 placeholder-neutral-700 font-mono"
              placeholder="e.g. Wei et al. (2022) or https://arxiv.org/..."
              value={formData.referenceUrl || ""}
              onChange={(e) => setFormData({ ...formData, referenceUrl: e.target.value })}
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-[150px]">
            <label className="text-[10px] text-neutral-500 uppercase font-bold mb-1 flex justify-between">
              <span>Prompt Content</span>
              <span className="text-blue-400">Use {"{{selection}}"} for clipboard</span>
            </label>
            <textarea
              className="flex-1 w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-xs font-mono outline-none focus:border-blue-500 text-neutral-300 resize-none leading-relaxed"
              placeholder="Summarize this text: {{selection}}"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        </div>

        <div className="p-3 border-t border-[#333] flex justify-end gap-2 bg-[#222]">
          <button 
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onSave(formData as any); onClose(); }}
            className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
          >
            Save Prompt
          </button>
        </div>
      </div>
    </div>
  );
};