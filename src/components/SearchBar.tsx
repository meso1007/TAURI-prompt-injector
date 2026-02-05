type Props = {
    query: string;
    setQuery: (q: string) => void;
    onResetSelection: () => void;
  };
  
  export const SearchBar = ({ query, setQuery, onResetSelection }: Props) => {
    return (
      <div className="p-3 border-b border-[#333]">
        <input
          autoFocus
          type="text"
          placeholder="Search prompts..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onResetSelection();
          }}
          className="w-full bg-transparent text-lg text-white placeholder-neutral-500 outline-none"
        />
      </div>
    );
  };