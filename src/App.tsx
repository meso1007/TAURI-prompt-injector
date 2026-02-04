import { useState, useEffect, useRef } from "react";
import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import "./App.css";

// デフォルトのデータ (初回起動時やリセット用)
const DEFAULT_PROMPTS = [
  {
    id: "cot",
    icon: "🧠",
    title: "Chain of Thought",
    desc: "Solve step-by-step logic.",
    content: "You are an expert in logical reasoning.\n\n# INSTRUCTION\nSolve the following problem step-by-step. Do not jump to the conclusion. Explicitly state the rationale for each step.\n\n# PROBLEM\n{{selection}}\n\n# OUTPUT\nLet's think step by step:"
  },
  {
    id: "review",
    icon: "🛡️",
    title: "Senior Engineer Review",
    desc: "Security & Performance fix.",
    content: "Act as a Principal Software Engineer.\n\n# INSTRUCTION\nReview the code below. Focus strictly on:\n1. **Security** (Vulnerabilities)\n2. **Performance** (Time/Space complexity)\n3. **Maintainability** (SOLID, DRY)\n\n# CODE\n```\n{{selection}}\n```"
  },
  {
    id: "explain",
    icon: "👶",
    title: "ELI5 Explanation",
    desc: "Explain like I'm 12.",
    content: "Explain the following concept to a smart 12-year-old.\n- Use simple language.\n- Use a concrete analogy.\n\n# CONCEPT\n{{selection}}"
  },
  {
    id: "academic",
    icon: "🎓",
    title: "Academic Polisher",
    desc: "Rewrite for formal paper.",
    content: "Rewrite the text for a top-tier academic journal (Nature/IEEE).\n- Remove ambiguity.\n- Use precise terminology.\n- Ensure logical flow.\n\n# TEXT\n{{selection}}"
  }
];

function App() {
  // 1. LocalStorageからデータを読み込む (なければデフォルト)
  const [prompts, setPrompts] = useState(() => {
    const saved = localStorage.getItem("tsuchi-prompts");
    return saved ? JSON.parse(saved) : DEFAULT_PROMPTS;
  });

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // 2. データが変更されたら LocalStorage に保存する
  useEffect(() => {
    localStorage.setItem("tsuchi-prompts", JSON.stringify(prompts));
  }, [prompts]);

  // 検索フィルタ
  const filteredPrompts = prompts.filter((p: any) => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.desc.toLowerCase().includes(query.toLowerCase())
  );

  // ドラッグ可能な状態か？ (検索中はドラッグ禁止)
  const isDraggable = query === "";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [selectedIndex, filteredPrompts]);

  const handleSelect = async (prompt: typeof DEFAULT_PROMPTS[0]) => {
    try {
      const userClipboard = await readText();
      const finalContent = prompt.content.replace("{{selection}}", userClipboard || "");
      await writeText(finalContent);
      await getCurrentWebviewWindow().hide();
      console.log("Copied with injection:", prompt.title);
      setTimeout(() => {
        setQuery("");
        setSelectedIndex(0);
      }, 200);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // ドラッグ終了時の処理
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    // 配列の並び替え
    const items = Array.from(prompts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPrompts(items);
    setSelectedIndex(result.destination.index); // 選択位置も追従させる
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#191919] text-white overflow-hidden border border-[#333]">
      <div className="p-3 border-b border-[#333]">
        <input
          autoFocus
          type="text"
          placeholder="Search prompts..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          className="w-full bg-transparent text-lg text-white placeholder-neutral-500 outline-none"
        />
      </div>

      {/* DnD コンテキスト */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="prompts-list">
          {(provided) => (
            <ul 
              className="flex-1 overflow-y-auto p-2 space-y-1"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {filteredPrompts.map((prompt: any, index: number) => (
                <Draggable 
                  key={prompt.id} 
                  draggableId={prompt.id} 
                  index={index}
                  isDragDisabled={!isDraggable} // 検索中はドラッグ禁止
                >
                  {(provided, snapshot) => (
                    <li
                      ref={(el) => {
                        provided.innerRef(el);
                        itemRefs.current[index] = el;
                      }}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => handleSelect(prompt)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      style={{ ...provided.draggableProps.style }} // DnDのスタイル適用に必須
                      className={`flex items-center px-3 py-3 rounded-md cursor-pointer transition-colors duration-75 select-none ${
                        index === selectedIndex
                          ? "bg-[#2F7AF6] text-white"
                          : "text-neutral-300 hover:bg-[#2a2a2a]"
                      } ${snapshot.isDragging ? "opacity-50" : ""}`} // ドラッグ中の見た目
                    >
                      {/* ドラッグハンドルのアイコン (検索中以外表示) */}
                      {isDraggable && (
                         <div className="mr-2 text-neutral-600 cursor-grab active:cursor-grabbing">
                           ⋮⋮
                         </div>
                      )}
                      
                      <span className="text-xl mr-3">{prompt.icon}</span>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-semibold truncate ${index === selectedIndex ? "text-white" : "text-neutral-200"}`}>
                          {prompt.title}
                        </span>
                        <span className={`text-xs truncate ${index === selectedIndex ? "text-blue-100" : "text-neutral-500"}`}>
                          {prompt.desc}
                        </span>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {filteredPrompts.length === 0 && (
                <div className="flex items-center justify-center h-20 text-neutral-500 text-sm">
                  No prompts found
                </div>
              )}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      
      <div className="px-3 py-2 border-t border-[#333] bg-[#1e1e1e] flex justify-end gap-3 text-[10px] text-neutral-500">
        <div className="flex items-center gap-1">
          <span className="bg-[#333] px-1 rounded">↵</span>
          <span>to copy</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="bg-[#333] px-1 rounded">Esc</span>
          <span>to close</span>
        </div>
      </div>
    </div>
  );
}

export default App;