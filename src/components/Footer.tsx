export const Footer = () => {
    return (
      <div className="h-8 border-t border-[#333] bg-[#222] flex items-center justify-between px-3 text-[10px] text-neutral-500 select-none font-medium">
        {/* 左側：基本操作 */}
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <span className="font-sans text-neutral-400">↑↓</span> 
            <span>Nav</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-sans text-neutral-400">↵</span> 
            <span>Copy</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-sans text-neutral-400">⌥Click</span> 
            <span>Open Link</span>
          </div>
        </div>
  
        {/* 右側：管理操作 */}
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <span className="font-sans text-neutral-400">⌘N</span> 
            <span>New</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-sans text-neutral-400">⌘E</span> 
            <span>Edit</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-sans text-neutral-400">⌘K</span> 
            <span>Set Key</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-sans text-neutral-400">⌘⌫</span> 
            <span>Del</span>
          </div>
        </div>
      </div>
    );
  };