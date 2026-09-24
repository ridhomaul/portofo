"use client";

type Props = {
  stack: Record<string, string[]>;
  onChange: (stack: Record<string, string[]>) => void;
};

// Kategori stack (Frontend, Backend, dst), tiap kategori punya daftar
// tool. Nama kategori diedit lewat onBlur (uncontrolled input) supaya
// key objeknya tidak berubah di setiap keystroke.
export function StackEditor({ stack, onChange }: Props) {
  const categories = Object.keys(stack);

  const renameCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName || trimmed in stack) return;
    const entries = Object.entries(stack).map(([k, v]): [string, string[]] => (k === oldName ? [trimmed, v] : [k, v]));
    onChange(Object.fromEntries(entries));
  };

  const removeCategory = (name: string) => {
    const next = { ...stack };
    delete next[name];
    onChange(next);
  };

  const addCategory = () => {
    let name = "Kategori baru";
    let i = 1;
    while (name in stack) {
      i += 1;
      name = `Kategori baru ${i}`;
    }
    onChange({ ...stack, [name]: [] });
  };

  const updateTool = (cat: string, i: number, value: string) => {
    onChange({ ...stack, [cat]: stack[cat].map((t, idx) => (idx === i ? value : t)) });
  };

  const removeTool = (cat: string, i: number) => {
    onChange({ ...stack, [cat]: stack[cat].filter((_, idx) => idx !== i) });
  };

  const addTool = (cat: string) => {
    onChange({ ...stack, [cat]: [...stack[cat], ""] });
  };

  return (
    <div className="flex flex-col gap-4">
      {categories.map((cat) => (
        <div key={cat} className="rounded-(--radius) border border-border p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              defaultValue={cat}
              onBlur={(e) => renameCategory(cat, e.target.value)}
              className="flex-1 rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-sm font-medium text-text-primary outline-none focus-visible:border-text-primary"
            />
            <button
              type="button"
              onClick={() => removeCategory(cat)}
              className="text-xs text-red-600 transition-opacity hover:opacity-70 dark:text-red-400"
            >
              Hapus kategori
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {stack[cat].map((tool, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={tool}
                  onChange={(e) => updateTool(cat, i, e.target.value)}
                  className="flex-1 rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-sm text-text-primary outline-none focus-visible:border-text-primary"
                />
                <button
                  type="button"
                  onClick={() => removeTool(cat, i)}
                  className="text-xs text-red-600 transition-opacity hover:opacity-70 dark:text-red-400"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addTool(cat)}
            className="mt-2 self-start rounded-full border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
          >
            + Tambah tool
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addCategory}
        className="self-start rounded-full border border-border px-4 py-2 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        + Tambah kategori
      </button>
    </div>
  );
}
