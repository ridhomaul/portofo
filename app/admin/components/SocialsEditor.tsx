"use client";

export type Social = { label: string; href: string };

type Props = {
  items: Social[];
  onChange: (items: Social[]) => void;
};

export function SocialsEditor({ items, onChange }: Props) {
  const update = (i: number, patch: Partial<Social>) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { label: "", href: "" }]);

  return (
    <div className="flex flex-col gap-1.5 text-sm sm:col-span-2">
      <span className="text-text-secondary">Socials</span>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label (mis. GitHub)"
              className="w-32 rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
            />
            <input
              type="text"
              value={item.href}
              onChange={(e) => update(i, { href: e.target.value })}
              placeholder="https://..."
              className="flex-1 rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-xs text-red-600 transition-opacity hover:opacity-70 dark:text-red-400"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-1 self-start rounded-full border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        + Tambah social
      </button>
    </div>
  );
}
