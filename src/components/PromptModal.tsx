import { useState, useEffect, useRef } from "react";
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { sendNotification } from '@tauri-apps/plugin-notification';
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
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === "edit") {
        setFormData({
          icon: initialData.icon || "📝",
          title: initialData.title || "",
          desc: initialData.desc || "",
          content: initialData.content || "",
          shortcut: initialData.shortcut || "",
          referenceUrl: initialData.referenceUrl || "",
        });
      } else {
        setFormData(EMPTY_PROMPT);
      }
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [isOpen, initialData, mode]);

  // ★追加: 変数をクリックしたらコピーする関数
  const handleCopyVariable = async (text: string) => {
    try {
      await writeText(text);
      sendNotification({
        title: "Copied!",
        body: `"${text}" copied to clipboard.`,
      });
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSave(formData as any);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[var(--bg-main)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-sub)] flex justify-between items-center">
          <h2 className="text-base font-bold text-[var(--text-main)]">
            {mode === "create" ? "New Prompt" : "Edit Prompt"}
          </h2>
          <div className="text-xs text-[var(--text-sub)] bg-[var(--bg-main)] px-2 py-1 rounded border border-[var(--border)]">
             ⌘+Enter to save
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Icon & Title Row */}
          <div className="flex gap-3">
            <div className="w-16">
              <label className="text-[10px] text-[var(--text-sub)] uppercase font-bold block mb-1">Icon</label>
              <input
                type="text"
                className="w-full bg-[var(--bg-sub)] border border-[var(--border)] rounded p-2 text-center text-lg outline-none focus:border-[var(--text-main)] transition-colors text-[var(--text-main)]"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-[var(--text-sub)] uppercase font-bold block mb-1">Title</label>
              <input
                ref={titleInputRef}
                type="text"
                className="w-full bg-[var(--bg-sub)] border border-[var(--border)] rounded p-2 text-sm outline-none focus:border-[var(--text-main)] transition-colors text-[var(--text-main)] placeholder-[var(--text-sub)]"
                placeholder="My Awesome Prompt"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] text-[var(--text-sub)] uppercase font-bold block mb-1">Description</label>
            <input
              type="text"
              className="w-full bg-[var(--bg-sub)] border border-[var(--border)] rounded p-2 text-sm outline-none focus:border-[var(--text-main)] transition-colors text-[var(--text-main)] placeholder-[var(--text-sub)]"
              placeholder="What does this prompt do?"
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            />
          </div>

          {/* Reference URL */}
          <div>
            <label className="text-[10px] text-[var(--text-sub)] uppercase font-bold block mb-1">Reference URL (Optional)</label>
            <input
              type="text"
              className="w-full bg-[var(--bg-sub)] border border-[var(--border)] rounded p-2 text-sm outline-none focus:border-[var(--text-main)] transition-colors text-[var(--text-main)] placeholder-[var(--text-sub)]"
              placeholder="https://example.com/docs"
              value={formData.referenceUrl}
              onChange={(e) => setFormData({ ...formData, referenceUrl: e.target.value })}
            />
          </div>

          {/* Content & Guide */}
          <div className="flex-1 flex flex-col">
            <label className="text-[10px] text-[var(--text-sub)] uppercase font-bold mb-1">Prompt Content</label>
            <textarea
              className="w-full h-40 bg-[var(--bg-sub)] border border-[var(--border)] rounded p-3 text-sm font-mono outline-none focus:border-[var(--text-main)] transition-colors text-[var(--text-main)] placeholder-[var(--text-sub)] resize-none leading-relaxed"
              placeholder="Summarize this text: {{selection}}"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            
            {/* Variables Guide */}
            <div className="mt-2 p-3 rounded-lg bg-[var(--bg-sub)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-[var(--text-main)]">💡 Variables Guide</span>
              </div>
              <ul className="text-[11px] text-[var(--text-sub)] space-y-1.5 list-disc list-inside">
                <li>
                  {/* ▼▼▼ ここをクリック可能に修正 ▼▼▼ */}
                  <code 
                    onClick={() => handleCopyVariable("{{selection}}")}
                    className="bg-[var(--bg-main)] px-1 py-0.5 rounded border border-[var(--border)] text-[var(--text-main)] font-mono cursor-pointer hover:bg-[var(--bg-hover)] active:scale-95 transition-all select-none"
                    title="Click to copy"
                  >
                    {"{{selection}}"}
                  </code>
                  <span className="ml-1">: Replaced with your copied text. (Click to copy)</span>
                </li>
                <li>
                  <span className="font-bold">Auto-Append:</span> If you omit tag, text is appended automatically.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] flex justify-end gap-3 bg-[var(--bg-sub)]">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors rounded-lg hover:bg-[var(--bg-main)]"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2 text-sm rounded-lg font-bold transition-transform active:scale-95 text-[var(--text-main)] shadow-md"
            style={{ backgroundColor: "var(--accent-color)" }}
          >
            Save Prompt
          </button>
        </div>
      </div>
    </div>
  );
};