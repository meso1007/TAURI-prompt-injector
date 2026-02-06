import { usePrompts } from "../hooks/usePrompts";

export const Footer = () => {
  const { resetPrompts } = usePrompts();

  const handleReset = () => {
    if(confirm("⚠️ Reset all prompts to default?")) {
      resetPrompts();
      window.location.reload();
    }
  };

  return (
    <div className="h-8 border-t border-[var(--border)] bg-[var(--bg-sub)] flex items-center justify-between px-4 text-[10px] select-none rounded-b-xl">
      
      {/* 左側：ナビゲーション */}
      <div className="flex gap-4 text-[var(--text-sub)]">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-main)] font-medium">↑↓</span>
          <span>Nav</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-main)] font-medium">↵</span>
          <span>Copy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-main)] font-medium">⌥ Click</span>
          <span>Link</span>
        </div>
      </div>

      {/* 右側：アクション */}
      <div className="flex items-center gap-4 text-[var(--text-sub)]">
        <div className="flex items-center gap-4 border-r border-[var(--border)] pr-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-main)] font-medium">⌘N</span>
            <span>New</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-main)] font-medium">⌘I</span>
            <span>Info</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-main)] font-medium">⌘E</span>
            <span>Edit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-main)] font-medium">⌘K</span>
            <span>Key</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-main)] font-medium">⌘⌫</span>
            <span>Del</span>
          </div>
          {/* ▼▼▼ 追加: Settings ▼▼▼ */}
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-main)] font-medium">⌘,</span>
            <span>Set</span>
          </div>
        </div>

        {/* リセットボタン */}
        <button 
          onClick={handleReset}
          className="hover:text-[var(--text-main)] transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
};