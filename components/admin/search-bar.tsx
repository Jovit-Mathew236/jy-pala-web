type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full p-3 rounded-full border border-input bg-background"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
