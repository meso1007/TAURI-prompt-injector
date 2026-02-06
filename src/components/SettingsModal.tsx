import { useEffect, useState, useRef } from "react";
import { useSettings, THEMES } from "../contexts/SettingsContext";

type Props =
  | { isOpen: boolean; onClose: () => void }
  | { isSettingsOpen: boolean; onClose: () => void };

export const SettingsModal = (props: Props) => {
  const { onClose } = props;
  const isOpen = "isOpen" in props ? props.isOpen : props.isSettingsOpen;
  
  const { settings, updateSetting } = useSettings();
  const [draft, setDraft] = useState(settings);
  
  const savedSettingsRef = useRef(settings);
  useEffect(() => {
    savedSettingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (isOpen) setDraft(settings);
  }, [isOpen, settings]);

  // ライブプレビュー
  useEffect(() => {
    if (!isOpen) return;
    const theme = THEMES[draft.themeMode];
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    document.documentElement.style.setProperty("--accent-color", draft.themeColor);
  }, [draft, isOpen]);

  // クリーンアップ
  useEffect(() => {
    if (!isOpen) {
      const saved = savedSettingsRef.current;
      const theme = THEMES[saved.themeMode];
      Object.entries(theme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
      document.documentElement.style.setProperty("--accent-color", saved.themeColor);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveAndClose = () => {
    updateSetting("themeMode", draft.themeMode);
    updateSetting("themeColor", draft.themeColor);
    updateSetting("language", draft.language);
    updateSetting("launcherShortcut", draft.launcherShortcut);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      saveAndClose();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--bg-main)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-main)]">
          <h2 className="text-base font-bold text-[var(--text-main)]">Settings</h2>
          <span className="text-xs text-[var(--text-sub)] bg-[var(--bg-sub)] px-2 py-1 rounded">⌘+Enter to save</span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Theme Mode */}
          <div>
            <label className="text-xs text-[var(--text-sub)] font-bold tracking-wider mb-2 block">THEME</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, themeMode: "dark" }))}
                className={`flex-1 py-2 text-sm rounded-md border font-medium transition-all ${
                  draft.themeMode === "dark"
                    // ▼▼▼ 修正: 文字色を text-main (白) に戻す ▼▼▼
                    ? "border-transparent text-[var(--text-main)] shadow-sm scale-[1.02]" 
                    : "border-[var(--border)] text-[var(--text-sub)] hover:text-[var(--text-main)] bg-[var(--bg-sub)]"
                }`}
                style={{ backgroundColor: draft.themeMode === "dark" ? draft.themeColor : "" }}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, themeMode: "light" }))}
                className={`flex-1 py-2 text-sm rounded-md border font-medium transition-all ${
                  draft.themeMode === "light"
                    // ▼▼▼ 修正: 文字色を text-main (黒) に戻す ▼▼▼
                    ? "border-transparent text-[var(--text-main)] shadow-sm scale-[1.02]"
                    : "border-[var(--border)] text-[var(--text-sub)] hover:text-[var(--text-main)] bg-[var(--bg-sub)]"
                }`}
                style={{ backgroundColor: draft.themeMode === "light" ? draft.themeColor : "" }}
              >
                Light
              </button>
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="text-xs text-[var(--text-sub)] font-bold tracking-wider mb-2 block">ACCENT COLOR</label>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[var(--border)] shadow-sm shrink-0">
                <input
                  type="color"
                  value={draft.themeColor}
                  onChange={(e) => setDraft((d) => ({ ...d, themeColor: e.target.value }))}
                  className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                />
              </div>
              <input
                type="text"
                value={draft.themeColor}
                onChange={(e) => setDraft((d) => ({ ...d, themeColor: e.target.value }))}
                className="flex-1 bg-[var(--bg-sub)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm font-mono outline-none focus:border-[var(--text-sub)] text-[var(--text-main)] transition-colors"
                placeholder="#2F7AF6"
              />
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="text-xs text-[var(--text-sub)] font-bold tracking-wider mb-2 block">LANGUAGE</label>
            <div className="relative">
              <select
                value={draft.language}
                onChange={(e) => setDraft((d) => ({ ...d, language: e.target.value as "en" | "ja" }))}
                className="w-full bg-[var(--bg-sub)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm outline-none focus:border-[var(--text-sub)] text-[var(--text-main)] appearance-none cursor-pointer transition-colors"
              >
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-sub)] pointer-events-none text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Launcher Shortcut */}
          <div>
            <label className="text-xs text-[var(--text-sub)] font-bold tracking-wider mb-2 block">LAUNCHER SHORTCUT</label>
            <input
              type="text"
              value={draft.launcherShortcut}
              onChange={(e) => setDraft((d) => ({ ...d, launcherShortcut: e.target.value }))}
              className="w-full bg-[var(--bg-sub)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm font-mono outline-none focus:border-[var(--text-sub)] text-[var(--text-main)] transition-colors"
              placeholder="Alt+Space"
            />
            <div className="mt-2 text-xs text-[var(--text-sub)] flex gap-2">
              <span>Example:</span>
              <span className="font-mono bg-[var(--bg-sub)] px-1.5 py-0.5 rounded border border-[var(--border)]">Alt+Space</span>
              <span className="font-mono bg-[var(--bg-sub)] px-1.5 py-0.5 rounded border border-[var(--border)]">Command+Shift+K</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] flex justify-end gap-3 bg-[var(--bg-main)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors rounded-lg hover:bg-[var(--bg-sub)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveAndClose}
            // ▼▼▼ 修正: ここも text-main に ▼▼▼
            className="px-6 py-2 text-sm rounded-lg font-bold transition-transform active:scale-95 text-[var(--text-main)] shadow-md"
            style={{ backgroundColor: draft.themeColor }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};