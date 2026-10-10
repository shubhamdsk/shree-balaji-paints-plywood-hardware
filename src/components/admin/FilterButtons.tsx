interface FilterButtonsProps<T extends string> {
  filters: { value: T; label: string; count: number }[];
  value: T;
  onChange: (value: T) => void;
}

export default function FilterButtons<T extends string>({ filters, value, onChange }: FilterButtonsProps<T>) {
  return (
    <div role="group" aria-label="Show" className="flex flex-wrap items-end gap-1.5">
      {filters.map((f) => (
        <button
          key={f.value}
          type="button"
          aria-pressed={value === f.value}
          onClick={() => onChange(f.value)}
          className={`min-h-11 rounded-xl px-3 text-sm font-bold transition ${
            value === f.value ? "bg-heading text-card" : "border border-line bg-card text-heading hover:bg-surface-muted"
          }`}
        >
          {f.label} <span className="font-extrabold">{f.count}</span>
        </button>
      ))}
    </div>
  );
}
