import { Draggable } from '@hello-pangea/dnd';
import { Prompt } from "../types";
import { useState, useEffect, useRef } from 'react';

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

// src/components/PromptItem.tsx

// キーイベントをTauriのショートカット文字列に変換する関数
const getShortcutFromEvent = (e: React.KeyboardEvent): string | null => {
    const modifiers = [];
    if (e.metaKey) modifiers.push("Command"); // MacのCommand
    if (e.ctrlKey) modifiers.push("Control");
    if (e.altKey) modifiers.push("Alt"); // MacのOption
    if (e.shiftKey) modifiers.push("Shift");
  
    // 修飾キー単体（Cmdだけ、Optionだけなど）は無視
    if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) {
      return null;
    }
  
    // Backspace/Deleteなら設定クリア
    if (e.key === "Backspace" || e.key === "Delete") {
      return "";
    }
  
    // ★ここが修正ポイント！
    // e.key (文字) ではなく e.code (物理キー) を使うことで "˚" を回避
    let key = e.code; 
  
    // e.code は "KeyK", "Digit1", "Space" のような名前なので整形する
    if (key.startsWith("Key")) {
      key = key.replace("Key", ""); // "KeyK" -> "K"
    } else if (key.startsWith("Digit")) {
      key = key.replace("Digit", ""); // "Digit1" -> "1"
    } else if (key === "Space") {
      key = "Space";
    } else {
      // 矢印キーなどは e.key を使う方が安全な場合もあるが、基本は e.code でOK
      // 必要に応じて調整
    }
  
    // ファンクションキーの対応 (F1~F12)
    if (key.match(/^F[0-9]+$/)) {
      // そのまま
    }
  
    // 修飾キーと組み合わせる
    if (modifiers.length > 0) {
      return [...modifiers, key].join("+");
    }
    
    // 単体キー（修飾キーなし）も許可する場合
    return key;
  };
export const PromptItem = ({ 
  prompt, index, isSelected, isDraggable, onSelect, onHover, 
  onShortcutUpdate, setEditingId, isEditing, innerRef 
}: Props) => {
  const [tempShortcut, setTempShortcut] = useState(prompt.shortcut || "");
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 編集モードが終了したらレコーディングも終了
  useEffect(() => {
    if (!isEditing) {
      setIsRecording(false);
    } else {
      // 編集開始時にフォーカス
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // 親のリスト操作（矢印キーなど）を無効化
    e.preventDefault();  // 文字入力を防ぐ

    // Enter: 確定
    if (e.key === "Enter") {
      onShortcutUpdate(prompt.id, tempShortcut);
      setEditingId(null);
      return;
    }
    
    // Escape: キャンセル (変更を破棄して閉じる)
    if (e.key === "Escape") {
      setEditingId(null);
      return;
    }

    // レコーディング中でなければ、Spaceでレコーディング開始
    if (!isRecording) {
      if (e.key === " " || e.code === "Space") {
        setIsRecording(true);
      }
      return;
    }

    // レコーディング中の処理
    const shortcut = getShortcutFromEvent(e);
    if (shortcut !== null) {
      // ショートカットが生成できたらセットして、レコーディング終了
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
          onClick={() => !isEditing && onSelect()}
          onMouseEnter={() => !isEditing && onHover()}
          className={`flex items-center px-3 py-3 rounded-md transition-colors duration-75 select-none group ${
            isSelected
              ? "bg-[#2F7AF6] text-white"
              : "text-neutral-300 hover:bg-[#2a2a2a]"
          } ${snapshot.isDragging ? "opacity-50" : ""}`}
        >
          {/* ドラッグハンドル */}
          {isDraggable && (
             <div className="mr-2 text-neutral-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
               ⋮⋮
             </div>
          )}
          
          <span className="text-xl mr-3">{prompt.icon}</span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-neutral-200"}`}>
              {prompt.title}
            </span>
            
            {/* 編集モード or 表示モード */}
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <input 
                  ref={inputRef}
                  type="text"
                  readOnly
                  placeholder="Press Space..."
                  className={`text-xs border rounded px-2 py-1 w-32 outline-none text-center transition-colors ${
                    isRecording 
                      ? "bg-red-500/20 border-red-500 text-red-200 animate-pulse" 
                      : "bg-black/30 border-blue-400 text-white"
                  }`}
                  value={isRecording ? "Press keys..." : (tempShortcut || "Press Space")}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    // フォーカスが外れたら保存して終了
                    onShortcutUpdate(prompt.id, tempShortcut);
                    setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className={`text-xs truncate ${isSelected ? "text-blue-100" : "text-neutral-500"}`}>
                  {prompt.desc}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempShortcut(prompt.shortcut || "");
                    setEditingId(prompt.id);
                  }}
                  className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                    prompt.shortcut 
                      ? "border-neutral-500 text-neutral-300 bg-neutral-800/50" 
                      : "border-transparent text-transparent group-hover:text-neutral-500 group-hover:border-neutral-700"
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