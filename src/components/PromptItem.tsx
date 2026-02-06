import { Draggable } from '@hello-pangea/dnd';
import { Prompt } from "../types";
import { useState, useEffect, useRef } from 'react';
import { open } from '@tauri-apps/plugin-shell';

type Props = {
  prompt: Prompt;
  index: number;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: () => void;
  onHover: () => void;
  onShortcutUpdate: (id: string, key: string) => void;
  setEditingId: (id: string | null) => void;
  isEditing: boolean;
  innerRef: (el: HTMLLIElement | null) => void;
};

// キーイベントをTauriのショートカット文字列に変換する関数
const getShortcutFromEvent = (e: React.KeyboardEvent): string | null => {
    const modifiers = [];
    if (e.metaKey) modifiers.push("Command");
    if (e.ctrlKey) modifiers.push("Control");
    if (e.altKey) modifiers.push("Alt");
    if (e.shiftKey) modifiers.push("Shift");
  
    if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) {
      return null;
    }
  
    if (e.key === "Backspace" || e.key === "Delete") {
      return "";
    }
  
    let key = e.code; 
  
    if (key.startsWith("Key")) {
      key = key.replace("Key", "");
    } else if (key.startsWith("Digit")) {
      key = key.replace("Digit", "");
    } else if (key === "Space") {
      key = "Space";
    }
  
    if (key.match(/^F[0-9]+$/)) {
      // Keep F1-F12
    }
  
    if (modifiers.length > 0) {
      return [...modifiers, key].join("+");
    }
    
    return key;
  };
  
export const PromptItem = ({ 
  prompt, index, isSelected, isDraggable, onSelect, onHover, 
  onShortcutUpdate, setEditingId, isEditing, innerRef 
}: Props) => {
  const [tempShortcut, setTempShortcut] = useState(prompt.shortcut || "");
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setIsRecording(false);
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing]);

  const handleClick = async (e: React.MouseEvent) => {
    if (isEditing) return;

    if (e.altKey && prompt.referenceUrl) {
      e.stopPropagation();
      await open(prompt.referenceUrl);
      return;
    }

    onSelect();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (e.key === "Enter") {
      onShortcutUpdate(prompt.id, tempShortcut);
      setEditingId(null);
      return;
    }
    
    if (e.key === "Escape") {
      setEditingId(null);
      return;
    }

    if (!isRecording) {
      if (e.key === " " || e.code === "Space") {
        setIsRecording(true);
      }
      return;
    }

    const shortcut = getShortcutFromEvent(e);
    if (shortcut !== null) {
      setTempShortcut(shortcut);
      setIsRecording(false);
    }
  };

  return (
    <Draggable draggableId={prompt.id} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <li
          ref={(el) => {
            provided.innerRef(el);
            innerRef(el);
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
          onMouseEnter={() => !isEditing && onHover()}
          className={`relative flex items-center px-3 py-3 rounded-md transition-colors duration-75 select-none group ${
            isSelected
              ? "text-white" // 選択中はアクセントカラー背景なので白文字固定
              : "text-[var(--text-sub)] hover:bg-[var(--bg-hover)]"
          } ${snapshot.isDragging ? "opacity-50" : ""}`}
          style={{ 
            backgroundColor: isSelected ? "var(--accent-color)" : "transparent" 
          }}
        >
          {/* ドラッグハンドル */}
          {isDraggable && (
             <div className="mr-2 text-[var(--text-sub)] cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
               ⋮⋮
             </div>
          )}
          
          <span className="text-xl mr-3">{prompt.icon}</span>
          <div className="flex flex-col min-w-0 flex-1">
            {/* タイトル: 未選択時はテーマ変数を使用 */}
            <span className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-[var(--text-main)]"}`}>
              {prompt.title}
            </span>
            
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                {/* 入力フォーム: テーマ変数対応 */}
                <input 
                  ref={inputRef}
                  type="text"
                  readOnly
                  placeholder="Press Space..."
                  className={`text-xs border rounded px-2 py-1 w-32 outline-none text-center transition-colors ${
                    isRecording 
                      ? "bg-red-500/20 border-red-500 text-red-200 animate-pulse" 
                      : "bg-[var(--bg-sub)] border-[var(--border)] text-[var(--text-main)]"
                  }`}
                  value={isRecording ? "Press keys..." : (tempShortcut || "Press Space")}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    onShortcutUpdate(prompt.id, tempShortcut);
                    setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {/* 説明文: 未選択時はテーマ変数、選択時は白の半透明 */}
                <span className={`text-xs truncate ${isSelected ? "text-white/90" : "text-[var(--text-sub)]"}`}>
                  {prompt.desc}
                </span>
                
                {prompt.referenceUrl && !isSelected && (
                  <span className="absolute right-20 text-[10px] opacity-0 group-hover:opacity-50 text-[var(--text-sub)] mr-1">
                    🔗
                  </span>
                )}

                {/* ショートカットキー表示ボタン: テーマ変数対応 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempShortcut(prompt.shortcut || "");
                    setEditingId(prompt.id);
                  }}
                  className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                    prompt.shortcut 
                      ? "border-[var(--border)] text-[var(--text-sub)] bg-[var(--bg-sub)]" 
                      : "border-transparent text-transparent group-hover:text-[var(--text-sub)] group-hover:border-[var(--border)]"
                  }`}
                >
                  {prompt.shortcut || "Set Key"}
                </button>
              </div>
            )}
          </div>
        </li>
      )}
    </Draggable>
  );
};