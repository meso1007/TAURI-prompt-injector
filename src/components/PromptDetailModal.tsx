import { useEffect } from "react";
import { open } from '@tauri-apps/plugin-shell';
import { Prompt } from "../types";

type Props = {
  isOpen: boolean;
  prompt?: Prompt;
  onClose: () => void;
};

export const PromptDetailModal = ({ isOpen, prompt, onClose }: Props) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !prompt) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[var(--bg-main)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: サブ背景色で区切り */}
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-sub)] flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <span className="text-3xl">{prompt.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-main)] leading-tight">{prompt.title}</h2>
              <p className="text-xs text-[var(--text-sub)] mt-0.5">{prompt.desc}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
             {prompt.shortcut && (
                <span className="px-2 py-0.5 rounded bg-[var(--bg-main)] text-[10px] text-[var(--text-sub)] font-mono border border-[var(--border)]">
                  {prompt.shortcut}
                </span>
             )}
          </div>
        </div>

        {/* Content: メイン背景色 */}
        <div className="p-5 overflow-y-auto space-y-5">
          <div>
            <label className="text-[10px] text-[var(--text-sub)] uppercase font-bold block mb-1.5 tracking-wider">Content</label>
            <div className="bg-[var(--bg-sub)] border border-[var(--border)] rounded-lg p-3">
              <pre className="text-xs text-[var(--text-main)] font-mono whitespace-pre-wrap leading-relaxed break-all">
                {prompt.content}
              </pre>
            </div>
          </div>

          {/* Reference URL */}
          {prompt.referenceUrl && (
            <div>
               <label className="text-[10px] text-[var(--text-sub)] uppercase font-bold block mb-1.5 tracking-wider">Reference</label>
               <button
                 onClick={() => open(prompt.referenceUrl!)}
                 className="flex items-center gap-2 w-full bg-[var(--bg-sub)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-main)] px-3 py-2 rounded-lg transition-colors text-xs text-left group cursor-pointer"
               >
                 <span className="truncate flex-1 font-mono opacity-80 group-hover:opacity-100 underline decoration-[var(--border)] group-hover:decoration-[var(--text-sub)]">
                    {prompt.referenceUrl}
                 </span>
                 <span className="text-[10px] bg-[var(--bg-main)] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--text-sub)]">
                   Open
                 </span>
               </button>
            </div>
          )}
        </div>

        {/* Footer: サブ背景色 */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-sub)] flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] rounded border border-[var(--border)] transition-colors cursor-pointer"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};