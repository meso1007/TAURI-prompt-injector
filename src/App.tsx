import { useState, useEffect, useRef, useCallback } from "react";
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
import { PromptDetailModal } from "./components/PromptDetailModal";
import { SettingsModal } from "./components/SettingsModal";
import { useSettings } from "./contexts/SettingsContext";
import { Prompt } from "./types";
import "./App.css";

function App() {
  const { prompts, addPrompt, updatePrompt, deletePrompt, reorderPrompts, updatePromptField } = usePrompts();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<Prompt | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalData, setModalData] = useState<Prompt | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  useSettings();

  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useShortcuts(prompts);

  const filteredPrompts = prompts.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPromptsRef = useRef(filteredPrompts);
  filteredPromptsRef.current = filteredPrompts;

  const isDraggable = query === "" && !editingId && !isModalOpen;

  // ★ New: Function to check for shortcut conflicts
  const checkConflict = useCallback((shortcut: string, excludeId?: string) => {
    if (!shortcut) return undefined;
    return prompts.find(p => p.shortcut === shortcut && p.id !== excludeId);
  }, [prompts]);

  const handleSelect = async (prompt: typeof prompts[0]) => {
    await executePrompt(prompt);
    // Hide window after execution
    await getCurrentWebviewWindow().hide(); 
    
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

  // Keyboard navigation logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentList = filteredPromptsRef.current;

      if (isModalOpen || isDetailOpen) {
        if (isDetailOpen && e.key === "Escape") {
          setIsDetailOpen(false);
        }
        return;
      }
      
      if (editingId) {
        if (e.key === "Escape") setEditingId(null);
        return;
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setIsSettingsOpen(true);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        e.stopPropagation();
        setModalMode("create");
        setModalData(undefined);
        setIsModalOpen(true);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        e.stopPropagation();
        const target = currentList[selectedIndex];
        if (target) {
          setModalMode("edit");
          setModalData(target);
          setIsModalOpen(true);
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault();
        const target = currentList[selectedIndex];
        if (target) {
          setDetailData(target);
          setIsDetailOpen(true);
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === "Backspace" || e.key === "Delete" || e.code === "Backspace")) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const target = currentList[selectedIndex];

        if (target) {
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

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const target = currentList[selectedIndex];
        if (target) setEditingId(target.id);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = Math.min(prev + 1, currentList.length - 1);
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
        if (currentList[selectedIndex]) handleSelect(currentList[selectedIndex]);
      } 
      else if (e.key === "Escape") {
        if (query.length > 0) setQuery("");
        else getCurrentWebviewWindow().hide();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });

  }, [deletePrompt, query, selectedIndex, isModalOpen, editingId, isDetailOpen, isSettingsOpen]);

  return (
    <div className="h-screen w-full bg-transparent flex flex-col font-sans">
      <div className="flex flex-col h-full w-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden rounded-xl border border-[var(--border)] shadow-2xl">
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
                    checkConflict={checkConflict} // ★ Passed here
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
          checkConflict={checkConflict} // ★ Passed here
          onSave={(data) => {
            if (modalMode === "create") {
              addPrompt(data);
            } else {
              updatePrompt(data as Prompt);
            }
          }}
        />

        <PromptDetailModal
          isOpen={isDetailOpen}
          prompt={detailData}
          onClose={() => setIsDetailOpen(false)}
        />
        
        <SettingsModal
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
        />
        
        <Footer />
      </div>
    </div>
  );
}

export default App;