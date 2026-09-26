"use client";

type Props = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  className?: string;
};

// Daftar string dengan tambah/hapus per baris (tech, points, dst) —
// bukan satu textarea dipisah koma.
export function StringListEditor({ label, items, onChange, placeholder, className }: Props) {
  const updateItem = (i: number, value: string) => {
    onChange(items.map((item, idx) => (idx === i ? value : item)));
  };
  const removeItem = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
  };
  const addItem = () => {
    onChange([...items, ""]);
  };

  return (
    <div className={`flex flex-col gap-1.5 text-sm ${className ?? "sm:col-span-2"}`}>
      <span className="text-text-secondary">{label}</span>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-xs text-red-600 transition-opacity hover:opacity-70 dark:text-red-400"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-1 self-start rounded-full border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        + Tambah
      </button>
    </div>
  );
}
