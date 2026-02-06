type Props = {
    query: string;
    setQuery: (q: string) => void;
    onResetSelection: () => void;
  };
  
  export const SearchBar = ({ query, setQuery, onResetSelection }: Props) => {
    return (
      <div className="p-3 border-b border-[var(--border)]">
        <input
          autoFocus
          type="text"
          placeholder="Search prompts..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onResetSelection();
          }}
          className="w-full bg-transparent text-lg text-[var(--text-main)] placeholder:text-[var(--text-sub)] outline-none"
        />
      </div>
    );
  };