export const Footer = () => {
    return (
      <div className="px-3 py-2 border-t border-[#333] bg-[#1e1e1e] flex justify-end gap-4 text-[10px] text-neutral-500 font-medium">
        <div className="flex items-center gap-1">
          <span className="bg-[#333] px-1.5 py-0.5 rounded text-neutral-300">↵</span>
          <span>to copy</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="bg-[#333] px-1.5 py-0.5 rounded text-neutral-300">⌘K</span>
          <span>to set key</span>
        </div>
      </div>
    );
  };