import { useState, useEffect, useRef } from "react";
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { ask } from '@tauri-apps/plugin-dialog';
import { usePrompts } from "./hooks/usePrompts";
import { useShortcuts } from "./hooks/useShortcuts";
import { executePrompt } from "./utils/action";
import { SearchBar } from "./components/SearchBar";
import { Footer } from "./components/Footer";
import { PromptItem } from "./components/PromptItem";
import { PromptModal } from "./components/PromptModal";
import { Prompt } from "./types";
import "./App.css";

function App() {
  const { prompts, addPrompt, updatePrompt, deletePrompt, reorderPrompts, updatePromptField } = usePrompts();  
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalData, setModalData] = useState<Prompt | undefined>(undefined);

  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useShortcuts(prompts);

  const filteredPrompts = prompts.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.desc.toLowerCase().includes(query.toLowerCase())
  );

  // ▼▼▼ Refで常に最新リストを保持 ▼▼▼
  const filteredPromptsRef = useRef(filteredPrompts);
  filteredPromptsRef.current = filteredPrompts;
  
  const isDraggable = query === "" && !editingId && !isModalOpen;

  const handleSelect = async (prompt: typeof prompts[0]) => {
    await executePrompt(prompt);
    setTimeout(() => {
      setQuery("");
      setSelectedIndex(0);
    }, 200);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderPrompts(result.source.index, result.destination.index);
    setSelectedIndex(result.destination.index);
  };

  // ★ キーボード操作ロジック
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ▼▼▼ ここが最重要修正！Refから最新リストを取得 ▼▼▼
      const currentList = filteredPromptsRef.current; 
      // ▲▲▲ これ以降は filteredPrompts ではなく currentList を使う

      if (isModalOpen) return;
      
      if (editingId) {
        if (e.key === "Escape") setEditingId(null);
        return;
      }

      // ▼ Cmd+N: 新規作成
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        e.stopPropagation();
        setModalMode("create");
        setModalData(undefined);
        setIsModalOpen(true);
        return;
      }

      // ▼ Cmd+E: 編集
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        e.stopPropagation();
        // ★ currentList を使用
        const target = currentList[selectedIndex];
        if (target) {
          setModalMode("edit");
          setModalData(target);
          setIsModalOpen(true);
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "Backspace" || e.key === "Delete" || e.code === "Backspace")) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const target = currentList[selectedIndex];
        
        if (target) {
          // ★ ask関数を使ってネイティブダイアログを表示
          // awaitを使うために、ここだけ即時実行関数(async)にする必要がありますが、
          // useEffect内なので .then() でつなぐのが一番簡単です。
          
          ask(`Are you sure you want to delete "${target.title}"?`, {
            title: 'Delete Prompt',
            kind: 'warning',
            okLabel: 'Delete',
            cancelLabel: 'Cancel'
          }).then((confirmed) => {
            if (confirmed) {
              deletePrompt(target.id);
              setSelectedIndex((prev) => Math.max(0, prev - 1));
              
              sendNotification({ 
                title: "Deleted",
                body: `Removed prompt: "${target.title}"` 
              });
            }
          });
        }
        return;
      }

      // ▼ Cmd+K: キー設定
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const target = currentList[selectedIndex]; // ★ currentList を使用
        if (target) setEditingId(target.id);
        return;
      }

      // 矢印キーなど
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = Math.min(prev + 1, currentList.length - 1); // ★ currentList を使用
          itemRefs.current[next]?.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = Math.max(prev - 1, 0);
          itemRefs.current[next]?.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "Enter") {
        if (e.isComposing) return;
        e.preventDefault();
        // ★ currentList を使用
        if (currentList[selectedIndex]) handleSelect(currentList[selectedIndex]);
      } else if (e.key === "Escape") {
        if (query.length > 0) setQuery("");
        else getCurrentWebviewWindow().hide();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
    
  // Refを使うので filteredPrompts は依存配列から外しても動きますが、念のため入れておいても害はありません
  }, [deletePrompt, query, selectedIndex, isModalOpen, editingId]); // filteredPrompts削除

  return (
    <div className="flex flex-col h-screen w-full bg-[#191919] text-white overflow-hidden border border-[#333]">
      <SearchBar 
        query={query} 
        setQuery={setQuery} 
        onResetSelection={() => setSelectedIndex(0)} 
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="prompts-list">
          {(provided) => (
            <ul 
              className="flex-1 overflow-y-auto p-2 space-y-1"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {filteredPrompts.map((prompt, index) => (
                <PromptItem
                  key={prompt.id}
                  index={index}
                  prompt={prompt}
                  isSelected={index === selectedIndex}
                  isDraggable={isDraggable}
                  isEditing={editingId === prompt.id}
                  setEditingId={setEditingId}
                  onSelect={() => handleSelect(prompt)}
                  onHover={() => setSelectedIndex(index)}
                  onShortcutUpdate={(id, key) => updatePromptField(id, "shortcut", key)}
                  innerRef={(el) => { itemRefs.current[index] = el; }}
                />
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      
      <PromptModal 
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={modalData}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          if (modalMode === "create") {
            addPrompt(data);
          } else {
            updatePrompt(data as Prompt);
          }
        }}
      />

      <Footer />
    </div>
  );
}

export default App;