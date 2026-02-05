import { useState, useEffect, useRef } from "react";
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';

import { usePrompts } from "./hooks/usePrompts";
import { useShortcuts } from "./hooks/useShortcuts";
import { executePrompt } from "./utils/action";
import { SearchBar } from "./components/SearchBar";
import { Footer } from "./components/Footer";
import { PromptItem } from "./components/PromptItem";
import "./App.css";

function App() {
  const { prompts, updatePromptShortcut, reorderPrompts } = usePrompts();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useShortcuts(prompts);

  const filteredPrompts = prompts.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.desc.toLowerCase().includes(query.toLowerCase())
  );
  
  const isDraggable = query === "" && !editingId;

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

  // ★ キーボード操作ロジック (ここを修正)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 編集中は、Esc以外の操作を PromptItem 側に任せる
      if (editingId) {
        if (e.key === "Escape") {
          setEditingId(null);
        }
        return;
      }

      // ▼ Cmd+K (または Ctrl+K) でショートカット設定モードへ
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const targetPrompt = filteredPrompts[selectedIndex];
        if (targetPrompt) {
          setEditingId(targetPrompt.id);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = Math.min(prev + 1, filteredPrompts.length - 1);
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
        if (filteredPrompts[selectedIndex]) {
          handleSelect(filteredPrompts[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        getCurrentWebviewWindow().hide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, editingId, filteredPrompts]);

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
                  onShortcutUpdate={updatePromptShortcut}
                  innerRef={(el) => { itemRefs.current[index] = el; }}
                />
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      
      <Footer />
    </div>
  );
}

export default App;